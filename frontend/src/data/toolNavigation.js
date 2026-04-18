import { getToolSections } from "./toolSections";

const GBM_KEY = "green-business-model";

export const GBM_NAVIGATION_SECTIONS = [
  { id: "gbm-1", title: "Instruction 1.1: Sketch your business idea", stepGroup: 1 },
  { id: "gbm-2", title: "Instruction 1.2: Identify problems and needs", stepGroup: 1 },
  { id: "gbm-3", title: "Instruction 1.3: Understand context (PESTEL)", stepGroup: 1 },
  { id: "gbm-4", title: "Instruction 1.4: Set your goals", stepGroup: 1 },
  { id: "gbm-5", title: "Instruction 1.5: Synthesize mission and vision", stepGroup: 1 },
  { id: "gbm-6", title: "Instruction 1.6: Summary of context and objectives", stepGroup: 1 },
  { id: "gbm-7", title: "Instruction 2.1a: Identify and map stakeholders", stepGroup: 2 },
  { id: "gbm-8", title: "Instruction 2.1b: Stakeholder map", stepGroup: 2 },
  { id: "gbm-9", title: "Instruction 2.2: Customer segments", stepGroup: 2 },
  { id: "gbm-10", title: "Instruction 2.3: Value proposition canvas", stepGroup: 2 },
  { id: "gbm-11", title: "Instruction 2.4a: Testing the value proposition", stepGroup: 2 },
  { id: "gbm-12", title: "Instruction 2.4b: Carrying out test and results", stepGroup: 2 },
  { id: "gbm-13", title: "Instruction 2.5: Pivoting value proposition", stepGroup: 2 },
  { id: "gbm-14", title: "Instruction 2.6: Customer channels and relationships", stepGroup: 2 },
  { id: "gbm-15", title: "Instruction 2.7: Key activities and resources", stepGroup: 2 },
  { id: "gbm-16", title: "Instruction 2.8: Ecodesign your business", stepGroup: 2 },
  { id: "gbm-17", title: "Instruction 2.9: Summary of key activities, resources, relationships, and channels", stepGroup: 2 },
  { id: "gbm-18", title: "Instruction 2.10: Cost structure", stepGroup: 2 },
  { id: "gbm-19", title: "Instruction 2.11: Revenue streams", stepGroup: 2 },
  { id: "gbm-20", title: "Instruction 2.12: Summary of cost structure and revenue streams", stepGroup: 2 },
  { id: "gbm-21", title: "Instruction 3.1: Test", stepGroup: 3 },
  { id: "gbm-22", title: "Instruction 3.2: Design your test", stepGroup: 3 },
  { id: "gbm-23", title: "Instruction 3.3: Design your test plan", stepGroup: 3 },
  { id: "gbm-24", title: "Instruction 3.4: Carrying out the test and results", stepGroup: 3 },
  { id: "gbm-25", title: "Instruction 3.5: Customer satisfaction", stepGroup: 3 },
  { id: "gbm-26", title: "Instruction 4: Implement", stepGroup: 4 },
  { id: "gbm-27", title: "Instruction 5.1: Measure and improve", stepGroup: 5 },
  { id: "gbm-28", title: "Instruction 5.2: Indicators", stepGroup: 5 }
];

function getStepGroup(section, index) {
  const stepGroup = Number(section?.stepGroup);
  if (Number.isFinite(stepGroup) && stepGroup > 0) return stepGroup;

  const step = Number(section?.step);
  if (Number.isFinite(step) && step > 0) return step;

  return index + 1;
}

function getStepLabel(stepNumber) {
  return `Step ${stepNumber}`;
}

function getStepTitle(sectionTitle, stepNumber) {
  const cleanedTitle = String(sectionTitle || "")
    .replace(/^instruction\s+\d+(?:\.\d+)?[a-z]?:\s*/i, "")
    .replace(/^step\s+\d+(?:\.\d+)?[a-z]?:\s*/i, "")
    .trim();

  return cleanedTitle || getStepLabel(stepNumber);
}

export function getToolNavigationSections(tool) {
  if (!tool) return [];
  if (tool.key === GBM_KEY) return GBM_NAVIGATION_SECTIONS;
  return getToolSections(tool);
}

export function getToolStepGroups(tool) {
  const groups = [];
  const sections = getToolNavigationSections(tool);

  sections.forEach((section, sectionIndex) => {
    const stepNumber = getStepGroup(section, sectionIndex);
    const existingGroup = groups.find((group) => group.stepNumber === stepNumber);

    if (existingGroup) {
      existingGroup.items.push({ ...section, sectionIndex });
      return;
    }

    groups.push({
      id: `${tool?.key || "tool"}-step-${stepNumber}`,
      stepNumber,
      label: getStepLabel(stepNumber),
      title: getStepTitle(section?.title, stepNumber),
      items: [{ ...section, sectionIndex }]
    });
  });

  return groups;
}
