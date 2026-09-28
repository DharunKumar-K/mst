"""
CirqProof AI Reconciliation Service

FastAPI-based service that performs deterministic rule-based analysis
and optional LLM explanation of recycling evidence.

Architecture:
  1. Rules engine (deterministic) — calculates mass balance, capacity, downstream match
  2. Extraction — extracts structured data from evidence events
  3. Reconciliation — orchestrates rules + explanation
  4. Anomaly — detects evidence anomalies and hash mismatches
  5. Explanation — LLM-powered (with template fallback)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import uvicorn
import os

from reconciliation.reconciler import reconcile_batch
from rules.engine import run_rules

app = FastAPI(
    title="CirqProof AI Service",
    description="Deterministic reconciliation engine with LLM explanation fallback",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─── Request / Response Models ────────────────────────────────────────────────


class ClaimModel(BaseModel):
    quantity: float
    unit: str = "kg"


class BatchModel(BaseModel):
    batchId: str
    producer: Optional[str] = None
    recycler: Optional[str] = None
    material: Optional[str] = None
    claim: ClaimModel


class EvidenceDataModel(BaseModel):
    class Config:
        extra = "allow"


class EvidenceModel(BaseModel):
    evidenceId: Optional[str] = None
    batchId: Optional[str] = None
    type: str
    source: Optional[str] = None
    origin: Optional[str] = None
    data: dict
    fileHash: Optional[str] = None
    timestamp: Optional[str] = None


class ReconcileRequest(BaseModel):
    batch: BatchModel
    evidence: list[EvidenceModel]
    integrityResult: Optional[dict] = None


class ReconcileResponse(BaseModel):
    status: str
    massBalanceResult: Optional[dict] = None
    capacityResult: Optional[dict] = None
    downstreamMatch: Optional[dict] = None
    flags: list[str] = Field(default_factory=list)
    missingEvidence: list[str] = Field(default_factory=list)
    explanation: str = ""
    recommendation: str = ""


class DocumentExtractRequest(BaseModel):
    file_name: str
    file_type: str  # "application/pdf", "application/json", etc.
    content_base64: str


# ─── Endpoints ────────────────────────────────────────────────────────────────


@app.get("/health")
async def health():
    return {"ok": True, "data": {"status": "ok", "service": "ai-reconciliation"}}


@app.post("/reconcile", response_model=ReconcileResponse)
async def reconcile(request: ReconcileRequest):
    try:
        result = reconcile_batch(
            batch=request.batch.model_dump(),
            evidence=[e.model_dump() for e in request.evidence],
            integrity_result=request.integrityResult,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/rules/check")
async def check_rules(request: ReconcileRequest):
    """Run only the deterministic rules (no LLM explanation)."""
    try:
        result = run_rules(
            batch=request.batch.model_dump(),
            evidence=[e.model_dump() for e in request.evidence],
            integrity_result=request.integrityResult,
        )
        return {"ok": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/document-extract")
async def document_extract(request: DocumentExtractRequest):
    """
    Extract structured data from documents (JSON, CSV, PDF).
    Currently a placeholder that echoes back the file info.
    """
    import base64
    try:
        content = base64.b64decode(request.content_base64)
        return {
            "ok": True, 
            "data": {
                "file_name": request.file_name,
                "file_type": request.file_type,
                "size_bytes": len(content),
                "extracted": {} # To be populated by extraction logic
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 content: {e}")


if __name__ == "__main__":
    port = int(os.environ.get("AI_PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
