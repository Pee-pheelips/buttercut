from typing import Dict, List
from pathlib import Path
from ..utils.ffmpeg_helper import FFmpegHelper

class VideoProcessor:
    def __init__(self, jobs_store: Dict):
        self.jobs = jobs_store
    
    def process_video(self, job_id: str, video_path: str, overlays: List[dict], 
                     overlay_files: Dict[str, str], output_dir: Path):
        """Process video with overlays"""
        try:
            self.jobs[job_id]["status"] = "processing"
            
            output_path = output_dir / f"{job_id}_output.mp4"
            
            success, message = FFmpegHelper.process_video(
                video_path, str(output_path), overlays, overlay_files
            )
            
            if success:
                self.jobs[job_id]["status"] = "completed"
                self.jobs[job_id]["output_path"] = str(output_path)
                print(f"Video processing completed: {output_path}")
            else:
                self.jobs[job_id]["status"] = "failed"
                self.jobs[job_id]["error"] = message
                print(f"FFmpeg error: {message}")
                
        except Exception as e:
            print(f"Error processing video: {str(e)}")
            self.jobs[job_id]["status"] = "failed"
            self.jobs[job_id]["error"] = str(e)