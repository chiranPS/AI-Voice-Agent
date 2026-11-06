from sqlalchemy.orm import Session

from app.models.admin_user import AdminUser
from app.core.security import (
    verify_password,
    create_access_token,
)


def authenticate_admin(
    db: Session,
    email: str,
    password: str,
):
    """
    Authenticate an administrator using email and password.
    """

    admin = (
        db.query(AdminUser)
        .filter(AdminUser.email == email)
        .first()
    )

    if not admin:
        return None

    if not admin.is_active:
        return None

    if not verify_password(password, admin.password_hash):
        return None

    # Generate JWT access token
    access_token, expires_in = create_access_token(
        admin_id=str(admin.id),
        email=admin.email,
        role=admin.role,
    )

    return {
        "admin": admin,
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": expires_in,
    }


def get_admin_by_id(
    db: Session,
    admin_id: str,
):
    """
    Retrieve an administrator using their ID.
    """

    return (
        db.query(AdminUser)
        .filter(AdminUser.id == admin_id)
        .first()
    )