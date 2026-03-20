import sqlite3
import os
import asyncio
from contextlib import asynccontextmanager
from datetime import date
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from litellm import acompletion

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite3")
MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

# Guides the conversational reply — no JSON constraints
CHAT_SYSTEM_PROMPT = f"""You are a friendly legal document assistant helping users draft a Mutual Non-Disclosure Agreement (MNDA).

Your job is to have a natural conversation to collect these details:
- The purpose of the NDA (how confidential information may be used)
- Party 1 and Party 2: full name, job title, company, and notice address (email or postal)
- Agreement start date (today is {date.today().isoformat()} if not specified)
- MNDA term: fixed duration (how many years) or open-ended until terminated
- Confidentiality term: fixed duration (how many years) or perpetual
- Governing law (US state) and jurisdiction (courts location)
- Any modifications to standard terms (optional)

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download."""

# Focused purely on extracting structured field values from a single message
EXTRACT_SYSTEM_PROMPT = f"""Extract NDA field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields the user explicitly mentioned. Leave everything else null.

Fields to extract:
- purpose: how confidential info may be used
- effectiveDate: agreement start date (YYYY-MM-DD format)
- mndaTermType: "expires" or "until_terminated"
- mndaTermYears: integer years (when mndaTermType is "expires")
- confidentialityTermType: "years" or "perpetuity"
- confidentialityTermYears: integer years (when confidentialityTermType is "years")
- governingLaw: US state name
- jurisdiction: courts location string
- modifications: optional amendment text
- party1Name, party1Title, party1Company, party1NoticeAddress
- party2Name, party2Title, party2Company, party2NoticeAddress"""


class ChatMessage(BaseModel):
    role: str
    content: str


class FieldUpdates(BaseModel):
    purpose: Optional[str] = None
    effectiveDate: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "until_terminated"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["years", "perpetuity"]] = None
    confidentialityTermYears: Optional[int] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None
    modifications: Optional[str] = None
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Company: Optional[str] = None
    party1NoticeAddress: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Company: Optional[str] = None
    party2NoticeAddress: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    fields: FieldUpdates


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict


def init_db():
    conn = sqlite3.connect(DB_PATH)
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="PreLegal API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    chat_messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    chat_messages += [{"role": m.role, "content": m.content} for m in request.messages]

    extract_messages = [
        {"role": "system", "content": EXTRACT_SYSTEM_PROMPT},
        {"role": "user", "content": request.messages[-1].content},
    ]

    try:
        # Run reply generation and field extraction in parallel
        reply_task = acompletion(model=MODEL, messages=chat_messages, extra_body=EXTRA_BODY)
        extract_task = acompletion(
            model=MODEL,
            messages=extract_messages,
            response_format=FieldUpdates,
            extra_body=EXTRA_BODY,
        )
        reply_response, extract_response = await asyncio.gather(reply_task, extract_task)

        reply = reply_response.choices[0].message.content
        fields = FieldUpdates.model_validate_json(extract_response.choices[0].message.content)

        return ChatResponse(reply=reply, fields=fields)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
