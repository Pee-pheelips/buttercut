from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    APP_NAME: str = "Video Editor API"
    DEBUG: bool = True
    API_VERSION: str = "v1"
    
    # Directories
    BASE_DIR: Path = Path(__file__).parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "outputs"
    
    # CORS
    ALLOWED_ORIGINS: list = ["*"]
    
    # Processing
    MAX_VIDEO_SIZE: int = 500 * 1024 * 1024  # 500MB
    MAX_OVERLAY_SIZE: int = 50 * 1024 * 1024  # 50MB
    
    class Config:
        env_file = ".env"

settings = Settings()

# Create directories
settings.UPLOAD_DIR.mkdir(exist_ok=True)
settings.OUTPUT_DIR.mkdir(exist_ok=True)