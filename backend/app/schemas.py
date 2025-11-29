from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum

class OverlayType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"

class OverlaySchema(BaseModel):
    id: int
    type: OverlayType
    x: float = Field(ge=0, le=100)
    y: float = Field(ge=0, le=100)
    startTime: float = Field(ge=0)
    endTime: float = Field(ge=0)
    content: str
    fontSize: Optional[int] = 24
    color: Optional[str] = "#ffffff"
    width: Optional[int] = 150
    height: Optional[int] = 100

class JobStatus(str, Enum):
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class JobResponse(BaseModel):
    job_id: str
    status: JobStatus

class StatusResponse(BaseModel):
    job_id: str
    status: JobStatus
    error: Optional[str] = None