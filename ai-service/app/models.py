from pydantic import BaseModel
from typing import List


class UserProfile(BaseModel):
    user_id: str
    teaches: List[str]
    learns: List[str]


class MatchRequest(BaseModel):
    user: UserProfile
    candidates: List[UserProfile]