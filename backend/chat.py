import asyncio
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from litellm import acompletion

from auth import get_current_user
from documents import upsert_document
from models import ChatRequest, ChatResponse, GenericFieldUpdates, SelectionExtract

router = APIRouter()

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}

SUPPORTED_DOCUMENTS = """
Supported document types (use exact slugs when suggesting):
- mutual-nda: Mutual Non-Disclosure Agreement
- mutual-nda-coverpage: Mutual NDA Cover Page
- csa: Cloud Service Agreement
- sla: Service Level Agreement
- design-partner: Design Partner Agreement
- psa: Professional Services Agreement
- dpa: Data Processing Agreement
- partnership: Partnership Agreement
- software-license: Software License Agreement
- pilot: Pilot Agreement
- baa: Business Associate Agreement
- ai-addendum: AI Addendum
"""

SELECTION_CHAT_PROMPT = f"""You are a helpful legal document assistant. Today is {date.today().isoformat()}.

{SUPPORTED_DOCUMENTS}

Help the user identify which legal document they need. Ask clarifying questions if needed.
When you know which document type the user needs, tell them clearly and encourage them to click the document card to start creating it.

If the user asks for a document type not in the supported list (like an employment contract, shareholder agreement, etc.),
explain that we don't currently support that document type. Suggest the closest available document from our supported list that might meet their needs.

Be friendly, concise, and helpful. Ask 1-2 questions at a time."""

SELECTION_EXTRACT_PROMPT = f"""Extract which document type the user is asking for from their message.

{SUPPORTED_DOCUMENTS}

Return the exact slug if the user is clearly asking for one of these document types, or null if unclear.
Only populate suggested_document_type if you are confident."""

