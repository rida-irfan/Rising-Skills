"""
app/api/v1/routes/ai_insights.py
---------------------------------
AI-powered insight routes for Phase 6B — Skill Gap Explanation.

Follows the existing Rising Skills route conventions:
- APIRouter with prefix and tags
- Depends(get_current_user) for authentication
- Depends(get_X_service) for service injection
- Standard RFC-7807 error responses via AppException hierarchy
"""
import uuid

from fastapi import APIRouter, Depends, Query, status

from app.core.security import AuthenticatedUser
from app.dependencies.auth import get_current_user
from app.dependencies.services import get_skill_gap_service
from app.schemas.skill_gap import SkillGapExplanationResponse
from app.services.skill_gap_service import SkillGapService

router = APIRouter(prefix="/ai", tags=["AI Insights"])


@router.get(
    "/skill-gap-explanation/{opportunity_id}",
    response_model=SkillGapExplanationResponse,
    status_code=status.HTTP_200_OK,
    summary="AI skill gap explanation",
    description=(
        "Returns the deterministic match/skill-gap data for the authenticated "
        "learner and the specified opportunity, enhanced with an AI-generated "
        "narrative explanation when available. AI failure degrades gracefully — "
        "deterministic data is always returned."
    ),
)
async def get_skill_gap_explanation(
    opportunity_id: uuid.UUID,
    learner_note: str | None = Query(
        default=None,
        max_length=500,
        description="Optional focus area or preference from the learner.",
    ),
    current_user: AuthenticatedUser = Depends(get_current_user),
    skill_gap_service: SkillGapService = Depends(get_skill_gap_service),
) -> SkillGapExplanationResponse:
    return await skill_gap_service.explain_skill_gap(
        opportunity_id=opportunity_id,
        profile_id=uuid.UUID(current_user.id),
        learner_note=learner_note,
    )
