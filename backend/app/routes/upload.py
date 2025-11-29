from fastapi import APIRouter, File, UploadFile, Form, HTTPException, BackgroundTasks
import json
import uuid
from typing import Dict, Optional
from ..config import settings
from ..schemas import JobResponse, OverlaySchema
from ..services.storage import StorageService
from ..services.video_processor import VideoProcessor

router = APIRouter()

# Global jobs storage
jobs: Dict = {}
video_processor = VideoProcessor(jobs)

@router.post("/upload", response_model=JobResponse)
async def upload_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    metadata: str = Form(...),
    overlay_0: Optional[UploadFile] = File(None),
    overlay_1: Optional[UploadFile] = File(None),
    overlay_2: Optional[UploadFile] = File(None),
    overlay_3: Optional[UploadFile] = File(None),
    overlay_4: Optional[UploadFile] = File(None),
    overlay_5: Optional[UploadFile] = File(None),
    overlay_6: Optional[UploadFile] = File(None),
    overlay_7: Optional[UploadFile] = File(None),
    overlay_8: Optional[UploadFile] = File(None),
    overlay_9: Optional[UploadFile] = File(None),
):
    """Upload video and overlay files"""
    try:
        job_id = str(uuid.uuid4())
        job_dir = StorageService.get_job_dir(job_id, settings.UPLOAD_DIR)
        
        # Save video
        video_path = job_dir / f"video_{video.filename}"
        with open(video_path, "wb") as f:
            content = await video.read()
            f.write(content)
        
        # Parse metadata
        overlays_data = json.loads(metadata)
        
        # Save overlay files
        overlay_files = {}
        overlay_uploads = [
            overlay_0, overlay_1, overlay_2, overlay_3, overlay_4,
            overlay_5, overlay_6, overlay_7, overlay_8, overlay_9
        ]
        
        for i, overlay_file in enumerate(overlay_uploads):
            if overlay_file:
                overlay_path = job_dir / f"overlay_{i}_{overlay_file.filename}"
                with open(overlay_path, "wb") as f:
                    content = await overlay_file.read()
                    f.write(content)
                overlay_files[f"overlay_{i}"] = str(overlay_path)
        
        # Store job
        jobs[job_id] = {
            "status": "queued",
            "video_path": str(video_path),
            "overlays": overlays_data,
            "overlay_files": overlay_files
        }
        
        # Start processing
        background_tasks.add_task(
            video_processor.process_video,
            job_id,
            str(video_path),
            overlays_data,
            overlay_files,
            settings.OUTPUT_DIR
        )
        
        return JobResponse(job_id=job_id, status="queued")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))