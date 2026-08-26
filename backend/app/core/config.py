from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "AI RADAR"
    app_version: str = "1.0.0"
    environment: str = "development"

    database_url: str = "sqlite:///./ai_radar.db"

    gemini_api_key: str = ""
    gemini_classifier_model: str = ""
    gemini_summary_model: str = ""

    collect_interval_minutes: int = 10

    min_importance_for_summary: float = 6.5

    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()