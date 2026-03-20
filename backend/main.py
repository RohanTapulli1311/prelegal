import sqlite3
import os
from contextlib import asynccontextmanager
from datetime import date
from typing import Optional, Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from litellm import completion

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

DB_PATH = os.path.join(os.path.dirname(__file__), "db.sqlite3")
MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SYSTEM_PROMPT = f"""You are a legal document assistant helping users draft a Mutual Non-Disclosure Agreement (MNDA) using the CommonPaper standard.

Your goal is to collect the following fields through a friendly, conversational interview:
- purpose: How confidential information may be used
- effectiveDate: Agreement start date in YYYY-MM-DD format (today is {date.today().isoformat()} if not specified)
- mndaTermType: "expires" for a fixed-term agreement or "until_terminated" for open-ended
- mndaTermYears: Number of years (only relevant when mndaTermType is "expires")
- confidentialityTermType: "years" for fixed duration or "perpetuity" for indefinite
- confidentialityTermYears: Number of years (only relevant when confidentialityTermType is "years")
- governingLaw: US state name (e.g. "Delaware")
- jurisdiction: Courts location (e.g. "courts located in New Castle County, DE")
- party1Name, party1Title, party1Company, party1NoticeAddress: First signer details
- party2Name, party2Title, party2Company, party2NoticeAddress: Second signer details
- modifications: Optional amendments to standard terms (often left blank)

Guidelines:
- Ask 1-2 questions at a time in a natural, friendly tone
- Progress systematically through the fields — start with purpose, then parties, then legal terms
- Extract any field values the user mentions in their latest message
- Only include fields in your response that the user explicitly provided
- When all fields are collected, let the user know the document is ready to download
"""


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
def chat(request: ChatRequest):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += [{"role": m.role, "content": m.content} for m in request.messages]

    try:
        response = completion(
            model=MODEL,
            messages=messages,
            response_format=ChatResponse,
            reasoning_effort="low",
            extra_body=EXTRA_BODY,
        )
        result = response.choices[0].message.content
        return ChatResponse.model_validate_json(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
