from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
import os
from .upload import jobs

router = APIRouter()

@router.get("/result/{job_id}")
async def get_result(job_id: str):
    """Download processed video"""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if jobs[job_id]["status"] != "completed":
        raise HTTPException(status_code=400, detail="Video not ready")
    
    output_path = jobs[job_id].get("output_path")
    if not output_path or not os.path.exists(output_path):
        raise HTTPException(status_code=404, detail="Output file not found")
    
    return FileResponse(
        output_path,
        media_type="video/mp4",
        filename=f"edited_video_{job_id}.mp4"
    )