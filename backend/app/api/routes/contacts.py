
import uuid

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Organisation, UniversityContact
from app.schemas.contact import ContactResponse


router = APIRouter(
    prefix="/contacts",
    tags=["University Contacts"],
)


@router.get(
    "/{organisation_id}",
    response_model=list[ContactResponse],
)
def get_university_contacts(
    organisation_id: uuid.UUID,
    db: Session = Depends(get_db),
):
    organisation = db.scalar(
        select(Organisation).where(
            Organisation.id == organisation_id
        )
    )

    if organisation is None:
        raise HTTPException(
            status_code=404,
            detail="Organisation not found.",
        )

    contacts = db.scalars(
        select(UniversityContact)
        .where(
            UniversityContact.organisation_id == organisation_id,
            UniversityContact.is_active.is_(True),
        )
        .order_by(UniversityContact.department)
    ).all()

    return contacts
