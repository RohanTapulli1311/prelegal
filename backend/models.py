from typing import Optional, Literal
from pydantic import BaseModel


class ChatMessage(BaseModel):
    role: str
    content: str


class GenericFieldUpdates(BaseModel):
    # Common party fields
    party1Name: Optional[str] = None
    party1Title: Optional[str] = None
    party1Company: Optional[str] = None
    party1NoticeAddress: Optional[str] = None
    party2Name: Optional[str] = None
    party2Title: Optional[str] = None
    party2Company: Optional[str] = None
    party2NoticeAddress: Optional[str] = None
    effectiveDate: Optional[str] = None
    governingLaw: Optional[str] = None
    jurisdiction: Optional[str] = None

    # NDA-specific
    purpose: Optional[str] = None
    mndaTermType: Optional[Literal["expires", "until_terminated"]] = None
    mndaTermYears: Optional[int] = None
    confidentialityTermType: Optional[Literal["years", "perpetuity"]] = None
    confidentialityTermYears: Optional[int] = None
    modifications: Optional[str] = None

    # General deal terms
    term: Optional[str] = None
    endDate: Optional[str] = None
    fees: Optional[str] = None
    paymentProcess: Optional[str] = None
    subscriptionPeriod: Optional[str] = None
    generalCapAmount: Optional[str] = None

    # SLA-specific
    targetUptime: Optional[str] = None
    targetResponseTime: Optional[str] = None
    supportChannel: Optional[str] = None
    uptimeCredit: Optional[str] = None
    responseTimeCredit: Optional[str] = None
    scheduledDowntime: Optional[str] = None

    # PSA-specific
    deliverables: Optional[str] = None
    paymentPeriod: Optional[str] = None
    customerObligations: Optional[str] = None

    # DPA-specific
    dataCategories: Optional[str] = None
    dataSubjectCategories: Optional[str] = None
    processingPurpose: Optional[str] = None
    processingDuration: Optional[str] = None
    approvedSubprocessors: Optional[str] = None
    governingMemberState: Optional[str] = None

    # Partnership-specific
    territory: Optional[str] = None
    obligations: Optional[str] = None

    # Design Partner-specific
    programDescription: Optional[str] = None

    # Software License-specific
    permittedUses: Optional[str] = None
    licenseLimits: Optional[str] = None

    # Pilot-specific
    pilotPeriod: Optional[str] = None

    # BAA-specific
    breachNotificationPeriod: Optional[str] = None
    limitations: Optional[str] = None
    parentAgreement: Optional[str] = None

    # AI Addendum-specific
    trainingData: Optional[str] = None
    trainingPurposes: Optional[str] = None
    trainingRestrictions: Optional[str] = None
    improvementRestrictions: Optional[str] = None


class SelectionExtract(BaseModel):
    suggested_document_type: Optional[str] = None


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    current_fields: dict
    document_type: Optional[str] = None
    document_id: Optional[int] = None


class ChatResponse(BaseModel):
    reply: str
    fields: GenericFieldUpdates
    suggested_document_type: Optional[str] = None
    document_id: Optional[int] = None


class UserCreate(BaseModel):
    name: str
    email: str
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str


class DocumentResponse(BaseModel):
    id: int
    slug: str
    fields: dict
    created_at: str
    updated_at: str


class DocumentFieldsUpdate(BaseModel):
    fields: dict
