/**
 * Rising Skills Backend API client.
 *
 * Base URL is sourced from `NEXT_PUBLIC_API_BASE_URL` (browser) or
 * `API_BASE_URL` (server). Authenticated calls accept a Bearer token
 * (Supabase Auth JWT) which is passed through the `Authorization` header.
 *
 * All types mirror the OpenAPI schema at
 * https://backend-production-f10a.up.railway.app/docs
 */

// ---------------------------------------------------------------------------
// Base configuration
// ---------------------------------------------------------------------------

export const API_BASE_URL =
  (typeof process !== "undefined" &&
    (process.env.NEXT_PUBLIC_API_BASE_URL ||
      process.env.API_BASE_URL)) ||
  "https://backend-production-f10a.up.railway.app";

const TOKEN_STORAGE_KEY = "rising_skills_token";

/** Read the stored bearer token from localStorage (browser only). */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/** Persist the bearer token (browser only). */
export function setStoredToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

// ---------------------------------------------------------------------------
// Core request helper
// ---------------------------------------------------------------------------

type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number>;

function buildQuery(params: Record<string, QueryValue>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, String(v));
    } else {
      sp.append(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  query?: Record<string, QueryValue>;
  /** Override the Accept/Content-Type if needed. */
  headers?: Record<string, string>;
  /** Suppress throwing on non-2xx; return the raw response object instead. */
  raw?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const {
    method = "GET",
    body,
    token,
    query,
    headers = {},
    raw = false,
  } = options;

  const url = `${API_BASE_URL}${path}${buildQuery(query || {})}`;

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = token.startsWith("Bearer ")
      ? token
      : `Bearer ${token}`;
  }

  if (body !== undefined && body !== null && method !== "GET") {
    finalHeaders["Content-Type"] = "application/json";
  }

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body:
        body !== undefined && body !== null && method !== "GET"
          ? JSON.stringify(body)
          : undefined,
      cache: "no-store",
    });
  } catch (err) {
    throw new ApiError(0, "Network error contacting backend", err);
  }

  if (!res.ok) {
    let parsed: unknown = null;
    try {
      parsed = await res.json();
    } catch {
      try {
        parsed = await res.text();
      } catch {
        parsed = null;
      }
    }
    if (raw) return res as unknown as T;
    throw new ApiError(res.status, `API ${res.status} on ${method} ${path}`, parsed);
  }

  if (res.status === 204) return undefined as unknown as T;

  const text = await res.text();
  if (!text) return undefined as unknown as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

// ---------------------------------------------------------------------------
// Types (mirrors of the OpenAPI schemas)
// ---------------------------------------------------------------------------

export type UserRole = "learner" | "employer" | "admin";

export interface ProfileResponse {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
}

export interface OrganizationResponse {
  id: string;
  name: string;
  website_url: string | null;
  logo_url: string | null;
  created_at: string;
}

export interface OrganizationCreate {
  name: string;
  website_url?: string | null;
  logo_url?: string | null;
}

export type OrgRole = "owner" | "admin" | "recruiter" | "evaluator" | "member";

export interface OrganizationMemberResponse {
  id: string;
  organization_id: string;
  profile_id: string;
  org_role: OrgRole;
  created_at: string;
  profile?: ProfileResponse | null;
}

export interface SkillResponse {
  id: string;
  name: string;
  category: string;
  parent_skill_id: string | null;
  created_at: string;
}

export interface SkillCreate {
  name: string;
  category: string;
  parent_skill_id?: string | null;
}

export interface RoleResponse {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
}

export interface RoleSkillItemResponse {
  id: string;
  role_id: string;
  skill_id: string;
  importance_weight: number;
  skill: SkillResponse;
}

export interface RoleWithSkillsResponse extends RoleResponse {
  role_skills: RoleSkillItemResponse[];
}

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type AssessmentStatus = "draft" | "published" | "archived";
export type QuestionType = "multiple_choice" | "single_choice" | "true_false";
export type AttemptStatus =
  | "in_progress"
  | "submitted"
  | "completed"
  | "expired"
  | "cancelled";

export interface QuestionOption {
  id: string;
  text: string;
}

export interface AssessmentQuestionPublic {
  id: string;
  question_text: string;
  question_type: QuestionType;
  options: QuestionOption[];
  points: number;
  display_order: number;
}

export interface AssessmentQuestionCreate {
  question_text: string;
  question_type: QuestionType;
  options: QuestionOption[];
  correct_answer: string;
  points: number;
  display_order: number;
  explanation?: string;
}

