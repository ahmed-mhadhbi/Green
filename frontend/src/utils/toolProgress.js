import { TOOLS_CATALOG, getToolByKey } from "../data/toolsCatalog";

const TOOL_PROJECT_TYPE = {
  "green-business-model": "GREEN_BMC",
  "green-business-plan": "GREEN_BUSINESS_PLAN"
};

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

export function getToolStorageKey(uid, toolKey) {
  return `green.tools.${uid || "anonymous"}.${toolKey}`;
}

export function getToolProjectType(toolKey) {
  return TOOL_PROJECT_TYPE[toolKey] || null;
}

export function countAnsweredQuestions(tool, answers = {}) {
  return (tool?.questions || []).reduce((count, question) => {
    return count + (hasValue(answers[question.id]) ? 1 : 0);
  }, 0);
}

export function calculateToolProgress(tool, answers = {}) {
  const totalCount = (tool?.questions || []).length;
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
    tool.questions.forEach((question) => {
      if (forms[question.id] !== undefined) {
        projectAnswers[question.id] = forms[question.id];
      }
    });
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
    const { answers } = resolveAnswersForTool({ uid, toolKey: tool.key, projects });
    const progress = calculateToolProgress(tool, answers);

    return {
      toolKey: tool.key,
      title: tool.title,
      ...progress
    };
  });
}
