from fastapi import APIRouter, Header

from app.services.auth_service import firebase_enabled, verify_bearer_token

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/status")
async def auth_status():
    return {
        "provider": "firebase",
        "configured": firebase_enabled(),
        "mode": "optional",
    }


@router.get("/me")
async def auth_me(authorization: str | None = Header(default=None)):
    claims = verify_bearer_token(authorization)
    if not claims:
        return {"authenticated": False}
    return {
        "authenticated": True,
        "uid": claims.get("uid"),
        "email": claims.get("email"),
        "claims": {
            k: v
            for k, v in claims.items()
            if k not in {"firebase", "iat", "exp", "aud", "iss", "sub"}
        },
    }