export interface AssessmentPublic {
  id: string;
  title: string;
  description: string | null;
  skill_id: string;
  role_id: string | null;
  difficulty: DifficultyLevel;
  duration_seconds: number;
  passing_score: number;
  status: AssessmentStatus;
  questions: AssessmentQuestionCreate[];
  created_at: string;
  skill?: SkillResponse | null;
}

export interface AssessmentCreate {
  title: string;
  description: string | null;
  skill_id: string;
  role_id: string | null;
  difficulty: DifficultyLevel;
  duration_seconds: number;
  passing_score: number;
  status: AssessmentStatus;
  questions: AssessmentQuestionCreate[];
  
}

export interface AssessmentDetailPublic extends AssessmentPublic {
  
}

export interface AttemptStartResponse {
  id: string;
  assessment_id: string;
  started_at: string;
  expires_at: string;
  status: AttemptStatus;
  attempt_number: number;
  
}

export interface AnswerSubmitRequest {
  question_id: string;
  selected_option: string;
}

export interface AnswerSubmitResponse {
  id: string;
  attempt_id: string;
  question_id: string;
  answered_at: string;
}

export interface AssessmentResultResponse {
  id: string;
  attempt_id: string;
  assessment_id: string;
  assessment_title: string;
  total_questions: number;
  answered_questions: number;
  correct_answers: number;
  total_points: number;
  earned_points: number;
  score_percentage: number;
  passed: boolean;
  passing_score: number;
  evaluated_at: string;
  breakdown: Record<string, unknown>;
}

export type ChallengeStatus = "draft" | "published" | "archived";

export interface ChallengeSkillItem {
  skill_id: string;
  importance_weight?: number;
}

export interface ChallengeSkillPublic {
  skill_id: string;
  skill_name: string;
  importance_weight: number;
}

export interface ChallengePublic {
  id: string;
  title: string;
  description: string | null;
  difficulty: DifficultyLevel;
  status: ChallengeStatus;
  organization_id: string | null;
  role_id: string | null;
  time_limit_seconds: number | null;
  submission_deadline: string | null;
  created_at: string;
}

export interface ChallengeDetailPublic extends ChallengePublic {
  instructions: string | null;
  skills: ChallengeSkillPublic[];
}

export interface ChallengeCreate {
  title: string;
  description?: string | null;
  instructions?: string | null;
  difficulty?: DifficultyLevel;
  organization_id?: string | null;
  role_id?: string | null;
  time_limit_seconds?: number | null;
  submission_deadline?: string | null;
  status?: ChallengeStatus;
  skills?: ChallengeSkillItem[];
}

export type SubmissionStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "evaluated"
  | "accepted"
  | "rejected"
  | "withdrawn";

export interface SubmissionCreate {
  repository_url?: string | null;
  deployment_url?: string | null;
  description?: string | null;
}

export interface SubmissionUpdate {
  repository_url?: string | null;
  deployment_url?: string | null;
  description?: string | null;
}

