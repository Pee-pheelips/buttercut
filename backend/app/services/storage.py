from pathlib import Path
from typing import Dict
import shutil

class StorageService:
    @staticmethod
    def cleanup_job(job_id: str, upload_dir: Path):
        """Clean up job files"""
        job_dir = upload_dir / job_id
        if job_dir.exists():
            shutil.rmtree(job_dir)
    
    @staticmethod
    def get_job_dir(job_id: str, upload_dir: Path) -> Path:
        """Get or create job directory"""
        job_dir = upload_dir / job_id
        job_dir.mkdir(exist_ok=True)
        return job_dir