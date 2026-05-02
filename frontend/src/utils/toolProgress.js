import { TOOLS_CATALOG, getToolByKey } from "../data/toolsCatalog";

const TOOL_PROJECT_TYPE = {
  "green-business-model": "GREEN_BMC",
  "green-business-plan": "GREEN_BUSINESS_PLAN"
};

const GBM_KEY = "green-business-model";
const GBM_STATIC_FIELDS = [
  "idea",
  "offer",
  "customers",
  "partners",
  "env",
  "social",
  "market",
  "team",
  "political_what",
  "political_how",
  "economic_what",
  "economic_how",
  "social_what",
  "social_how",
  "technological_what",
  "technological_how",
  "environmental_what",
  "environmental_how",
  "legal_what",
  "legal_how",
  "env_problem",
  "env_obj",
  "social_problem",
  "social_obj",
  "cust_problem",
  "cust_obj",
  "team_problem",
  "team_obj",
  "mission",
  "vision",
  "canvas_name",
  "canvas_company",
  "canvas_value",
  "canvas_cost",
  "canvas_revenue",
  "stakeholders",
  "stakeholder_map",
  "stakeholder_priority",
  "vp_env",
  "vp_social",
  "vp_pain_rel",
  "vp_pains",
  "vp_gain_create",
  "vp_gains",
  "vp_product_what",
  "vp_product_how",
  "vp_functions",
  "vp_economic",
  "vp_innovation",
  "test_obj_h",
  "test_obj_q",
  "test_c_h",
  "test_c_q",
  "test_s_h",
  "test_s_q",
  "test_v_h",
  "test_v_q",
  "disc_participant",
  "disc_surprise",
  "disc_matter",
  "disc_learning",
  "disc_future",
  "disc_notes",
  "pivot_vp",
  "pivot_stakeholders",
  "pivot_segment",
  "act_problem",
  "act_production",
  "act_platform",
  "act_supply",
  "res_human",
  "res_physical",
  "res_intel",
  "res_fin",
  "eco_type",
  "eco_materials",
  "eco_production",
  "eco_packaging",
  "eco_use",
  "eco_eol",
  "eco_service",
  "eco_sales",
  "eco_infra",
  "eco_result",
  "s15_key_activities",
  "s15_key_resources",
  "s15_relationships",
  "s15_channels",
  "s15_summary",
  "s16_investment_costs",
  "s16_investment_costs_estimate",
  "s16_fixed_costs",
  "s16_fixed_costs_estimate",
  "s16_variable_costs",
  "s16_variable_costs_estimate",
  "s16_fixed_costs_strategy",
  "s16_total_costs",
  "s16_recap",
  "s16_cost",
  "s17_products_services",
  "s17_revenue_models",
  "s17_revenue_characteristics",
  "s17_additional_revenue",
  "s17_rev",
  "s18_summary_cost_revenue",
  "test_hypotheses",
  "test_questions",
  "test_where",
  "test_early_adopters",
  "test_feedback_collection",
  "test_plan",
  "test_participant_data",
  "test_surprises",
  "test_matters_most",
  "test_main_themes",
  "test_new_topics",
  "test_notes",
  "test_learnings",
  "test_recap_problems",
  "test_recap_objectives",
  "test_recap_indicators",
  "test_satisfaction_aspects",
  "test_satisfaction_rating",
  "test_satisfaction_comments",
  "indicators_project",
  "indicators_social",
  "indicators_customer",
  "indicators_team",
  "indicators_environmental"
];

function hasValue(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
}

