
import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ContactResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    organisation_id: uuid.UUID
    department: str
    phone_number: str
    email: str | None
    office_location: str | None
    office_hours: str | None
    is_active: bool
    created_at: datetime
