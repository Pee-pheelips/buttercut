from fastapi import APIRouter, HTTPException
from ..schemas import StatusResponse
from .upload import jobs

router = APIRouter()

@router.get("/status/{job_id}", response_model=StatusResponse)
async def get_status(job_id: str):
    """Get processing status"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return StatusResponse(
        job_id=job_id,
        status=jobs[job_id]["status"],
        error=jobs[job_id].get("error")
    )