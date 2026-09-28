from fastapi import APIRouter
from app.models import MatchRequest
from app.services.matching import find_matches

router = APIRouter()


@router.post("/match")
def match_users(request: MatchRequest):
    matches = find_matches(request.user, request.candidates)

    return {
        "user_id": request.user.user_id,
        "matches": matches
    }