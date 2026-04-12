import { getToolSections } from "./toolSections";

const GBM_KEY = "green-business-model";

export const GBM_NAVIGATION_SECTIONS = [
  { id: "gbm-1", title: "Instruction 1.1:", stepGroup: 1 },
  { id: "gbm-2", title: "Instruction 1.2:", stepGroup: 1 },
  { id: "gbm-3", title: "Instruction 1.3:", stepGroup: 1 },
  { id: "gbm-4", title: "Instruction 1.4:", stepGroup: 1 },
  { id: "gbm-5", title: "Instruction 1.5:", stepGroup: 1 },
  { id: "gbm-6", title: "Instruction 1.6:", stepGroup: 1 },
  { id: "gbm-7", title: "Instruction 2.1a:", stepGroup: 2 },
  { id: "gbm-8", title: "Instruction 2.1b:", stepGroup: 2 },
  { id: "gbm-9", title: "Instruction 2.2:", stepGroup: 2 },
  { id: "gbm-10", title: "Instruction 2.3:", stepGroup: 2 },
  { id: "gbm-11", title: "Instruction 2.4a:", stepGroup: 2 },
  { id: "gbm-12", title: "Instruction 2.4b:", stepGroup: 2 },
  { id: "gbm-13", title: "Instruction 2.5:", stepGroup: 2 },
  { id: "gbm-14", title: "Instruction 2.6:", stepGroup: 2 },
  { id: "gbm-15", title: "Instruction 2.7:", stepGroup: 2 },
  { id: "gbm-16", title: "Instruction 2.8:", stepGroup: 2 },
  { id: "gbm-17", title: "Instruction 2.9:", stepGroup: 2 },
  { id: "gbm-18", title: "Instruction 2.10:", stepGroup: 2 },
  { id: "gbm-19", title: "Instruction 2.11:", stepGroup: 2 },
  { id: "gbm-20", title: "Instruction 2.12:", stepGroup: 2 },
  { id: "gbm-21", title: "Instruction 3.1:", stepGroup: 3 },
  { id: "gbm-22", title: "Instruction 3.2:", stepGroup: 3 },
  { id: "gbm-23", title: "Instruction 3.3:", stepGroup: 3 },
  { id: "gbm-24", title: "Instruction 3.4:", stepGroup: 3 },
  { id: "gbm-25", title: "Instruction 3.5:", stepGroup: 3 },
  { id: "gbm-26", title: "Instruction 4:", stepGroup: 4 },
  { id: "gbm-27", title: "Instruction 5.1:", stepGroup: 5 },
  { id: "gbm-28", title: "Instruction 5.2:", stepGroup: 5 }
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
      title: `Step ${stepNumber}:`,
      items: [{ ...section, sectionIndex }]
    });
  });

  return groups;
}