function safeParse(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getGbmQuestionIds(answers = {}) {
  const cards = Math.max(1, Number(answers.__cards || 1));
  const stages = Math.max(1, Number(answers.__stages || 1));
  const stakeholderRows = Math.max(1, Number(answers.__stakeholderRows || 1));
  const vpRows = Math.max(1, Number(answers.__vpRows || 1));

  const stakeholderIds = Array.from({ length: stakeholderRows }).flatMap((_, index) => [
    `stake_${index + 1}_name`,
    `stake_${index + 1}_business`,
    `stake_${index + 1}_stakeholder`
  ]);

  const customerIds = Array.from({ length: cards }).flatMap((_, index) => [
    `cust_${index + 1}_segment`,
    `cust_${index + 1}_generic`,
    `cust_${index + 1}_pains`,
    `cust_${index + 1}_gains`,
    `cust_${index + 1}_jobs`
  ]);

  const valuePropIds = Array.from({ length: vpRows }).flatMap((_, index) => [
    `vp_row_${index + 1}_prop`,
    `vp_row_${index + 1}_segment`
  ]);

  const stageIds = Array.from({ length: stages }).flatMap((_, index) => [
    `stage_${index + 1}_segment`,
    `stage_${index + 1}_order`,
    `stage_${index + 1}_stage`,
    `stage_${index + 1}_emotion`,
    `stage_${index + 1}_thoughts`,
    `stage_${index + 1}_touch`,
    `stage_${index + 1}_ux`,
    `stage_${index + 1}_need`
  ]);

  return [
    ...GBM_STATIC_FIELDS,
    ...stakeholderIds,
    ...customerIds,
    ...valuePropIds,
    ...stageIds
  ];
}

function getQuestionIdsForTool(toolKey, tool, answers = {}) {
  if (toolKey === GBM_KEY) return getGbmQuestionIds(answers);
  return (tool?.questions || []).map((question) => question.id);
}

export function getToolStorageKey(uid, toolKey) {
  return `green.tools.${uid || "anonymous"}.${toolKey}`;
}

export function getToolProjectType(toolKey) {
  return TOOL_PROJECT_TYPE[toolKey] || null;
}

export function getToolForProjectType(projectType) {
  return TOOLS_CATALOG.find((tool) => getToolProjectType(tool.key) === projectType) || null;
}

export function countAnsweredQuestions(tool, answers = {}) {
  const questionIds = getQuestionIdsForTool(tool?.key, tool, answers);
  return questionIds.reduce((count, questionId) => count + (hasValue(answers[questionId]) ? 1 : 0), 0);
}

export function calculateToolProgress(tool, answers = {}) {
  const questionIds = getQuestionIdsForTool(tool?.key, tool, answers);
  const totalCount = questionIds.length;
  const answeredCount = countAnsweredQuestions(tool, answers);
  const percent = totalCount === 0 ? 0 : Math.round((answeredCount / totalCount) * 100);

  let status = "Not started";
  if (percent > 0 && percent < 100) status = "In progress";
  if (percent === 100) status = "Completed";

  return { totalCount, answeredCount, percent, status };
}

export function readLocalToolAnswers(uid, toolKey) {
  if (typeof window === "undefined") return {};
  const raw = window.localStorage.getItem(getToolStorageKey(uid, toolKey));
  if (!raw) return {};
  const parsed = safeParse(raw);
  return typeof parsed === "object" && parsed ? parsed : {};
}

export function saveLocalToolAnswers(uid, toolKey, answers) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(getToolStorageKey(uid, toolKey), JSON.stringify(answers || {}));
}

function findProjectForTool(toolKey, projects = []) {
  const projectType = getToolProjectType(toolKey);
  if (!projectType) return null;
  return projects.find((project) => project.type === projectType) || null;
}

export function resolveAnswersForTool({ uid, toolKey, projects = [] }) {
  const tool = getToolByKey(toolKey);
  if (!tool) return { answers: {}, source: "none", project: null };

  const project = findProjectForTool(toolKey, projects);
  if (project) {
    const forms = project.forms || {};
    const projectAnswers = {};
    getQuestionIdsForTool(toolKey, tool, forms).forEach((questionId) => {
      if (forms[questionId] !== undefined) {
        projectAnswers[questionId] = forms[questionId];
      }
    });
    if (toolKey === GBM_KEY) {
      ["__cards", "__stages", "__stakeholderRows", "__vpRows"].forEach((metaKey) => {
        if (forms[metaKey] !== undefined) {
          projectAnswers[metaKey] = forms[metaKey];
        }
      });
    }
    return { answers: projectAnswers, source: "project", project };
  }

  return {
    answers: readLocalToolAnswers(uid, toolKey),
    source: "local",
    project: null
  };
}

export function buildToolProgressList({ uid, projects = [] }) {
  return TOOLS_CATALOG.map((tool) => {
    const { answers, project } = resolveAnswersForTool({ uid, toolKey: tool.key, projects });
    const progress = calculateToolProgress(tool, answers);
    const mentorReview = project?.mentorToolReviews?.[tool.key] || null;
    const reviewedPercent = Number.isFinite(Number(mentorReview?.progressPercent))
      ? Number(mentorReview.progressPercent)
      : progress.percent;

    return {
      toolKey: tool.key,
      title: tool.title,
      project,
      mentorReview,
      hasMentorCorrection: Boolean(mentorReview?.reviewedAt),
      reviewedPercent,
      ...progress
    };
  });
}
