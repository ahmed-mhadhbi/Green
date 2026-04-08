import { getToolSections } from "./toolSections";

const GBM_KEY = "green-business-model";

const GBM_NAVIGATION_SECTIONS = [
  { id: "gbm-1", title: "Step 1: Sketch your business idea", stepGroup: 1 },
  { id: "gbm-2", title: "Step 1: Identify problems and needs", stepGroup: 1 },
  { id: "gbm-3", title: "Step 1: Understand context (PESTEL)", stepGroup: 1 },
  { id: "gbm-4", title: "Step 1: Set your goals", stepGroup: 1 },
  { id: "gbm-5", title: "Step 1: Synthesize mission & vision", stepGroup: 1 },
  { id: "gbm-6", title: "Step 1: Summary of context and objectives", stepGroup: 1 },
  { id: "gbm-7", title: "Step 2: 7a Identify and map stakeholders", stepGroup: 2 },
  { id: "gbm-8", title: "Step 2: 7b Stakeholder map", stepGroup: 2 },
  { id: "gbm-9", title: "Step 2: 8 Customer segments", stepGroup: 2 },
  { id: "gbm-10", title: "Step 2: 9 Value proposition canvas", stepGroup: 2 },
  { id: "gbm-11", title: "Step 2: 10 Testing the value proposition", stepGroup: 2 },
  { id: "gbm-12", title: "Step 2: 10b Carrying out test and results", stepGroup: 2 },
  { id: "gbm-13", title: "Step 2: 11 Pivoting value proposition", stepGroup: 2 },
  { id: "gbm-14", title: "Step 2: 12a Customer channels and relationships", stepGroup: 2 },
  { id: "gbm-15", title: "Step 2: 13 Key activities and resources", stepGroup: 2 },
  { id: "gbm-16", title: "14a - Ecodesign your business", stepGroup: 2 },
  { id: "gbm-17", title: "15 - Summary of key activities and resources and customer relationships and channels", stepGroup: 2 },
  { id: "gbm-18", title: "16 - Cost structure", stepGroup: 2 },
  { id: "gbm-19", title: "17 - Revenue stream", stepGroup: 2 },
  { id: "gbm-20", title: "18 - Summary of the cost structure and revenue streams", stepGroup: 2 },
  { id: "gbm-21", title: "Step 3 - Test", stepGroup: 3 },
  { id: "gbm-22", title: "19 - Design your test!", stepGroup: 3 },
  { id: "gbm-23", title: "19a - Design your test!", stepGroup: 3 },
  { id: "gbm-24", title: "19b - Carrying out the test and get results", stepGroup: 3 },
  { id: "gbm-25", title: "19c - Customer satisfaction", stepGroup: 3 },
  { id: "gbm-26", title: "Step 4 - Implement", stepGroup: 4 },
  { id: "gbm-27", title: "Step 5 - Measure and improve", stepGroup: 5 },
  { id: "gbm-28", title: "20 - Indicators", stepGroup: 5 }
];

function getStepGroup(section, index) {
  const stepGroup = Number(section?.stepGroup);
  if (Number.isFinite(stepGroup) && stepGroup > 0) return stepGroup;

  const step = Number(section?.step);
  if (Number.isFinite(step) && step > 0) return step;

  return index + 1;
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
      title: `Step ${stepNumber}`,
      items: [{ ...section, sectionIndex }]
    });
  });

  return groups;
}
