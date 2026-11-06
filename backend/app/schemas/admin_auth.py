
import uuid

from pydantic import BaseModel, ConfigDict, Field


class AdminLoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=200)


class AdminResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: str
    role: str

    model_config = ConfigDict(from_attributes=True)


class AdminLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin: AdminResponse
