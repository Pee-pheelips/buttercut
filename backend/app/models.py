from typing import Dict, List, Optional
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class Job:
    job_id: str
    status: str
    video_path: str
    overlays: List[dict]
    overlay_files: Dict[str, str]
    created_at: datetime = field(default_factory=datetime.now)
    output_path: Optional[str] = None
    error: Optional[str] = None