import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { jsPDF } from "jspdf";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { GBM_NAVIGATION_SECTIONS, getToolStepGroups } from "../data/toolNavigation";
import { getToolByKey } from "../data/toolsCatalog";
import { getToolSections } from "../data/toolSections";
import { calculateToolProgress, getToolProjectType, resolveAnswersForTool, saveLocalToolAnswers } from "../utils/toolProgress";

const GBM_KEY = "green-business-model";
const GBM_PAGES = [
  { n: 1, title: "Step 1: Sketch your business idea", q: [["idea", "What is your initial business idea?"], ["offer", "What will you offer?"], ["customers", "Who are your customers?"], ["partners", "Who are your partners?"]] },
  { n: 2, title: "Step 1: Identify problems and needs", domains: [{ t: "Environmental challenges", q: [["env", "Which environmental challenges are tackled?"]] }, { t: "Social challenges", q: [["social", "Which social challenges are tackled?"]] }, { t: "Market needs", q: [["market", "What are the biggest customer needs?"]] }, { t: "Team motivations", q: [["team", "What motivates the team?"]] }] },
  { n: 3, title: "Step 1: Understand context (PESTEL)", domains: ["Political", "Economic", "Social", "Technological", "Environmental", "Legal"].map((x) => ({ t: x, q: [[`${x.toLowerCase()}_what`, `What ${x.toLowerCase()} aspects affect your business?`], [`${x.toLowerCase()}_how`, `How will they affect your project and how will you confront them?`]] })) },
  { n: 4, title: "Step 1: Set your goals", domains: [{ t: "Environmental challenges", q: [["env_problem", "Problems & needs"], ["env_obj", "Objectives"]] }, { t: "Social challenges", q: [["social_problem", "Problems & needs"], ["social_obj", "Objectives"]] }, { t: "Customer needs", q: [["cust_problem", "Problems & needs"], ["cust_obj", "Objectives"]] }, { t: "Team motivations", q: [["team_problem", "Problems & needs"], ["team_obj", "Objectives"]] }] },
  { n: 5, title: "Step 1: Synthesize mission & vision", plus: ["env_obj", "social_obj", "cust_obj", "team_obj"], q: [["mission", "Mission"], ["vision", "Vision"]] },
  { n: 6, title: "Step 1: Summary of context and objectives", star: [["Problems and needs (Environmental)", "env_problem"], ["Problems and needs (Social)", "social_problem"], ["Project objectives (Environmental)", "env_obj"], ["Project objectives (Social)", "social_obj"], ["Mission statement", "mission"], ["Vision statement", "vision"]], q: [["canvas_name", "Canvas name"], ["canvas_company", "Company"], ["canvas_value", "Value proposition"], ["canvas_cost", "Cost structure"], ["canvas_revenue", "Revenue streams"]] },
  { n: 7, title: "Step 2: 7a Identify and map stakeholders", plus: ["env_obj", "social_obj", "cust_obj", "team_obj"], q: [["stakeholders", "List stakeholders"], ["stakeholder_map", "How are they mapped?"], ["stakeholder_priority", "Which stakeholders are priority?"]] },
  { n: 8, title: "Step 2: 7b Stakeholder map", q: [] },
  { n: 9, title: "Step 2: 8 Customer segments", dynamic: "customerCards" },
  { n: 10, title: "Step 2: 9 Value proposition canvas", domains: [{ t: "Environmental value", q: [["vp_env", "Environmental value summary"]] }, { t: "Social value", q: [["vp_social", "Social value summary"]] }, { t: "Gain creators and pain relievers", q: [["vp_pain_rel", "Pain relievers"], ["vp_pains", "Pains"], ["vp_gain_create", "Gain creators"], ["vp_gains", "Gains"]] }, { t: "Products and services", q: [["vp_product_what", "What does the product/service do?"], ["vp_product_how", "How does it work?"], ["vp_functions", "Functions"]] }, { t: "Economic added value and feasibility", q: [["vp_economic", "Economic added value"]] }, { t: "Innovation value", q: [["vp_innovation", "Innovation value"]] }] },
  { n: 11, title: "Step 2: 10 Testing the value proposition", domains: [{ t: "Objectives", q: [["test_obj_h", "Hypothesis"], ["test_obj_q", "Questions"]] }, { t: "Customers", q: [["test_c_h", "Hypothesis"], ["test_c_q", "Questions"]] }, { t: "Stakeholders", q: [["test_s_h", "Hypothesis"], ["test_s_q", "Questions"]] }, { t: "Value proposition", q: [["test_v_h", "Hypothesis"], ["test_v_q", "Questions"]] }] },
  { n: 12, title: "Step 2: 10b Carrying out test and results", q: [["disc_participant", "Participants data"], ["disc_surprise", "What surprised you?"], ["disc_matter", "What mattered most?"], ["disc_learning", "Main themes/learned"], ["disc_future", "Future topics/questions"], ["disc_notes", "Notes"]] },
  { n: 13, title: "Step 2: 11 Pivoting value proposition", q: [["pivot_vp", "Reword value proposition"], ["pivot_stakeholders", "Stakeholders updates"], ["pivot_segment", "Customer segment updates"]] },
  { n: 14, title: "Step 2: 12a Customer channels and relationships", dynamic: "journeyStages" },
  { n: 15, title: "Step 2: 13 Key activities and resources", domains: [{ t: "Key activities", q: [["act_problem", "Problem solving"], ["act_production", "Production"], ["act_platform", "Platform/network/sales"], ["act_supply", "Supply chain management"]] }, { t: "Key resources", q: [["res_human", "Human capital"], ["res_physical", "Physical capital"], ["res_intel", "Intellectual and digital capital"], ["res_fin", "Financial capital"]] }] },
  {
    n: 16,
    title: "Step 2: 14a Ecodesign your business",
    display: "14a - Ecodesign your business",
    copy: [
      "After defining the key activities and resources, ecodesign the best solution to deliver your value. This exercise helps you rethink those activities and resources to assess and improve environmental performance.",
      "The ecodesign process is structured into three steps (ecodesign cards): evaluate and gather info, score, and improve.",
      "Before starting, select whether your business offers a product (and its related services) or a service only.",
      "To improve your score and further ecodesign your product/service, edit the lifecycle stages and save updates to refresh results."
    ],
    q: [["eco_type", "Business offers (Product/Service)"], ["eco_materials", "Materials & resources"], ["eco_production", "Production"], ["eco_packaging", "Packaging & distribution"], ["eco_use", "Use & maintenance"], ["eco_eol", "End of life management"], ["eco_service", "Service"], ["eco_sales", "Sales & communication"], ["eco_infra", "Infrastructure"], ["eco_result", "Ecodesign result"]]
  },
  {
    n: 17,
    title: "Step 2: 15 Summary of key activities/resources and customer relationships/channels",
    display: "15 - Summary of key activities and resources and customer relationships and channels",
    copy: [
      "Revise the content according to the results of the eco-design exercise.",
      "Key activities and resources are reported from Exercise 13. Update them based on the ecodesign results.",
      "Customer relationships and channels should reflect what you identified in the customer map."
    ],
    q: [
      ["s15_key_activities", "Key activities (summary)"],
      ["s15_key_resources", "Key resources (summary)"],
      ["s15_relationships", "Customer relationships"],
      ["s15_channels", "Customer channels"],
      ["s15_summary", "Overall summary of activities, resources, relationships, and channels"]
    ]
  },
  {
    n: 18,
    title: "Step 2: 16 Cost structure",
    display: "16 - Cost structure",
    copy: [
      "Brainstorm: go back to Exercise 13 to review activities and resources. List the investment costs to start the business and the most important costs inherent to your model (fixed and variable).",
      "Price: estimate costs for each item. Transform: reduce fixed costs as much as possible. Sum up the total fixed and variable costs. Recap anything that needs special attention."
    ],
    q: [
      ["s16_investment_costs", "Investment costs to start the business"],
      ["s16_investment_costs_estimate", "Estimated investment costs"],
      ["s16_fixed_costs", "Most important fixed costs"],
      ["s16_fixed_costs_estimate", "Estimated fixed costs"],
      ["s16_variable_costs", "Most important variable costs"],
      ["s16_variable_costs_estimate", "Estimated variable costs"],
      ["s16_fixed_costs_strategy", "Strategy to reduce fixed costs"],
      ["s16_total_costs", "Total fixed and variable costs (sum up)"],
      ["s16_recap", "Recap: special attention items"],
      ["s16_cost", "Cost structure summary"]
    ]
  },
  {
    n: 19,
    title: "Step 2: 17 Revenue streams",
    display: "17 - Revenue stream",
    copy: [
      "List the products and/or services you will deliver. Select a revenue model and assign a price for each stream.",
      "Describe the characteristics of each revenue stream, rank their importance, and link them to customer segments and channels."
    ],
    q: [
      ["s17_products_services", "Products and services you are offering"],
      ["s17_revenue_models", "Revenue model and pricing for each stream"],
      ["s17_revenue_characteristics", "Characteristics and ranking of revenue streams"],
      ["s17_additional_revenue", "Other ways to increase revenue"],
      ["s17_rev", "Revenue streams summary"]
    ]
  },
  {
    n: 20,
    title: "Step 2: 18 Summary of the cost structure and revenue streams",
    display: "18 - Summary of the cost structure and revenue streams",
    copy: [
      "Using the information gathered through Exercises 16 and 17, summarize your findings on the cost structure and revenue streams. Be clear and make sure you have the right numbers."
    ],
    plus: ["s16_cost", "s17_rev"],
    q: [["s18_summary_cost_revenue", "Summary of cost structure and revenue streams"]]
  },
  {
    n: 21,
    title: "Step 3: Test",
    display: "Step 3 - Test",
    copy: [
      "It is time for another test. You have a prototype, but you need to validate if it satisfies customer expectations, whether delivery works as planned, and if customers are willing to pay the price.",
      "Engage with customers and stakeholders to gather qualitative and quantitative feedback. The test is divided into the following exercises."
    ],
    q: []
  },
  {
    n: 22,
    title: "Design your test",
    display: "19 - Design your test!",
    copy: [
      "Identify the hypotheses that need validation (availability to pay, interest, delivery service, acceptance of products, etc.).",
      "Define the questions you need to raise and the ways you will validate them."
    ],
    q: [
      ["test_hypotheses", "Hypotheses to validate"],
      ["test_questions", "Questions to validate the hypotheses"],
      ["test_where", "Where are you going to test your prototype?"],
      ["test_early_adopters", "Who are your early adopters (name, number)?"],
      ["test_feedback_collection", "How will you collect their feedback?"]
    ]
  },
  {
    n: 23,
    title: "Design your test (plan)",
    display: "19a - Design your test!",
    q: [["test_plan", "How are you planning to get those hypotheses tested?"]]
  },
  {
    n: 24,
    title: "Carrying out the test and results",
    display: "19b - Carrying out the test and get results",
    copy: [
      "Go out to the streets, observe, and ask your first customers, stakeholders, and other people involved. Capture their satisfaction with price, quality, emotions, and encountered problems.",
      "Record findings using the discovery card and summarize your learnings."
    ],
    q: [
      ["test_participant_data", "Participant's data"],
      ["test_surprises", "What surprised you about participant responses?"],
      ["test_matters_most", "Which things matter most to the participant?"],
      ["test_main_themes", "Main themes or learnings"],
      ["test_new_topics", "New topics or questions to explore"],
      ["test_notes", "Notes"],
      ["test_learnings", "What did I learn about...?"],
      ["test_recap_problems", "Recap: problems and needs identified"],
      ["test_recap_objectives", "Set objectives based on findings"],
      ["test_recap_indicators", "Measure progress: indicators (optional)"]
    ]
  },
  {
    n: 25,
    title: "Customer satisfaction",
    display: "19c - Customer satisfaction",
    copy: [
      "Use the Satisfaction Card to collect specific information about customer satisfaction.",
      "Rate satisfaction from 1 (lowest) to 5 (highest) for the key aspects you choose, and record comments."
    ],
    q: [
      ["test_satisfaction_aspects", "Aspects you evaluated (price, quality, emotions, etc.)"],
      ["test_satisfaction_rating", "Satisfaction rating (1-5)"],
      ["test_satisfaction_comments", "Customer comments"]
    ]
  },
  {
    n: 26,
    title: "Step 4: Implement",
    display: "Step 4 - Implement",
    copy: [
      "After validating the model, carefully plan the development and management of your business and then proceed with operations.",
      "A multi-dimensional approach to planning touches every major area of the business and helps you manage day-to-day operations while pursuing long-term objectives."
    ],
    q: []
  },
  {
    n: 27,
    title: "Step 5: Measure and improve",
    display: "Step 5 - Measure and improve",
    copy: [
      "Green entrepreneurship tackles environmental and social challenges while providing fair value to partners.",
      "In the execution phase, regularly measure progress toward objectives and reinvent where necessary through impact measurement and continuous improvement."
    ],
    q: []
  },
  {
    n: 28,
    title: "Indicators",
    display: "20 - Indicators",
    copy: [
      "You are running your business, but do you know whether you are achieving your objectives? Measurement systems help you track progress and improve.",
      "Use your earlier project indicators, environmental performance indicators, and context analysis to set measurement parameters."
    ],
    q: [
      ["indicators_project", "Project indicators (overall)"],
      ["indicators_social", "Project indicators - social challenges"],
      ["indicators_customer", "Project indicators - customer needs"],
      ["indicators_team", "Project indicators - team motivators"],
      ["indicators_environmental", "Environmental performance indicators"]
    ]
  }
];

