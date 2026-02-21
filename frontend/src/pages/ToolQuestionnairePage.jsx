import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Link, useParams } from "react-router-dom";
import { apiRequest } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { getToolByKey } from "../data/toolsCatalog";
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
  { n: 16, title: "Step 2: 14 Ecodesign your business", q: [["eco_type", "Business offers (Product/Service)"], ["eco_materials", "Materials & resources"], ["eco_production", "Production"], ["eco_packaging", "Packaging & distribution"], ["eco_use", "Use & maintenance"], ["eco_eol", "End of life management"], ["eco_service", "Service"], ["eco_sales", "Sales & communication"], ["eco_infra", "Infrastructure"], ["eco_result", "Ecodesign result"]] },
  { n: 17, title: "Step 2: 15-17 Summary / Cost structure / Revenue streams", q: [["s15_summary", "Summary of key activities/resources/channels"], ["s16_cost", "Cost structure"], ["s17_rev", "Revenue streams"]] },
  { n: 18, title: "Step 2: 18 Final summary", plus: ["s16_cost", "s17_rev"], star: [["Mission statement", "mission"], ["Vision statement", "vision"]], q: [] }
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
const filled = (v) => String(v || "").trim().length > 0;

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
  const { token, profile, firebaseUser } = useAuth();
  const tool = getToolByKey(toolKey);
  const [projects, setProjects] = useState([]);
  const [answers, setAnswers] = useState({});
  const [source, setSource] = useState("local");
  const [projectId, setProjectId] = useState(null);
  const [message, setMessage] = useState("");
  const [p, setP] = useState(0);
  const [cards, setCards] = useState(1);
  const [stages, setStages] = useState(1);
  const [stakeholderRows, setStakeholderRows] = useState(1);
  const [vpRows, setVpRows] = useState(1);
  const isGbm = tool?.key === GBM_KEY;

  useEffect(() => {
    async function load() {
      if (!tool) return;
      if (profile?.role === "entrepreneur" && token) {
        try {
          const res = await apiRequest("/projects/my", { token });
          const list = res.projects || [];
          setProjects(list);
          const r = resolveAnswersForTool({ uid: firebaseUser?.uid, toolKey, projects: list });
          setAnswers(r.answers);
          setSource(r.source);
          setProjectId(r.project?.id || null);
          return;
        } catch (err) {
          setMessage(err.message);
        }
      }
      const r = resolveAnswersForTool({ uid: firebaseUser?.uid, toolKey, projects: [] });
      setAnswers(r.answers);
      setSource("local");
      setProjectId(null);
    }
    load();
  }, [firebaseUser?.uid, profile?.role, token, tool, toolKey]);

  useEffect(() => {
    if (!isGbm) return;
    setCards(Math.max(1, Number(answers.__cards || 1)));
    setStages(Math.max(1, Number(answers.__stages || 1)));
    setStakeholderRows(Math.max(1, Number(answers.__stakeholderRows || 1)));
    setVpRows(Math.max(1, Number(answers.__vpRows || 1)));
  }, [answers, isGbm]);

  const page = isGbm ? GBM_PAGES[p] : null;
  const pageQs = isGbm ? buildQs(page, cards, stages, stakeholderRows, vpRows) : [];
  const allGbmQs = useMemo(() => GBM_PAGES.flatMap((x) => buildQs(x, cards, stages, stakeholderRows, vpRows)), [cards, stages, stakeholderRows, vpRows]);
  const progress = useMemo(() => {
    if (!tool) return { answeredCount: 0, totalCount: 0, percent: 0 };
    if (!isGbm) return calculateToolProgress(tool, answers);
    const totalCount = allGbmQs.length;
    const answeredCount = allGbmQs.reduce((n, q) => n + (filled(answers[q.id]) ? 1 : 0), 0);
    return { totalCount, answeredCount, percent: totalCount ? Math.round((answeredCount / totalCount) * 100) : 0 };
  }, [allGbmQs, answers, isGbm, tool]);
  const canNext = !isGbm || pageQs.every((q) => filled(answers[q.id]));

  if (!tool) {
    return (
      <section className="card">
        <h2>Tool not found</h2>
        <Link to="/app/tools" className="btn">Back to tools</Link>
      </section>
    );
  }

  const setA = (id, v) => setAnswers((x) => ({ ...x, [id]: v }));
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

  function renderGbmStandardBlocks() {
    return (
      <>
        {(page.plus || []).length ? (
          <div className="question-card">
            <label><strong>Previous answers</strong></label>
            {page.plus.map((k) => <p key={k} className="question-description">{answers[k] || "(not answered yet)"}</p>)}
          </div>
        ) : null}
        {(page.star || []).map(([label, key]) => (
          <div key={key} className="question-card">
            <label><strong>{label}</strong></label>
            <p className="question-description">{answers[key] || "(not answered yet)"}</p>
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
            <div key={id} className={`gbc-eco-item ${filled(answers[id]) ? "active" : ""}`}>
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
    return (
      <>
        <div className="question-card">
          <label><strong>{page.n}. {page.title}</strong></label>
        </div>
        {page.n === 8 ? renderPage8StakeholderMap() : null}
        {page.n === 9 ? renderPage9Customers() : null}
        {page.n === 10 ? renderPage10Canvas() : null}
        {page.n === 14 ? renderPage14Journey() : null}
        {page.n === 15 ? renderPage15ActivitiesResources() : null}
        {page.n === 16 ? renderPage16Eco() : null}
        {[8, 9, 10, 14, 15, 16].includes(page.n) ? null : renderGbmStandardBlocks()}
        <div className="inline">
          {p > 0 ? <button type="button" className="btn" onClick={() => setP((x) => x - 1)}>Previous</button> : null}
          {canNext && p < GBM_PAGES.length - 1 ? <button type="button" className="btn primary" onClick={() => setP((x) => x + 1)}>Next</button> : null}
        </div>
      </>
    );
  }

  return (
    <div className="content-stack">
      <section className="card">
        <h2>{tool.title}</h2>
        <p>{tool.description}</p>
        <p className="tool-progress">Progress: <strong>{progress.percent}%</strong> ({progress.answeredCount}/{progress.totalCount})</p>
        {isGbm ? <p className="subtitle">Page {p + 1}/{GBM_PAGES.length}</p> : null}
        <p className="subtitle">Data source: {source === "project" ? "Project workspace" : "Local draft"}</p>
        {message ? <p className="info">{message}</p> : null}
      </section>

      <section className="card form-stack">
        {!isGbm ? tool.questions.map((q) => (
          <div key={q.id} className="question-card">
            <label htmlFor={q.id}><strong>{q.label}</strong></label>
            <p className="question-description">Why this is asked: {q.description}</p>
            {renderStandardInput(q)}
          </div>
        )) : renderGbmPage()}

        <div className="inline">
          <button className="btn primary" onClick={saveAnswers}>Save answers</button>
          {tool.key === GBM_KEY ? <button className="btn" onClick={downloadGbmJson}>Download GBM JSON</button> : null}
          <Link to="/app/tools" className="btn">Back to tools</Link>
        </div>
      </section>
    </div>
  );
}
