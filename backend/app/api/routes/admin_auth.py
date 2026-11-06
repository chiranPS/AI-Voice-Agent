from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.schemas.admin_auth import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminResponse,
)
from app.services.admin_auth_service import (
    authenticate_admin,
    get_admin_by_id,
)


router = APIRouter(
    prefix="/admin/auth",
    tags=["Admin Authentication"],
)

security = HTTPBearer(auto_error=False)


# Current Admin Dependency
def get_current_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db),
):
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
        )

    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    admin_id = payload.get("sub")

    if not admin_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        )

    admin = get_admin_by_id(
        db=db,
        admin_id=admin_id,
    )

    if not admin or not admin.is_active or admin.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Administrator account is not authorised",
        )

    return admin


@router.post(
    "/login",
    response_model=AdminLoginResponse,
)
def login(
    payload: AdminLoginRequest,
    db: Session = Depends(get_db),
):

    result = authenticate_admin(
        db=db,
        email=payload.email,
        password=payload.password,
    )

    if not result:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "expires_in": result["expires_in"],
        "admin": result["admin"],
    }
# Get Current Admin
@router.get(
    "/me",
    response_model=AdminResponse,
)
def get_me(
    current_admin=Depends(get_current_admin),
):
    return current_admin