const cardFields = [["segment", "Segment"], ["generic", "Generic description"], ["pains", "Pains"], ["gains", "Gains"], ["jobs", "Functions/jobs to cover"]];
const stageFields = [["segment", "Customer segment"], ["order", "Order stage"], ["stage", "Stage"], ["emotion", "Emotions"], ["thoughts", "Needs & thoughts"], ["touch", "Touch points & channels"], ["ux", "Unique experience"], ["need", "What do we need to provide"]];
const ecoCards = [
  ["eco_materials", "Materials & resources"],
  ["eco_production", "Production"],
  ["eco_packaging", "Packaging & distribution"],
  ["eco_use", "Use & maintenance"],
  ["eco_eol", "End of life management"],
  ["eco_service", "Service"],
  ["eco_sales", "Sales & communication"],
  ["eco_infra", "Infrastructure"]
];
const EMPTY_ANSWER = "(not answered yet)";

function getGbmInstructionTitle(pageNumber) {
  return GBM_NAVIGATION_SECTIONS[pageNumber - 1]?.title || null;
}

function hasAnswer(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim().length > 0;
}

function buildQs(page, cards, stages, stakeholderRows, vpRows) {
  if (!page) return [];
  if (page.n === 8) {
    return Array.from({ length: stakeholderRows }).flatMap((_, i) => [
      { id: `stake_${i + 1}_name`, label: `Stakeholder ${i + 1} name` },
      { id: `stake_${i + 1}_business`, label: `Stakeholder ${i + 1} effect on business` },
      { id: `stake_${i + 1}_stakeholder`, label: `Business effect on stakeholder ${i + 1}` }
    ]);
  }
  if (page.n === 10) {
    const base = (page.domains || []).flatMap((d) => (d.q || []).map(([id, label]) => ({ id, label })));    
    const rows = Array.from({ length: vpRows }).flatMap((_, i) => [
      { id: `vp_row_${i + 1}_prop`, label: `Value proposition row ${i + 1}` },
      { id: `vp_row_${i + 1}_segment`, label: `Customer segment row ${i + 1}` }
    ]);
    return [...base, ...rows];
  }
  if (page.dynamic === "customerCards") return Array.from({ length: cards }).flatMap((_, i) => cardFields.map(([k, l]) => ({ id: `cust_${i + 1}_${k}`, label: `Customer card ${i + 1}: ${l}` })));
  if (page.dynamic === "journeyStages") return Array.from({ length: stages }).flatMap((_, i) => stageFields.map(([k, l]) => ({ id: `stage_${i + 1}_${k}`, label: `Stage ${i + 1}: ${l}` })));
  const a = (page.q || []).map(([id, label]) => ({ id, label }));
  const b = (page.domains || []).flatMap((d) => (d.q || []).map(([id, label]) => ({ id, label })));
  return [...a, ...b];
}