export interface SubmissionPublic {
  id: string;
  challenge_id: string;
  profile_id: string;
  repository_url: string | null;
  deployment_url: string | null;
  description: string | null;
  status: SubmissionStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface RubricItem {
  criterion: string;
  max_points: number;
  awarded_points: number;
}

export interface EvaluationCreate {
  rubric: RubricItem[];
  feedback?: string | null;
}

export interface EvaluationPublic {
  id: string;
  submission_id: string;
  evaluator_id: string;
  rubric: Record<string, unknown>[];
  score: number;
  feedback: string | null;
  status: string;
  created_at: string;
}

export type EvidenceSourceType = "assessment" | "challenge_submission" | "self_reported";
export type EvidenceStatus = "unverified" | "pending" | "verified" | "rejected";

export interface EvidencePublic {
  id: string;
  profile_id: string;
  skill_id: string;
  source_type: EvidenceSourceType;
  source_id: string;
  score: number;
  evidence_data: Record<string, unknown>;
  status: EvidenceStatus;
  created_at: string;
  updated_at: string;
}

export type OpportunityType = "job" | "internship" | "apprenticeship" | "project";
export type OpportunityStatus = "draft" | "published" | "closed" | "archived";

export interface OpportunitySkillItem {
  skill_id: string;
  importance_weight?: number;
}

export interface OpportunitySkillPublic {
  skill_id: string;
  skill_name: string;
  importance_weight: number;
}

export interface OpportunityPublic {
  id: string;
  organization_id: string;
  title: string;
  description: string | null;
  opportunity_type: OpportunityType;
  status: OpportunityStatus;
  location: string | null;
  is_remote: boolean;
  deadline: string | null;
  published_at: string | null;
  created_at: string;
}

export interface OpportunityDetailPublic extends OpportunityPublic {
  skills: OpportunitySkillPublic[];
}

export interface OpportunityCreate {
  organization_id: string;
  title: string;
  description?: string | null;
  opportunity_type?: OpportunityType;
  location?: string | null;
  is_remote?: boolean;
  deadline?: string | null;
  skills?: OpportunitySkillItem[];
}

export interface OpportunityUpdate {
  title?: string | null;
  description?: string | null;
  opportunity_type?: OpportunityType | null;
  location?: string | null;
  is_remote?: boolean | null;
  deadline?: string | null;
}

export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "shortlisted"
  | "rejected"
  | "accepted"
  | "withdrawn";

export interface ApplicationCreate {
  cover_note?: string | null;
}

export interface ApplicationPublic {
  id: string;
  opportunity_id: string;
  profile_id: string;
  status: ApplicationStatus;
  cover_note: string | null;
  applied_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApplicationStatusUpdate {
  status: ApplicationStatus;
}

export interface MatchPublic {
  id: string;
  opportunity_id: string;
  profile_id: string;
  overall_score: number;
  skill_score: number;
  evidence_score: number;
  experience_score: number;
  breakdown: Record<string, unknown>;
  created_at: string;
}

export type ExperienceType =
  | "employer_project"
  | "internship"
  | "apprenticeship"
  | "freelance"
  | "practical_challenge";

export type ExperienceStatus =
  | "draft"
  | "active"
  | "completed"
  | "verified"
  | "cancelled";

export type VerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected"
  | "revoked"
  | "expired";

export interface ExperienceCreate {
  profile_id: string;
  organization_id?: string | null;
  opportunity_id?: string | null;
  application_id?: string | null;
  title: string;
  description?: string | null;
  experience_type?: ExperienceType;
  started_at?: string | null;
}

export interface ExperiencePublic {
  id: string;
  profile_id: string;
  organization_id: string | null;
  opportunity_id: string | null;
  application_id: string | null;
  title: string;
  description: string | null;
  experience_type: ExperienceType;
  started_at: string;
  ended_at: string | null;
  status: ExperienceStatus;
  verification_status: VerificationStatus;
  created_at: string;
  updated_at: string;
}

export interface ExperienceFeedbackCreate {
  overall_rating: number;
  strengths?: string | null;
  areas_for_improvement?: string | null;
  communication_rating?: number | null;
  technical_rating?: number | null;
  problem_solving_rating?: number | null;
  teamwork_rating?: number | null;
  professionalism_rating?: number | null;
  recommendation?: string | null;
}

export interface ExperienceFeedbackPublic {
  id: string;
  experience_id: string;
  profile_id: string;
  organization_id: string;
  reviewer_id: string;
  overall_rating: number;
  strengths: string | null;
  areas_for_improvement: string | null;
  communication_rating: number | null;
  technical_rating: number | null;
  problem_solving_rating: number | null;
  teamwork_rating: number | null;
  professionalism_rating: number | null;
  recommendation: string | null;
  created_at: string;
}

export type NotificationType =
  | "application_status"
  | "experience_created"
  | "experience_completed"
  | "feedback_submitted"
  | "evidence_verified";

export interface NotificationPublic {
  id: string;
  profile_id: string;
  title: string;
  message: string;
  notification_type: NotificationType;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

export interface OrganizationAnalytics {
  organization_id: string;
  total_opportunities: number;
  published_opportunities: number;
  total_applications: number;
  shortlisted_applications: number;
  accepted_applications: number;
  active_experiences: number;
  completed_experiences: number;
  verified_experiences: number;
  average_match_score: number;
  average_feedback_rating: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}

export interface HealthResponse {
  status: string;
  service: string;
  environment: string;
  timestamp: string;
}

// ---------------------------------------------------------------------------
// Endpoint namespaces
// ---------------------------------------------------------------------------

export const api = {
  // --- Health -------------------------------------------------------------
  health: {
    root: () => request<HealthResponse>("/health"),
    api: () => request<HealthResponse>("/api/v1/health"),
  },

  // --- Profiles -----------------------------------------------------------
  profiles: {
    me: (token?: string | null) =>
      request<ProfileResponse>("/api/v1/profiles/me", { token }),
    updateMe: (data: ProfileUpdate, token?: string | null) =>
      request<ProfileResponse>("/api/v1/profiles/me", {
        method: "PATCH",
        body: data,
        token,
      }),
  },

  // --- Organizations ------------------------------------------------------
  organizations: {
    list: (token?: string | null) =>
      request<OrganizationResponse[]>("/api/v1/organizations", { token }),
    create: (data: OrganizationCreate, token?: string | null) =>
      request<OrganizationResponse>("/api/v1/organizations", {
        method: "POST",
        body: data,
        token,
      }),
    get: (id: string, token?: string | null) =>
      request<OrganizationResponse>(`/api/v1/organizations/${id}`, { token }),
    members: (id: string, token?: string | null) =>
      request<OrganizationMemberResponse[]>(
        `/api/v1/organizations/${id}/members`,
        { token },
      ),
  },

  // --- Skills Taxonomy ----------------------------------------------------
  skills: {
    list: (params?: {
      search?: string | null;
      category?: string | null;
      parent_skill_id?: string | null;
      page?: number;
      page_size?: number;
    }) =>
      request<PaginatedResponse<SkillResponse>>("/api/v1/skills", {
        query: params as Record<string, QueryValue>,
      }),
    get: (id: string) =>
      request<SkillResponse>(`/api/v1/skills/${id}`),
    children: (id: string) =>
      request<SkillResponse[]>(`/api/v1/skills/${id}/children`),
    create: (data: SkillCreate, token?: string | null) =>
      request<SkillResponse>("/api/v1/skills", {
        method: "POST",
        body: data,
        token,
      }),
  },

  // --- Roles --------------------------------------------------------------
  roles: {
    list: (params?: { search?: string | null; page?: number; page_size?: number }) =>
      request<PaginatedResponse<RoleResponse>>("/api/v1/roles", {
        query: params as Record<string, QueryValue>,
      }),
    get: (id: string) => request<RoleResponse>(`/api/v1/roles/${id}`),
    skills: (id: string) =>
      request<RoleWithSkillsResponse>(`/api/v1/roles/${id}/skills`),
  },

  // --- Assessments --------------------------------------------------------
  assessments: {
    list: (params?: {
      skill_id?: string | null;
      role_id?: string | null;
      search?: string | null;
      page?: number;
      page_size?: number;
    }) =>
      request<PaginatedResponse<AssessmentPublic>>("/api/v1/assessments", {
        query: params as Record<string, QueryValue>,
      }),
    get: (id: string) =>
      request<AssessmentDetailPublic>(`/api/v1/assessments/${id}`),
    create: (data: AssessmentCreate, token?: string | null) =>
      request<AssessmentPublic>("/api/v1/assessments", {
        method: "POST",
        body: data,
        token,
      }),
    startAttempt: (id: string, token?: string | null) =>
      request<AttemptStartResponse>(`/api/v1/assessments/${id}/attempts`, {
        method: "POST",
        token,
      }),
  },

  // --- Assessment Attempts ------------------------------------------------
  attempts: {
    answer: (
      attemptId: string,
      data: AnswerSubmitRequest,
      token?: string | null,
    ) =>
      request<AnswerSubmitResponse>(`/api/v1/attempts/${attemptId}/answers`, {
        method: "POST",
        body: data,
        token,
      }),
    submit: (attemptId: string, token?: string | null) =>
      request<AssessmentResultResponse>(`/api/v1/attempts/${attemptId}/submit`, {
        method: "POST",
        token,
      }),
    result: (attemptId: string, token?: string | null) =>
      request<AssessmentResultResponse>(`/api/v1/attempts/${attemptId}/result`, {
        token,
      }),
  },

  // --- Challenges ---------------------------------------------------------
  challenges: {
    list: (params?: {
      organization_id?: string | null;
      search?: string | null;
      page?: number;
      page_size?: number;
    }) =>
      request<PaginatedResponse<ChallengePublic>>("/api/v1/challenges", {
        query: params as Record<string, QueryValue>,
      }),
    create: (data: ChallengeCreate, token?: string | null) =>
      request<ChallengePublic>("/api/v1/challenges", {
        method: "POST",
        body: data,
        token,
      }),
    get: (id: string) =>
      request<ChallengeDetailPublic>(`/api/v1/challenges/${id}`),
    submit: (id: string, data: SubmissionCreate, token?: string | null) =>
      request<SubmissionPublic>(`/api/v1/challenges/${id}/submissions`, {
        method: "POST",
        body: data,
        token,
      }),
    listSubmissions: (
      id: string,
      params?: { skip?: number; limit?: number },
      token?: string | null,
    ) =>
      request<SubmissionPublic[]>(`/api/v1/challenges/${id}/submissions`, {
        query: params as Record<string, QueryValue>,
        token,
      }),
  },

  // --- Submissions --------------------------------------------------------
  submissions: {
    get: (id: string, token?: string | null) =>
      request<SubmissionPublic>(`/api/v1/submissions/${id}`, { token }),
    update: (id: string, data: SubmissionUpdate, token?: string | null) =>
      request<SubmissionPublic>(`/api/v1/submissions/${id}`, {
        method: "PATCH",
        body: data,
        token,
      }),
    evaluate: (id: string, data: EvaluationCreate, token?: string | null) =>
      request<EvaluationPublic>(`/api/v1/submissions/${id}/evaluations`, {
        method: "POST",
        body: data,
        token,
      }),
    listEvaluations: (id: string, token?: string | null) =>
      request<EvaluationPublic[]>(`/api/v1/submissions/${id}/evaluations`, {
        token,
      }),
  },

  // --- Evidence -----------------------------------------------------------
  evidence: {
    list: (params?: {
      profile_id?: string | null;
      page?: number;
      page_size?: number;
    }, token?: string | null) =>
      request<PaginatedResponse<EvidencePublic>>("/api/v1/evidence", {
        query: params as Record<string, QueryValue>,
        token,
      }),
    get: (id: string, token?: string | null) =>
      request<EvidencePublic>(`/api/v1/evidence/${id}`, { token }),
    selfReport: (
      data: { skill_id: string; proficiency?: string | null; notes?: string | null },
      token?: string | null,
    ) =>
      request<EvidencePublic>("/api/v1/evidence/self-report", {
        method: "POST",
        body: data,
        token,
      }),
  },

  // --- Verifications ------------------------------------------------------
  verifications: {
    create: (
      data: { evidence_id: string; to_status: EvidenceStatus; notes?: string | null },
      token?: string | null,
    ) =>
      request<VerificationPublic>("/api/v1/verifications", {
        method: "POST",
        body: data,
        token,
      }),
    forEvidence: (evidenceId: string, token?: string | null) =>
      request<VerificationPublic[]>(
        `/api/v1/verifications/evidence/${evidenceId}`,
        { token },
      ),
  },

  // --- Opportunities ------------------------------------------------------
  opportunities: {
    list: (params?: {
      organization_id?: string | null;
      search?: string | null;
      opportunity_type?: OpportunityType | null;
      page?: number;
      page_size?: number;
    }) =>
      request<PaginatedResponse<OpportunityPublic>>("/api/v1/opportunities", {
        query: params as Record<string, QueryValue>,
      }),
    create: (data: OpportunityCreate, token?: string | null) =>
      request<OpportunityPublic>("/api/v1/opportunities", {
        method: "POST",
        body: data,
        token,
      }),
    get: (id: string) =>
      request<OpportunityDetailPublic>(`/api/v1/opportunities/${id}`),
    update: (id: string, data: OpportunityUpdate, token?: string | null) =>
      request<OpportunityPublic>(`/api/v1/opportunities/${id}`, {
        method: "PATCH",
        body: data,
        token,
      }),
    publish: (id: string, token?: string | null) =>
      request<OpportunityPublic>(`/api/v1/opportunities/${id}/publish`, {
        method: "POST",
        token,
      }),
    close: (id: string, token?: string | null) =>
      request<OpportunityPublic>(`/api/v1/opportunities/${id}/close`, {
        method: "POST",
        token,
      }),
    setSkills: (id: string, skills: OpportunitySkillItem[], token?: string | null) =>
      request<OpportunityDetailPublic>(`/api/v1/opportunities/${id}/skills`, {
        method: "PUT",
        body: skills,
        token,
      }),
    getSkills: (id: string) =>
      request<OpportunitySkillPublic[]>(`/api/v1/opportunities/${id}/skills`),
    apply: (id: string, data: ApplicationCreate, token?: string | null) =>
      request<ApplicationPublic>(`/api/v1/opportunities/${id}/apply`, {
        method: "POST",
        body: data,
        token,
      }),
    applications: (
      id: string,
      params?: { status?: ApplicationStatus | null; page?: number; page_size?: number },
      token?: string | null,
    ) =>
      request<PaginatedResponse<ApplicationPublic>>(
        `/api/v1/opportunities/${id}/applications`,
        { query: params as Record<string, QueryValue>, token },
      ),
    matches: (
      id: string,
      params?: { min_score?: number; page?: number; page_size?: number },
      token?: string | null,
    ) =>
      request<PaginatedResponse<MatchPublic>>(
        `/api/v1/opportunities/${id}/matches`,
        { query: params as Record<string, QueryValue>, token },
      ),
  },

  // --- Applications -------------------------------------------------------
  applications: {
    list: (
      params?: { status?: ApplicationStatus | null; page?: number; page_size?: number },
      token?: string | null,
    ) =>
      request<PaginatedResponse<ApplicationPublic>>("/api/v1/applications", {
        query: params as Record<string, QueryValue>,
        token,
      }),
    get: (id: string, token?: string | null) =>
      request<ApplicationPublic>(`/api/v1/applications/${id}`, { token }),
    withdraw: (id: string, token?: string | null) =>
      request<ApplicationPublic>(`/api/v1/applications/${id}/withdraw`, {
        method: "PATCH",
        token,
      }),
    updateStatus: (id: string, data: ApplicationStatusUpdate, token?: string | null) =>
      request<ApplicationPublic>(`/api/v1/applications/${id}/status`, {
        method: "PATCH",
        body: data,
        token,
      }),
  },

  // --- Matching -----------------------------------------------------------
  matches: {
    forLearner: (params?: { min_score?: number; page?: number; page_size?: number }, token?: string | null) =>
      request<PaginatedResponse<MatchPublic>>("/api/v1/matches/opportunities", {
        query: params as Record<string, QueryValue>,
        token,
      }),
    calculate: (opportunityId: string, token?: string | null) =>
      request<MatchPublic>(`/api/v1/matches/opportunities/${opportunityId}/calculate`, {
        method: "POST",
        token,
      }),
  },

  // --- Experiences --------------------------------------------------------
  experiences: {
    mine: (
      params?: { status?: ExperienceStatus | null; page?: number; page_size?: number },
      token?: string | null,
    ) =>
      request<PaginatedResponse<ExperiencePublic>>("/api/v1/experiences/me", {
        query: params as Record<string, QueryValue>,
        token,
      }),
    get: (id: string, token?: string | null) =>
      request<ExperiencePublic>(`/api/v1/experiences/${id}`, { token }),
    create: (data: ExperienceCreate, token?: string | null) =>
      request<ExperiencePublic>("/api/v1/experiences", {
        method: "POST",
        body: data,
        token,
      }),
    fromApplication: (applicationId: string, token?: string | null) =>
      request<ExperiencePublic>(
        `/api/v1/experiences/from-application/${applicationId}`,
        { method: "POST", token },
      ),
    complete: (id: string, token?: string | null) =>
      request<ExperiencePublic>(`/api/v1/experiences/${id}/complete`, {
        method: "POST",
        token,
      }),
    submitFeedback: (
      id: string,
      data: ExperienceFeedbackCreate,
      token?: string | null,
    ) =>
      request<ExperienceFeedbackPublic>(
        `/api/v1/experiences/${id}/feedback`,
        { method: "POST", body: data, token },
      ),
    listFeedback: (id: string, token?: string | null) =>
      request<ExperienceFeedbackPublic[]>(
        `/api/v1/experiences/${id}/feedback`,
        { token },
      ),
  },

  // --- Notifications ------------------------------------------------------
  notifications: {
    list: (
      params?: { unread_only?: boolean; page?: number; page_size?: number },
      token?: string | null,
    ) =>
      request<PaginatedResponse<NotificationPublic>>("/api/v1/notifications", {
        query: params as Record<string, QueryValue>,
        token,
      }),
    markRead: (id: string, token?: string | null) =>
      request<NotificationPublic>(`/api/v1/notifications/${id}/read`, {
        method: "PATCH",
        token,
      }),
    markAllRead: (token?: string | null) =>
      request<Record<string, number>>("/api/v1/notifications/read-all", {
        method: "POST",
        token,
      }),
  },

  // --- Employer Analytics -------------------------------------------------
  analytics: {
    organization: (organizationId: string, token?: string | null) =>
      request<OrganizationAnalytics>(
        `/api/v1/analytics/organizations/${organizationId}`,
        { token },
      ),
  },
};

// Re-export VerificationPublic type used above
export interface VerificationPublic {
  id: string;
  evidence_id: string;
  verifier_id: string;
  from_status: string;
  to_status: string;
  notes: string | null;
  created_at: string;
}

