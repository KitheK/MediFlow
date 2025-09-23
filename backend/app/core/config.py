from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Mediflow"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Debug mode
    DEBUG: bool = True  # Add this line
    
    # CORS Settings
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # Database
    DATABASE_URL: str = "sqlite:///./mediflow.db"
    
    # JWT
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = ".env"

settings = Settings()

