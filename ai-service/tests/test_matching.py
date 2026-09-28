
from app.models import UserProfile
from app.services.matching import find_matches


def test_reciprocal_match():
    user = UserProfile(
        user_id="vishnu",
        teaches=["Python", "Java"],
        learns=["UI/UX Design"]
    )

    candidates = [
        UserProfile(
            user_id="user2",
            teaches=["UI/UX Design"],
            learns=["Python"]
        ),
        UserProfile(
            user_id="user3",
            teaches=["Cooking"],
            learns=["Music"]
        )
    ]

    result = find_matches(user, candidates)

    assert len(result) == 1
    assert result[0]["user_id"] == "user2"
    assert result[0]["score"] == 75


def test_no_self_match():
    user = UserProfile(
        user_id="vishnu",
        teaches=["Python"],
        learns=["Java"]
    )

    result = find_matches(user, [user])

    assert result == []