DOCUMENT_CONFIGS: dict[str, dict] = {
    "mutual-nda": {
        "valid_fields": {"purpose", "effectiveDate", "mndaTermType", "mndaTermYears", "confidentialityTermType", "confidentialityTermYears", "governingLaw", "jurisdiction", "modifications", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Mutual Non-Disclosure Agreement (MNDA). Today is {date.today().isoformat()}.

Your job is to have a natural conversation to collect these details:
- The purpose of the NDA (how confidential information may be used)
- Party 1 and Party 2: full name, job title, company, and notice address (email or postal)
- Agreement start date
- MNDA term: fixed duration (how many years) or open-ended until terminated
- Confidentiality term: fixed duration (how many years) or perpetual
- Governing law (US state) and jurisdiction (courts location)
- Any modifications to standard terms (optional)

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract NDA field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- purpose: how confidential info may be used
- effectiveDate: agreement start date (YYYY-MM-DD format)
- mndaTermType: "expires" or "until_terminated"
- mndaTermYears: integer years (when mndaTermType is "expires")
- confidentialityTermType: "years" or "perpetuity"
- confidentialityTermYears: integer years
- governingLaw: US state name
- jurisdiction: courts location string
- modifications: optional amendment text
- party1Name, party1Title, party1Company, party1NoticeAddress
- party2Name, party2Title, party2Company, party2NoticeAddress""",
    },
    "mutual-nda-coverpage": {
        "valid_fields": {"effectiveDate", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users create a cover page for their Mutual NDA. Today is {date.today().isoformat()}.

Your job is to collect these details:
- Party 1 and Party 2: full name, job title, company, and notice address
- Agreement effective date
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their cover page is ready.""",
        "extract_prompt": f"""Extract cover page field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress
- party2Name, party2Title, party2Company, party2NoticeAddress""",
    },
    "csa": {
        "valid_fields": {"effectiveDate", "subscriptionPeriod", "fees", "paymentProcess", "generalCapAmount", "governingLaw", "jurisdiction", "modifications", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Cloud Service Agreement (CSA). Today is {date.today().isoformat()}.

Party 1 is the Provider (the company offering the cloud service). Party 2 is the Customer.

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date
- Subscription period and fees
- Payment process and billing terms
- General liability cap amount
- Governing law (US state) and jurisdiction
- Any modifications to standard terms (optional)

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Cloud Service Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- subscriptionPeriod: subscription duration or renewal terms
- fees: subscription pricing or fee structure
- paymentProcess: billing and payment method description
- generalCapAmount: liability cap amount
- governingLaw: US state name
- jurisdiction: courts location string
- modifications: optional amendment text
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer)""",
    },
    "sla": {
        "valid_fields": {"effectiveDate", "term", "endDate", "targetUptime", "targetResponseTime", "supportChannel", "uptimeCredit", "responseTimeCredit", "scheduledDowntime", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Service Level Agreement (SLA). Today is {date.today().isoformat()}.

Party 1 is the Provider. Party 2 is the Customer.

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date and term/end date
- Target uptime percentage (e.g., 99.9%)
- Target response time for support requests
- Support channel (e.g., email, ticketing system)
- Credits for uptime failures and response time failures
- Scheduled downtime policy
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Service Level Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- term: agreement duration description
- endDate: agreement end date (YYYY-MM-DD format)
- targetUptime: uptime percentage commitment (e.g., "99.9%")
- targetResponseTime: support response time commitment
- supportChannel: how customers submit support requests
- uptimeCredit: credits issued for uptime failures
- responseTimeCredit: credits issued for response time failures
- scheduledDowntime: scheduled maintenance window policy
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer)""",
    },
    "design-partner": {
        "valid_fields": {"effectiveDate", "term", "endDate", "programDescription", "fees", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Design Partner Agreement. Today is {date.today().isoformat()}.

Party 1 is the Provider (the company offering the pre-release product). Party 2 is the Partner (design partner providing feedback).

Your job is to collect these details:
- Provider and Partner: full name, job title, company, and notice address
- Agreement effective date and term/end date
- Description of the design partner program (what product/features are being evaluated)
- Fees (if any — often zero for design partners)
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Design Partner Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- term: agreement duration description
- endDate: agreement end date (YYYY-MM-DD format)
- programDescription: description of the design partner program and product being evaluated
- fees: any fees (often $0 or "no charge")
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider)
- party2Name, party2Title, party2Company, party2NoticeAddress (Partner)""",
    },
    "psa": {
        "valid_fields": {"effectiveDate", "term", "endDate", "deliverables", "fees", "paymentPeriod", "paymentProcess", "customerObligations", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Professional Services Agreement (PSA). Today is {date.today().isoformat()}.

Party 1 is the Provider (the company delivering the services). Party 2 is the Customer.

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date and term/end date
- Description of deliverables (what services will be delivered)
- Fees and payment terms
- Payment period (e.g., net 30)
- Customer obligations (what the customer must provide or do)
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Professional Services Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- term: agreement duration description
- endDate: agreement end date (YYYY-MM-DD format)
- deliverables: description of services and deliverables
- fees: fee amount or structure
- paymentPeriod: payment timing (e.g., "net 30")
- paymentProcess: billing and payment method
- customerObligations: what the customer must provide or do
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer)""",
    },
    "dpa": {
        "valid_fields": {"effectiveDate", "dataCategories", "dataSubjectCategories", "processingPurpose", "processingDuration", "approvedSubprocessors", "governingMemberState", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Data Processing Agreement (DPA). Today is {date.today().isoformat()}.

Party 1 is the Provider (the data processor). Party 2 is the Customer (the data controller).

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date
- Categories of personal data being processed
- Categories of data subjects (whose data is processed)
- Purposes for processing the data
- Duration of processing
- Approved subprocessors (if any)
- Governing EU member state (for GDPR standard contractual clauses)
- Governing law and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Data Processing Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- dataCategories: categories of personal data processed
- dataSubjectCategories: categories of people whose data is processed
- processingPurpose: purpose for which data is processed
- processingDuration: how long data will be processed
- approvedSubprocessors: list of approved subprocessors
- governingMemberState: EU member state governing SCCs
- governingLaw: governing law (state or country)
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider/Processor)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer/Controller)""",
    },
    "partnership": {
        "valid_fields": {"effectiveDate", "term", "endDate", "territory", "obligations", "fees", "paymentProcess", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Partnership Agreement. Today is {date.today().isoformat()}.

Party 1 is the Company. Party 2 is the Partner.

Your job is to collect these details:
- Company and Partner: full name, job title, company name, and notice address
- Agreement effective date and term/end date
- Territory covered by the partnership
- Obligations of each party
- Fees or revenue sharing terms (if any)
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Partnership Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- term: agreement duration description
- endDate: agreement end date (YYYY-MM-DD format)
- territory: geographic territory covered
- obligations: party obligations and responsibilities
- fees: fees or revenue sharing terms
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Company)
- party2Name, party2Title, party2Company, party2NoticeAddress (Partner)""",
    },
    "software-license": {
        "valid_fields": {"effectiveDate", "term", "endDate", "permittedUses", "licenseLimits", "fees", "paymentProcess", "generalCapAmount", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Software License Agreement. Today is {date.today().isoformat()}.

Party 1 is the Provider (the licensor). Party 2 is the Customer (the licensee).

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date and term/end date
- Permitted uses of the software
- License limits (e.g., number of users, seats, or instances)
- Fees and payment terms
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Software License Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- term: agreement duration description
- endDate: agreement end date (YYYY-MM-DD format)
- permittedUses: allowed uses of the licensed software
- licenseLimits: restrictions on license scope (users, seats, instances)
- fees: license fees
- paymentProcess: billing and payment method
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider/Licensor)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer/Licensee)""",
    },
    "pilot": {
        "valid_fields": {"effectiveDate", "pilotPeriod", "fees", "generalCapAmount", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Pilot Agreement. Today is {date.today().isoformat()}.

Party 1 is the Provider. Party 2 is the Customer evaluating the software.

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date
- Pilot period duration (how long the evaluation will last)
- Fees (if any — pilots are often free)
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Pilot Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- pilotPeriod: duration of the pilot evaluation period
- fees: fees for the pilot (often $0 or "no charge")
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer)""",
    },
    "baa": {
        "valid_fields": {"effectiveDate", "parentAgreement", "breachNotificationPeriod", "limitations", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft a Business Associate Agreement (BAA). Today is {date.today().isoformat()}.

Party 1 is the Provider (the business associate handling PHI). Party 2 is the Company (the HIPAA covered entity).

Your job is to collect these details:
- Provider and Company: full name, job title, company, and notice address
- Agreement effective date
- Reference to the parent agreement this BAA supplements
- Breach notification period (how many days to report a breach)
- Any limitations on PHI use
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract Business Associate Agreement field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- parentAgreement: name or description of the master agreement this BAA supplements
- breachNotificationPeriod: days within which a breach must be reported
- limitations: any limitations on PHI use or disclosure
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider/Business Associate)
- party2Name, party2Title, party2Company, party2NoticeAddress (Company/Covered Entity)""",
    },
    "ai-addendum": {
        "valid_fields": {"effectiveDate", "trainingData", "trainingPurposes", "trainingRestrictions", "improvementRestrictions", "governingLaw", "jurisdiction", "party1Name", "party1Title", "party1Company", "party1NoticeAddress", "party2Name", "party2Title", "party2Company", "party2NoticeAddress"},
        "chat_prompt": f"""You are a friendly legal document assistant helping users draft an AI Addendum. Today is {date.today().isoformat()}.

Party 1 is the Provider (the company offering the AI-powered service). Party 2 is the Customer.

Your job is to collect these details:
- Provider and Customer: full name, job title, company, and notice address
- Agreement effective date
- Whether customer data may be used for AI model training
- Permitted purposes for any training data use
- Restrictions on using customer data for training
- Restrictions on using outputs for model improvement
- Governing law (US state) and jurisdiction

Ask 1-2 questions at a time. Be concise and conversational. When all fields are collected, tell the user their document is ready to download.""",
        "extract_prompt": f"""Extract AI Addendum field values from the user's message. Today is {date.today().isoformat()}.

Only populate fields explicitly mentioned. Leave everything else null.

Fields to extract:
- effectiveDate: agreement start date (YYYY-MM-DD format)
- trainingData: whether and what customer data may be used for model training
- trainingPurposes: permitted purposes for training data use
- trainingRestrictions: restrictions on using customer data for training
- improvementRestrictions: restrictions on using outputs for model improvement
- governingLaw: US state name
- jurisdiction: courts location string
- party1Name, party1Title, party1Company, party1NoticeAddress (Provider)
- party2Name, party2Title, party2Company, party2NoticeAddress (Customer)""",
    },
}


@router.post("", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    doc_type = request.document_type

    if doc_type is None:
        chat_messages = [{"role": "system", "content": SELECTION_CHAT_PROMPT}]
        chat_messages += [{"role": m.role, "content": m.content} for m in request.messages]
        extract_messages = [
            {"role": "system", "content": SELECTION_EXTRACT_PROMPT},
            {"role": "user", "content": request.messages[-1].content},
        ]
        try:
            reply_response, extract_response = await asyncio.gather(
                acompletion(model=MODEL, messages=chat_messages, extra_body=EXTRA_BODY),
                acompletion(model=MODEL, messages=extract_messages, response_format=SelectionExtract, extra_body=EXTRA_BODY),
            )
            reply = reply_response.choices[0].message.content
            selection = SelectionExtract.model_validate_json(extract_response.choices[0].message.content)
            return ChatResponse(reply=reply, fields=GenericFieldUpdates(), suggested_document_type=selection.suggested_document_type)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    config = DOCUMENT_CONFIGS.get(doc_type)
    if not config:
        raise HTTPException(status_code=400, detail=f"Unknown document type: {doc_type}")

    chat_messages = [{"role": "system", "content": config["chat_prompt"]}]
    chat_messages += [{"role": m.role, "content": m.content} for m in request.messages]
    extract_messages = [
        {"role": "system", "content": config["extract_prompt"]},
        {"role": "user", "content": request.messages[-1].content},
    ]

    try:
        reply_response, extract_response = await asyncio.gather(
            acompletion(model=MODEL, messages=chat_messages, extra_body=EXTRA_BODY),
            acompletion(model=MODEL, messages=extract_messages, response_format=GenericFieldUpdates, extra_body=EXTRA_BODY),
        )
        reply = reply_response.choices[0].message.content
        fields = GenericFieldUpdates.model_validate_json(extract_response.choices[0].message.content)

        valid = config.get("valid_fields", set())
        if valid:
            for field in fields.model_fields:
                if field not in valid:
                    setattr(fields, field, None)

        # Merge with current fields and save
        merged = {**request.current_fields}
        for k, v in fields.model_dump().items():
            if v is not None:
                merged[k] = str(v)

        doc = upsert_document(current_user["id"], doc_type, merged, request.document_id)
        return ChatResponse(reply=reply, fields=fields, document_id=doc["id"])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
