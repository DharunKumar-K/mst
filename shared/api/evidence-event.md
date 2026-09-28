# EvidenceEvent

An `EvidenceEvent` is the canonical input to `evidence.service.ingest()`. Manual uploads and simulator-generated events must use this same ingestion function so validation, normalization, hashing, storage, and Merkle-root updates are consistent.

```json
{
  "eventId": "ev-2a46f592-1db1-4b8d-8447-15f819b271a4",
  "batchId": "CP-2026-001",
  "type": "weighbridge",
  "timestamp": "2026-09-28T12:00:00Z",
  "source": "Recycler-A",
  "origin": "simulation",
  "data": { "weight": 1000, "unit": "kg" },
  "file": {
    "name": "weighbridge.json",
    "mime": "application/json",
    "contentBase64": "eyJ3ZWlnaHQiOjEwMDAsInVuaXQiOiJrZyJ9"
  }
}
```

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `eventId` | string | no | Caller-provided stable id; generated when omitted. |
| `batchId` | string | yes | Existing CirqProof batch id. |
| `type` | string | yes | One of `shared/enums.json:evidenceTypes`. |
| `timestamp` | ISO 8601 | yes | Event time; normalized to UTC. |
| `source` | string | yes | Organization, device, or actor that produced the event. |
| `origin` | string | yes | `upload` or `simulation`. |
| `data` | object | yes | Structured evidence payload. |
| `file` | object | no | Original artifact metadata and base64 bytes. |

If no file is supplied, the normalized `data` object is serialized deterministically and hashed/stored as the artifact. The digest is SHA-256 over artifact bytes, not over a mutable database document.