export default function ToolQuestionnairePage() {
  const { toolKey } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { token, profile, firebaseUser } = useAuth();
  const tool = getToolByKey(toolKey);
  const [projects, setProjects] = useState([]);
  const [answers, setAnswers] = useState({});
  const [source, setSource] = useState("local");
  const [projectId, setProjectId] = useState(null);
  const [message, setMessage] = useState("");
  const [cards, setCards] = useState(1);
  const [stages, setStages] = useState(1);
  const [stakeholderRows, setStakeholderRows] = useState(1);
  const [vpRows, setVpRows] = useState(1);
  const [openSidebarStepId, setOpenSidebarStepId] = useState(null);
  const isGbm = tool?.key === GBM_KEY;

  useEffect(() => {
    async function load() {
      if (!tool) return;
      if (profile?.role === "entrepreneur" && token) {
        try {
          const res = await apiRequest("/projects/my", { token });
          const list = res.projects || [];
          setProjects(list);
          const resolved = resolveAnswersForTool({ uid: firebaseUser?.uid, toolKey, projects: list });
          setAnswers(resolved.answers);
          setSource(resolved.source);
          setProjectId(resolved.project?.id || null);
          return;
        } catch (err) {
          setMessage(err.message);
        }
      }
      const resolved = resolveAnswersForTool({ uid: firebaseUser?.uid, toolKey, projects: [] });
      setAnswers(resolved.answers);
      setSource("local");
      setProjectId(null);
    }
    load();
  }, [firebaseUser?.uid, profile?.role, token, tool, toolKey]);

  useEffect(() => {
    setMessage("");
  }, [toolKey]);

  useEffect(() => {
    if (!isGbm) return;
    setCards(Math.max(1, Number(answers.__cards || 1)));
    setStages(Math.max(1, Number(answers.__stages || 1)));
    setStakeholderRows(Math.max(1, Number(answers.__stakeholderRows || 1)));
    setVpRows(Math.max(1, Number(answers.__vpRows || 1)));
  }, [answers, isGbm]);

  const questionMap = useMemo(() => new Map((tool?.questions || []).map((question) => [question.id, question])), [tool]);
  const toolSections = useMemo(() => {
    if (!tool) return [];
    if (isGbm) {
      return GBM_PAGES.map((pageDef) => ({
        id: `gbm-${pageDef.n}`,
        title: getGbmInstructionTitle(pageDef.n) || pageDef.display || pageDef.title,
        description: (pageDef.copy || [])[0] || "Complete this step before moving to the next one.",
        questionIds: buildQs(pageDef, cards, stages, stakeholderRows, vpRows).map((question) => question.id)
      }));
    }
    return getToolSections(tool);
  }, [tool, isGbm, cards, stages, stakeholderRows, vpRows]);
  const requestedSectionIndex = Number.parseInt(searchParams.get("section") || "0", 10);
  const p = Number.isInteger(requestedSectionIndex)
    && requestedSectionIndex >= 0
    && requestedSectionIndex < toolSections.length
    ? requestedSectionIndex
    : 0;
  const page = isGbm ? GBM_PAGES[p] : null;
  const pageQs = isGbm ? buildQs(page, cards, stages, stakeholderRows, vpRows) : [];
  const allGbmQs = useMemo(() => GBM_PAGES.flatMap((pageDef) => buildQs(pageDef, cards, stages, stakeholderRows, vpRows)), [cards, stages, stakeholderRows, vpRows]);

  const progress = useMemo(() => {
    if (!tool) return { answeredCount: 0, totalCount: 0, percent: 0, status: "Not started" };
    if (!isGbm) return calculateToolProgress(tool, answers);
    const totalCount = allGbmQs.length;
    const answeredCount = allGbmQs.reduce((count, question) => count + (hasAnswer(answers[question.id]) ? 1 : 0), 0);

    let status = "Not started";
    if (answeredCount > 0 && answeredCount < totalCount) status = "In progress";
    if (totalCount > 0 && answeredCount === totalCount) status = "Completed";

    return {
      totalCount,
      answeredCount,
      percent: totalCount ? Math.round((answeredCount / totalCount) * 100) : 0,
      status
    };
  }, [allGbmQs, answers, isGbm, tool]);

  const sectionSummaries = useMemo(() => {
    return toolSections.map((section, index) => {
      const questionIds = isGbm ? section.questionIds : section.questionIds.filter((questionId) => questionMap.has(questionId));
      const totalCount = questionIds.length;
      const answeredCount = questionIds.reduce((count, questionId) => count + (hasAnswer(answers[questionId]) ? 1 : 0), 0);

      return {
        ...section,
        index,
        questionIds,
        totalCount,
        answeredCount,
        isComplete: totalCount === 0 || answeredCount === totalCount
      };
    });
  }, [answers, isGbm, questionMap, toolSections]);

  const stepGroups = useMemo(() => {
    if (!tool) return [];

    const sectionMap = new Map(sectionSummaries.map((section) => [section.id, section]));

    return getToolStepGroups(tool)
      .map((group) => {
        const items = group.items
          .map((item) => sectionMap.get(item.id) || sectionSummaries[item.sectionIndex] || null)
          .filter(Boolean)
          .sort((left, right) => left.index - right.index);

        const totalCount = items.reduce((count, item) => count + item.totalCount, 0);
        const answeredCount = items.reduce((count, item) => count + item.answeredCount, 0);

        return {
          ...group,
          items,
          totalCount,
          answeredCount,
          isComplete: items.length > 0 && items.every((item) => item.isComplete),
          hasCurrent: items.some((item) => item.index === p)
        };
      })
      .filter((group) => group.items.length > 0);
  }, [p, sectionSummaries, tool]);

  const currentSection = sectionSummaries[p] || null;
  const currentStepGroup = stepGroups.find((group) => group.hasCurrent) || stepGroups[0] || null;
  const canNext = currentSection ? currentSection.isComplete : false;

  useEffect(() => {
    if (!currentStepGroup?.id) return;
    setOpenSidebarStepId(currentStepGroup.id);
  }, [currentStepGroup?.id]);

  if (!tool) {
    return (
      <section className="card">
        <h2>Tool not found</h2>
        <Link to="/app/tools" className="btn">Back to tools</Link>
      </section>
    );
  }

  const setA = (id, v) => setAnswers((x) => ({ ...x, [id]: v }));
  const goToSection = (nextIndex) => {
    if (toolSections.length === 0) return;

    const safeIndex = Math.max(0, Math.min(nextIndex, toolSections.length - 1));
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("section", String(safeIndex));
    setSearchParams(nextParams, { replace: true });
  };
  const toggleSidebarStep = (stepId) => {
    setOpenSidebarStepId((current) => (current === stepId ? null : stepId));
  };
  const persisted = isGbm
    ? { ...answers, __cards: cards, __stages: stages, __stakeholderRows: stakeholderRows, __vpRows: vpRows }
    : answers;

  async function saveAnswers() {
    try {
      const projectType = getToolProjectType(tool.key);
      if (profile?.role === "entrepreneur" && token && projectType && projectId) {
        const current = projects.find((x) => x.id === projectId);
        await apiRequest(`/projects/${projectId}/forms`, {
          method: "PUT",
          token,
          body: { forms: { ...(current?.forms || {}), ...persisted }, submit: false }
        });
        setSource("project");
        setMessage("Saved to your project workspace.");
        return;
      }
      saveLocalToolAnswers(firebaseUser?.uid, tool.key, persisted);
      setSource("local");
      setMessage(projectType ? "Saved locally. Create the matching project in Dashboard to sync." : "Saved locally.");
    } catch (err) {
      setMessage(err.message || "Failed to save answers.");
    }
  }

  function downloadGbmJson() {
    const blob = new Blob([
      JSON.stringify({ toolKey: tool.key, title: tool.title, generatedAt: new Date().toISOString(), answers: persisted }, null, 2)
    ], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GBM-${dayjs().format("YYYY-MM-DD")}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadAnswersPdf() {
    if (!tool) return;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 48;
    const contentWidth = pageWidth - margin * 2;
    const lineHeight = 14;
    let y = margin;

    const safeValue = (value) => {
      const text = value === undefined || value === null ? "" : String(value).trim();
      return text.length ? text : EMPTY_ANSWER;
    };

    const ensureSpace = (height) => {
      if (y + height > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
    };

    const addLines = (lines, { bold = false, size = 11, color = [31, 41, 55], spacing = 6 } = {}) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(size);
      doc.setTextColor(color[0], color[1], color[2]);
      ensureSpace(lines.length * lineHeight + spacing);
      doc.text(lines, margin, y);
      y += lines.length * lineHeight + spacing;
    };

    const addParagraph = (text, options) => {
      if (!text) return;
      const lines = doc.splitTextToSize(text, contentWidth);
      addLines(lines, options);
    };

    const addQuestion = ({ label, value, description }) => {
      const labelLines = doc.splitTextToSize(label, contentWidth);
      const valueLines = doc.splitTextToSize(safeValue(value), contentWidth);
      const descLines = description ? doc.splitTextToSize(description, contentWidth) : [];
      const height = (labelLines.length + valueLines.length + descLines.length) * lineHeight + 14;
      ensureSpace(height);
      addLines(labelLines, { bold: true, size: 12, spacing: 4 });
      if (description) {
        addLines(descLines, { size: 9, color: [100, 116, 139], spacing: 6 });
      }
      addLines(valueLines, { size: 11, spacing: 10 });
    };

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageWidth, 84, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text(tool.title, margin, 40);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Generated ${dayjs().format("YYYY-MM-DD HH:mm")}`, margin, 62);

    y = 104;
    addParagraph(`Completion: ${progress.percent}% (${progress.answeredCount}/${progress.totalCount} answered)`, { size: 10, color: [71, 85, 105] });
    if (tool.description) {
      addParagraph(tool.description, { size: 10, color: [71, 85, 105] });
    }

    const sections = isGbm
      ? GBM_PAGES.map((pageDef) => ({
          title: getGbmInstructionTitle(pageDef.n) || pageDef.display || `${pageDef.n}. ${pageDef.title}`,
          items: buildQs(
            pageDef,
            Math.max(1, Number(answers.__cards || cards || 1)),
            Math.max(1, Number(answers.__stages || stages || 1)),
            Math.max(1, Number(answers.__stakeholderRows || stakeholderRows || 1)),
            Math.max(1, Number(answers.__vpRows || vpRows || 1))
          ).map((question) => ({
            label: question.label,
            value: persisted[question.id]
          }))
        }))
      : sectionSummaries
          .filter((section) => section.questionIds.length > 0)
          .map((section) => ({
            title: section.title,
            items: section.questionIds.map((questionId) => {
              const question = questionMap.get(questionId);
              return {
                label: question?.label || questionId,
                description: question?.description,
                value: persisted[questionId]
              };
            })
          }));

    sections.forEach((section) => {
      ensureSpace(32);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(section.title, margin, y);
      y += 10;
      doc.setDrawColor(203, 213, 225);
      doc.line(margin, y, pageWidth - margin, y);
      y += 16;

      (section.items || []).forEach((item) => addQuestion(item));
    });

    const safeTitle = tool.title.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "");
    doc.save(`${safeTitle || tool.key}-${dayjs().format("YYYY-MM-DD")}.pdf`);
  }

  function renderStandardInput(q) {
    if (q.inputType === "select") {
      return (
        <select id={q.id} value={answers[q.id] || ""} onChange={(e) => setA(q.id, e.target.value)}>
          <option value="">Select an option</option>
          {(q.options || []).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      );
    }
    if (q.inputType === "text") {
      return <input id={q.id} type="text" value={answers[q.id] || ""} onChange={(e) => setA(q.id, e.target.value)} />;
    }
    return <textarea id={q.id} rows="3" value={answers[q.id] || ""} onChange={(e) => setA(q.id, e.target.value)} />;
  }

  function renderSectionIntro(title, description, helperText) {
    const details = [description, helperText].filter((text, index, arr) => text && arr.indexOf(text) === index);

    return (
      <div className="question-card">
        <div className="hero-kicker">{isGbm ? "Current step" : "Current section"}</div>
        <h3>{title || currentSection?.title || "Section"}</h3>
        {details.map((text) => (
          <p key={text} className="question-description">{text}</p>
        ))}
      </div>
    );
  }

  function renderGenericSection() {
    const sectionQuestions = currentSection
      ? currentSection.questionIds.map((questionId) => questionMap.get(questionId)).filter(Boolean)
      : tool.questions || [];

    return (
      <>
        {renderSectionIntro(
          currentSection?.title || tool.title,
          currentSection?.description || tool.description,
          sectionQuestions.length
            ? "Answer each question in this section before moving to the next one."
            : "This section is informational. Use Next when you're ready to continue."
        )}
        {sectionQuestions.map((question) => (
          <div key={question.id} className="question-card">
            <label htmlFor={question.id}><strong>{question.label}</strong></label>
            {question.description ? <p className="question-description">{question.description}</p> : null}
            {renderStandardInput(question)}
          </div>
        ))}
      </>
    );
  }

  function renderGbmStandardBlocks() {
    return (
      <>
        {(page.plus || []).length ? (
          <div className="question-card">
            <label><strong>Previous answers</strong></label>
            {page.plus.map((k) => <p key={k} className="question-description">{answers[k] || EMPTY_ANSWER}</p>)}
          </div>
        ) : null}
        {(page.star || []).map(([label, key]) => (
          <div key={key} className="question-card">
            <label><strong>{label}</strong></label>
            <p className="question-description">{answers[key] || EMPTY_ANSWER}</p>
          </div>
        ))}
        {(page.domains || []).map((d) => (
          <div key={d.t} className="question-card">
            <label><strong>{d.t}</strong></label>
            {(d.q || []).map(([id, label]) => (
              <div key={id} className="question-card">
                <label htmlFor={id}><strong>{label}</strong></label>
                <textarea id={id} rows="3" value={answers[id] || ""} onChange={(e) => setA(id, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
        {(page.q || []).map(([id, label]) => (
          <div key={id} className="question-card">
            <label htmlFor={id}><strong>{label}</strong></label>
            <textarea id={id} rows="3" value={answers[id] || ""} onChange={(e) => setA(id, e.target.value)} />
          </div>
        ))}
      </>
    );
  }

  function renderPage8StakeholderMap() {
    return (
      <div className="gbc-block">
        <div className="gbc-actions">
          <button type="button" className="btn" onClick={() => setStakeholderRows((x) => x + 1)}>Add Row</button>
          <button type="button" className="btn" onClick={() => setStakeholderRows((x) => Math.max(1, x - 1))}>Remove Row</button>
        </div>
        <div className="gbc-table">
          <div className="gbc-table-head">Stakeholder</div>
          <div className="gbc-table-head">Effects of</div>
          <div className="gbc-table-head">Actions</div>
          {Array.from({ length: stakeholderRows }).map((_, i) => (
            <div key={i} className="gbc-row">
              <div className="gbc-cell">
                <input
                  value={answers[`stake_${i + 1}_name`] || ""}
                  onChange={(e) => setA(`stake_${i + 1}_name`, e.target.value)}
                  placeholder={`Stakeholder ${i + 1}`}
                />
              </div>
              <div className="gbc-cell gbc-ranges">
                <label>Stakeholder on business: {answers[`stake_${i + 1}_business`] || "0"}</label>
                <input type="range" min="-5" max="5" value={answers[`stake_${i + 1}_business`] || "0"} onChange={(e) => setA(`stake_${i + 1}_business`, e.target.value)} />
                <label>Business on stakeholder: {answers[`stake_${i + 1}_stakeholder`] || "0"}</label>
                <input type="range" min="-5" max="5" value={answers[`stake_${i + 1}_stakeholder`] || "0"} onChange={(e) => setA(`stake_${i + 1}_stakeholder`, e.target.value)} />
              </div>
              <div className="gbc-cell">
                <button type="button" className="btn" onClick={() => {
                  if (stakeholderRows === 1) return;
                  setStakeholderRows((x) => Math.max(1, x - 1));
                }}>Delete Row</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderPage9Customers() {
    return (
      <div className="gbc-block">
        <div className="gbc-segment-map">
          <div className="gbc-axis-x">Effects of STK on the business</div>
          <div className="gbc-axis-y">Effects of the business on the STK</div>
          {Array.from({ length: cards }).map((_, i) => {
            const x = answers[`cust_${i + 1}_gains`] ? Math.min(95, 5 + (answers[`cust_${i + 1}_gains`].length % 90)) : 50;
            const y = answers[`cust_${i + 1}_pains`] ? Math.min(95, 5 + (answers[`cust_${i + 1}_pains`].length % 90)) : 50;
            return <span key={i} className="gbc-dot" style={{ left: `${x}%`, top: `${100 - y}%` }} title={`Customer ${i + 1}`} />;
          })}
        </div>

        <div className="gbc-actions">
          <button type="button" className="btn" onClick={() => setCards((x) => x + 1)}>Add Card</button>
          <button type="button" className="btn" onClick={() => setCards((x) => Math.max(1, x - 1))}>Remove Card</button>
        </div>

        {Array.from({ length: cards }).map((_, i) => (
          <div key={i} className="gbc-customer-card">
            <h3>Discovery Card {i + 1}</h3>
            <div className="gbc-grid-2">
              <div>
                <label>Segment</label>
                <input value={answers[`cust_${i + 1}_segment`] || ""} onChange={(e) => setA(`cust_${i + 1}_segment`, e.target.value)} />
              </div>
              <div>
                <label>Who?</label>
                <input value={answers[`cust_${i + 1}_generic`] || ""} onChange={(e) => setA(`cust_${i + 1}_generic`, e.target.value)} />
              </div>
            </div>
            <label>Pains</label>
            <textarea rows="3" value={answers[`cust_${i + 1}_pains`] || ""} onChange={(e) => setA(`cust_${i + 1}_pains`, e.target.value)} />
            <label>Gains</label>
            <textarea rows="3" value={answers[`cust_${i + 1}_gains`] || ""} onChange={(e) => setA(`cust_${i + 1}_gains`, e.target.value)} />
            <label>Functions/jobs to cover</label>
            <textarea rows="3" value={answers[`cust_${i + 1}_jobs`] || ""} onChange={(e) => setA(`cust_${i + 1}_jobs`, e.target.value)} />
          </div>
        ))}
      </div>
    );
  }

  function renderPage10Canvas() {
    return (
      <div className="gbc-block">
        <div className="gbc-actions">
          <button type="button" className="btn" onClick={() => setVpRows((x) => x + 1)}>Add Value Proposition</button>
          <button type="button" className="btn" onClick={() => setVpRows((x) => Math.max(1, x - 1))}>Delete Value Proposition</button>
        </div>

        {Array.from({ length: vpRows }).map((_, i) => (
          <div className="gbc-grid-3" key={i}>
            <div className="question-card">
              <label>Value proposition</label>
              <textarea rows="3" value={answers[`vp_row_${i + 1}_prop`] || ""} onChange={(e) => setA(`vp_row_${i + 1}_prop`, e.target.value)} />
            </div>
            <div className="question-card">
              <label>Customer segment</label>
              <input value={answers[`vp_row_${i + 1}_segment`] || ""} onChange={(e) => setA(`vp_row_${i + 1}_segment`, e.target.value)} />
            </div>
            <div className="question-card">
              <label>Actions</label>
              <button type="button" className="btn" onClick={() => setVpRows((x) => Math.max(1, x - 1))}>Delete Row</button>
            </div>
          </div>
        ))}

        <div className="gbc-canvas">
          <h3>Canvas V2.0</h3>
          <h4>Outline of the business idea</h4>
          <div className="gbc-grid-2">
            <div className="tile"><strong>Name</strong><p>{answers.canvas_name || "-"}</p></div>
            <div className="tile"><strong>Company</strong><p>{answers.canvas_company || "-"}</p></div>
          </div>
          <div className="gbc-grid-3">
            <div className="tile"><strong>Mission</strong><p>{answers.mission || "-"}</p></div>
            <div className="tile"><strong>Vision</strong><p>{answers.vision || "-"}</p></div>
            <div className="tile"><strong>Objectives</strong><p>{answers.env_obj || "-"}</p><p>{answers.social_obj || "-"}</p><p>{answers.cust_obj || "-"}</p><p>{answers.team_obj || "-"}</p></div>
          </div>

          <h4>Business Canvas</h4>
          <div className="gbc-grid-5">
            <div className="tile"><strong>Key stakeholders</strong><p>{answers.stakeholders || "-"}</p></div>
            <div className="tile"><strong>Key activities & resources</strong><p>{answers.s15_summary || "-"}</p></div>
            <div className="tile"><strong>Value proposition</strong><p>{answers.canvas_value || answers.vp_env || "-"}</p></div>
            <div className="tile"><strong>Customer relationships & channels</strong><p>{answers.stage_1_touch || "-"}</p></div>
            <div className="tile"><strong>Customer segments</strong><p>{answers.cust_1_segment || "-"}</p></div>
          </div>
          <div className="gbc-grid-2">
            <div className="tile"><strong>Cost structure</strong><p>{answers.canvas_cost || answers.s16_cost || "-"}</p></div>
            <div className="tile"><strong>Revenue streams</strong><p>{answers.canvas_revenue || answers.s17_rev || "-"}</p></div>
          </div>

          <h4>The added value of the project</h4>
          <div className="gbc-grid-2">
            <div className="tile"><strong>Environment</strong><p>{answers.vp_env || "-"}</p></div>
            <div className="tile"><strong>Society</strong><p>{answers.vp_social || "-"}</p></div>
            <div className="tile"><strong>Economy</strong><p>{answers.vp_economic || "-"}</p></div>
            <div className="tile"><strong>Innovation</strong><p>{answers.vp_innovation || "-"}</p></div>
          </div>
        </div>

        {(page.domains || []).map((d) => (
          <div key={d.t} className="question-card">
            <label><strong>{d.t}</strong></label>
            {(d.q || []).map(([id, label]) => (
              <div key={id} className="question-card">
                <label htmlFor={id}><strong>{label}</strong></label>
                <textarea id={id} rows="3" value={answers[id] || ""} onChange={(e) => setA(id, e.target.value)} />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  function renderPage14Journey() {
    return (
      <div className="gbc-block">
        <div className="gbc-actions">
          <button type="button" className="btn" onClick={() => setStages((x) => x + 1)}>Add Stage</button>
          <button type="button" className="btn" onClick={() => setStages((x) => Math.max(1, x - 1))}>Remove Stage</button>
        </div>

        {Array.from({ length: stages }).map((_, i) => (
          <div key={i} className="gbc-stage-card">
            <h3>Stage {i + 1}</h3>
            <div className="gbc-grid-2">
              <div>
                <label>Order stage</label>
                <select value={answers[`stage_${i + 1}_order`] || ""} onChange={(e) => setA(`stage_${i + 1}_order`, e.target.value)}>
                  <option value="">Select</option>
                  <option value="PRE">PRE</option>
                  <option value="DURING">DURING</option>
                  <option value="POST">POST</option>
                </select>
              </div>
              <div>
                <label>Customer segment</label>
                <input value={answers[`stage_${i + 1}_segment`] || ""} onChange={(e) => setA(`stage_${i + 1}_segment`, e.target.value)} />
              </div>
            </div>
            <div className="gbc-grid-2">
              <div>
                <label>Stage</label>
                <textarea rows="3" value={answers[`stage_${i + 1}_stage`] || ""} onChange={(e) => setA(`stage_${i + 1}_stage`, e.target.value)} />
              </div>
              <div>
                <label>Emotions</label>
                <textarea rows="3" value={answers[`stage_${i + 1}_emotion`] || ""} onChange={(e) => setA(`stage_${i + 1}_emotion`, e.target.value)} />
              </div>
              <div>
                <label>Needs & thoughts</label>
                <textarea rows="3" value={answers[`stage_${i + 1}_thoughts`] || ""} onChange={(e) => setA(`stage_${i + 1}_thoughts`, e.target.value)} />
              </div>
              <div>
                <label>Touch points & channels</label>
                <textarea rows="3" value={answers[`stage_${i + 1}_touch`] || ""} onChange={(e) => setA(`stage_${i + 1}_touch`, e.target.value)} />
              </div>
            </div>
            <label>How to provide a unique experience?</label>
            <textarea rows="3" value={answers[`stage_${i + 1}_ux`] || ""} onChange={(e) => setA(`stage_${i + 1}_ux`, e.target.value)} />
            <label>What do we need to provide?</label>
            <textarea rows="3" value={answers[`stage_${i + 1}_need`] || ""} onChange={(e) => setA(`stage_${i + 1}_need`, e.target.value)} />
          </div>
        ))}
      </div>
    );
  }

  function renderPage15ActivitiesResources() {
    return (
      <div className="gbc-block">
        <div className="gbc-grid-2">
          <div className="question-card">
            <h3>Key activities</h3>
            <label>Problem solving</label>
            <textarea rows="3" value={answers.act_problem || ""} onChange={(e) => setA("act_problem", e.target.value)} />
            <label>Production</label>
            <textarea rows="3" value={answers.act_production || ""} onChange={(e) => setA("act_production", e.target.value)} />
            <label>Platform/network/sales</label>
            <textarea rows="3" value={answers.act_platform || ""} onChange={(e) => setA("act_platform", e.target.value)} />
            <label>Supply chain management</label>
            <textarea rows="3" value={answers.act_supply || ""} onChange={(e) => setA("act_supply", e.target.value)} />
          </div>
          <div className="question-card">
            <h3>Key resources</h3>
            <label>Human capital</label>
            <textarea rows="3" value={answers.res_human || ""} onChange={(e) => setA("res_human", e.target.value)} />
            <label>Physical capital</label>
            <textarea rows="3" value={answers.res_physical || ""} onChange={(e) => setA("res_physical", e.target.value)} />
            <label>Intellectual and digital capital</label>
            <textarea rows="3" value={answers.res_intel || ""} onChange={(e) => setA("res_intel", e.target.value)} />
            <label>Financial capital</label>
            <textarea rows="3" value={answers.res_fin || ""} onChange={(e) => setA("res_fin", e.target.value)} />
          </div>
        </div>
      </div>
    );
  }

  function renderPage16Eco() {
    return (
      <div className="gbc-block">
        <div className="question-card">
          <h3>Producto-Service or Service selection</h3>
          <label className="gbc-radio"><input type="radio" name="ecoType" checked={(answers.eco_type || "product-service") === "product-service"} onChange={() => setA("eco_type", "product-service")} /> Product-Service</label>
          <label className="gbc-radio"><input type="radio" name="ecoType" checked={answers.eco_type === "service-only"} onChange={() => setA("eco_type", "service-only")} /> Service Only</label>
        </div>
        <div className="gbc-eco-grid">
          {ecoCards.map(([id, label]) => (
            <div key={id} className={`gbc-eco-item ${hasAnswer(answers[id]) ? "active" : ""}`}>
              <strong>{label}</strong>
              <textarea rows="2" value={answers[id] || ""} onChange={(e) => setA(id, e.target.value)} />
            </div>
          ))}
        </div>
        <div className="question-card">
          <label>Ecodesign result</label>
          <textarea rows="4" value={answers.eco_result || ""} onChange={(e) => setA("eco_result", e.target.value)} />
        </div>
      </div>
    );
  }

  function renderGbmPage() {
    const pageLabel = currentSection?.title || getGbmInstructionTitle(page.n) || page.display || `${page.n}. ${page.title}`;
    return (
      <>
        {renderSectionIntro(pageLabel, currentSection?.description, "Complete this step before moving to the next one.")}
        {(page.copy || []).length ? (
          <div className="question-card">
            {page.copy.map((text, idx) => (
              <p key={`${page.n}-copy-${idx}`} className="question-description">{text}</p>
            ))}
          </div>
        ) : null}
        {page.n === 8 ? renderPage8StakeholderMap() : null}
        {page.n === 9 ? renderPage9Customers() : null}
        {page.n === 10 ? renderPage10Canvas() : null}
        {page.n === 14 ? renderPage14Journey() : null}
        {page.n === 15 ? renderPage15ActivitiesResources() : null}
        {page.n === 16 ? renderPage16Eco() : null}
        {[8, 9, 10, 14, 15, 16].includes(page.n) ? null : renderGbmStandardBlocks()}
      </>
    );
  }

  return (
    <div className="tool-layout">
      <aside className="card tool-sidebar">
        <div className="tool-sidebar-head">
          <div className="hero-kicker">Tool navigation</div>
          <h3>{tool.title}</h3>
          <p className="subtitle">{progress.percent}% filled overall</p>
        </div>

        <div className="tool-sidebar-list">
          {stepGroups.map((group) => {
            const isGroupOpen = openSidebarStepId === group.id;

            return (
              <div key={group.id} className={`tool-step-group ${isGroupOpen ? "open" : ""}`}>
                <button
                  type="button"
                  className={`tool-step-group-btn ${group.hasCurrent ? "active" : ""} ${group.isComplete ? "complete" : ""}`}
                  onClick={() => toggleSidebarStep(group.id)}
                  aria-expanded={isGroupOpen}
                >
                  <div className="tool-step-top">
                    <span className="tool-step-index">{group.label}</span>
                    <span className={`tool-step-status ${group.isComplete ? "complete" : "pending"}`}>
                      {group.isComplete ? "Done" : `${group.answeredCount}/${group.totalCount}`}
                    </span>
                  </div>
                  <strong className="tool-step-heading">{group.title}</strong>
                  <span className="tool-step-meta">
                    {group.totalCount === 0 ? "Overview" : `${group.items.length} sections`}
                  </span>
                </button>

                {isGroupOpen ? (
                  <div className="tool-step-group-list">
                    {group.items.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        className={`tool-step-btn tool-step-child ${section.index === p ? "active" : ""} ${section.isComplete ? "complete" : ""}`}
                        onClick={() => goToSection(section.index)}
                      >
                        <strong>{section.title}</strong>
                        <span className="tool-step-meta">
                          {section.totalCount === 0 ? "Overview" : section.isComplete ? "Done" : `${section.answeredCount}/${section.totalCount}`}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>

      <div className="tool-body">
        <section className="card">
          <h2>{tool.title}</h2>
          <p>{tool.description}</p>
          <p className="tool-progress">Progress: <strong>{progress.percent}%</strong> ({progress.answeredCount}/{progress.totalCount})</p>
          {currentSection ? <p className="subtitle">Step {p + 1}/{sectionSummaries.length}: {currentSection.title}</p> : null}
          <p className="subtitle">Status: {progress.status}</p>
          <p className="subtitle">Data source: {source === "project" ? "Project workspace" : "Local draft"}</p>
          {message ? <p className="info tool-info">{message}</p> : null}
        </section>

        <section className="card form-stack">
          {isGbm ? renderGbmPage() : renderGenericSection()}

          <div className="tool-footer">
            <div className="inline">
              {p > 0 ? <button type="button" className="btn" onClick={() => goToSection(p - 1)}>Previous</button> : null}
              {p < sectionSummaries.length - 1 ? <button type="button" className="btn primary" onClick={() => goToSection(p + 1)} disabled={!canNext}>Next</button> : null}
            </div>
            {!canNext && currentSection && currentSection.totalCount > 0 ? (
              <p className="question-description">Fill all questions in this section to unlock the next step.</p>
            ) : null}
            <div className="inline">
              <button className="btn primary" onClick={saveAnswers}>Save answers</button>
              <button className="btn" onClick={downloadAnswersPdf}>Download PDF</button>
              {tool.key === GBM_KEY ? <button className="btn" onClick={downloadGbmJson}>Download GBM JSON</button> : null}
              <Link to="/app/tools" className="btn">Back to tools</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

