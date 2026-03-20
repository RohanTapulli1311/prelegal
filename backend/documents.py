import json
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from db import get_conn
from models import DocumentFieldsUpdate, DocumentResponse

router = APIRouter()


def _row_to_doc(row) -> dict:
    return {
        "id": row["id"],
        "slug": row["slug"],
        "fields": json.loads(row["fields"]),
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }


def upsert_document(user_id: int, slug: str, fields: dict, document_id: Optional[int] = None) -> dict:
    """Insert or update a document. Returns the saved document row."""
    fields_json = json.dumps(fields)
    with get_conn() as conn:
        if document_id:
            row = conn.execute(
                "SELECT id FROM documents WHERE id = ? AND user_id = ?",
                (document_id, user_id),
            ).fetchone()
            if row:
                conn.execute(
                    "UPDATE documents SET fields = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?",
                    (fields_json, document_id, user_id),
                )
                row = conn.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
                return _row_to_doc(row)

        # Insert new
        cursor = conn.execute(
            "INSERT INTO documents (user_id, slug, fields) VALUES (?, ?, ?)",
            (user_id, slug, fields_json),
        )
        new_id = cursor.lastrowid
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (new_id,)).fetchone()
        return _row_to_doc(row)


@router.get("", response_model=list[DocumentResponse])
def list_documents(current_user: dict = Depends(get_current_user)):
    with get_conn() as conn:
        rows = conn.execute(
            "SELECT * FROM documents WHERE user_id = ? ORDER BY updated_at DESC",
            (current_user["id"],),
        ).fetchall()
    return [_row_to_doc(r) for r in rows]


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int, current_user: dict = Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT * FROM documents WHERE id = ? AND user_id = ?",
            (document_id, current_user["id"]),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Document not found")
    return _row_to_doc(row)


@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: int, body: DocumentFieldsUpdate, current_user: dict = Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM documents WHERE id = ? AND user_id = ?",
            (document_id, current_user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        conn.execute(
            "UPDATE documents SET fields = ?, updated_at = datetime('now') WHERE id = ?",
            (json.dumps(body.fields), document_id),
        )
        row = conn.execute("SELECT * FROM documents WHERE id = ?", (document_id,)).fetchone()
    return _row_to_doc(row)


@router.delete("/{document_id}")
def delete_document(document_id: int, current_user: dict = Depends(get_current_user)):
    with get_conn() as conn:
        row = conn.execute(
            "SELECT id FROM documents WHERE id = ? AND user_id = ?",
            (document_id, current_user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        conn.execute("DELETE FROM documents WHERE id = ?", (document_id,))
    return {"ok": True}
