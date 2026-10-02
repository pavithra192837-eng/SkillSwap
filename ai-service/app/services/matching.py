def normalize(skills):
    return {skill.strip().lower() for skill in skills if skill.strip()}


def calculate_match(user, candidate):
    user_teaches = normalize(user.teaches)
    user_learns = normalize(user.learns)

    candidate_teaches = normalize(candidate.teaches)
    candidate_learns = normalize(candidate.learns)

    learn_match = user_learns & candidate_teaches
    teach_match = user_teaches & candidate_learns

    if not user_learns or not user_teaches:
        return None

    learn_score = len(learn_match) / len(user_learns)
    teach_score = len(teach_match) / len(user_teaches)

    score = round((learn_score + teach_score) * 50)

    if score == 0:
        return None

    return {
        "user_id": candidate.user_id,
        "score": score,
        "skills_to_learn": sorted(learn_match),
        "skills_to_teach": sorted(teach_match)
    }


def find_matches(user, candidates):
    matches = []

    for candidate in candidates:
        if candidate.user_id == user.user_id:
            continue

        result = calculate_match(user, candidate)

        if result:
            matches.append(result)

    return sorted(
        matches,
        key=lambda item: item["score"],
        reverse=True
    )