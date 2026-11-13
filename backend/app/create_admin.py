
import os
import sys

from dotenv import load_dotenv
from sqlalchemy import select

from app.core.database import SessionLocal
from app.core.security import hash_password
from app.models.admin_user import AdminUser
from app.models.organization import Organisation


load_dotenv()


def create_initial_admin():
    email = os.getenv("ADMIN_INITIAL_EMAIL", "").strip().lower()
    full_name = os.getenv(
        "ADMIN_INITIAL_NAME",
        "University Administrator",
    ).strip()
    password = os.getenv("ADMIN_INITIAL_PASSWORD", "")

    if not email or not password:
        print(
            "ADMIN_INITIAL_EMAIL and ADMIN_INITIAL_PASSWORD "
            "must be configured in backend/.env"
        )
        sys.exit(1)

    if len(password) < 12:
        print("The initial admin password must be at least 12 characters.")
        sys.exit(1)

    db = SessionLocal()

    try:
        organisation = db.scalar(
            select(Organisation).where(
                (Organisation.name.ilike("%APIIT%")) |
                (Organisation.id == "c0e954d5-1e9f-4d10-8493-3553c873c204") |
                (Organisation.name == "Northstar University")
            )
        )

        if organisation is None:
            # Fallback to the first available organisation
            organisation = db.scalar(select(Organisation))

        if organisation is None:
            print("No organisation was found in the database. Please run migrations first.")
            sys.exit(1)

        existing_admin = db.scalar(
            select(AdminUser).where(
                AdminUser.email == email
            )
        )

        if existing_admin:
            print("An admin account with this email already exists.")
            return

        admin = AdminUser(
            organisation_id=organisation.id,
            email=email,
            full_name=full_name,
            password_hash=hash_password(password),
            role="admin",
            is_active=True,
        )

        db.add(admin)
        db.commit()

        print("Initial administrator created successfully.")
        print(f"Email: {email}")

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


if __name__ == "__main__":
    create_initial_admin()
