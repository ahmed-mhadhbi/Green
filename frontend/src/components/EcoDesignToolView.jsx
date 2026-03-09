import { useState } from "react";

const JOURNEY_STEPS = [
  {
    title: "Pack the Bag",
    text: "Gather the project context, the people involved, and the sustainability vision that will guide the work."
  },
  {
    title: "System",
    text: "Map the product life cycle and identify the attributes that matter in each stage."
  },
  {
    title: "Assessment",
    text: "Score the room for improvement so you can focus effort where the impact is highest."
  },
  {
    title: "Strategies",
    text: "Translate the hotspots into eco-design strategies that are practical for the company."
  },
  {
    title: "Action Plan",
    text: "Turn the selected strategies into concrete next actions, owners, and follow-up."
  }
];

const PACK_BAG_SECTIONS = [
  {
    id: "eco_team_setup",
    eyebrow: "3. The Eco-Design Team",
    title: "Who is who in your team",
    copy:
      "If you work with a group, bring together different roles, backgrounds, and knowledge. If you work alone, use this space to clarify who needs to be consulted during the journey.",
    helper:
      "Write down the people involved, the role of the coordinator, and any expertise you need during the project."
  },
  {
    id: "eco_project_overview",
    eyebrow: "4. The Project",
    title: "What do you want to eco-design?",
    copy:
      "Before starting the journey, define the product or service clearly. Give the project a memorable name and describe what you are rethinking, for whom, and why it matters.",
    helper:
      "Use the name field first, then describe the project scope, current offer, and the change you want to achieve."
  },
  {
    id: "eco_context_forces",
    eyebrow: "5. The Context",
    title: "Do you know what is happening around you?",
    copy:
      "Look at the forces of change around the business: political, economic, social, technological, environmental, and legal. Prioritize the trends that will most affect your product and your eco-design decisions.",
    helper:
      "Focus on the forces with the strongest impact, highest urgency, and highest influence on the product."
  },
  {
    id: "eco_sustainable_vision",
    eyebrow: "6. The Sustainable Vision",
    title: "How would your ideal sustainable product be?",
    copy:
      "Imagine the product after the redesign. Use environmental challenges, expected outcomes, and SCAMPER prompts to push beyond small improvements and describe the ideal sustainable result.",
    helper:
      "Let the ideas be ambitious first. Filter practicality later when you decide strategies and actions."
  }
];

const LIFECYCLE_STAGES = [
  {
    id: "raw-materials",
    title: "Raw materials",
    answerId: "eco_lifecycle_raw_materials",
    assessmentId: "eco_assessment_raw_materials",
    attributeId: "eco_attributes_raw_materials",
    intro:
      "Think about the materials and resources you need to produce the product: metals, wood, plastics, crops, feed, and any other inputs.",
    considerations: [
      "Type and number of materials",
      "Material sources",
      "Recyclability and renewability",
      "Scarcity and sourcing risks"
    ]
  },
  {
    id: "production",
    title: "Production",
    answerId: "eco_lifecycle_production",
    assessmentId: "eco_assessment_production",
    attributeId: "eco_attributes_production",
    intro:
      "Think about the production process and how the product is manufactured in practice.",
    considerations: [
      "Energy type and energy management",
      "Water use and resource efficiency",
      "Waste generation and waste management",
      "Chemicals, toxics, and production technologies"
    ]
  },
  {
    id: "packaging",
    title: "Packaging",
    answerId: "eco_lifecycle_packaging",
    assessmentId: "eco_assessment_packaging",
    attributeId: "eco_attributes_packaging",
    intro:
      "Think about the packaging used to wrap, protect, and deliver the product.",
    considerations: [
      "Packaging materials",
      "Design and modularity",
      "Recyclability",
      "Reusability"
    ]
  },
  {
    id: "distribution",
    title: "Distribution",
    answerId: "eco_lifecycle_distribution",
    assessmentId: "eco_assessment_distribution",
    attributeId: "eco_attributes_distribution",
    intro:
      "Think about the transport used to deliver the product through the supply chain.",
    considerations: [
      "Type of transport",
      "Vehicle efficiency and age",
      "Transport distance",
      "Transport load and logistics setup"
    ]
  },
  {
    id: "use-maintenance",
    title: "Use and maintenance",
    answerId: "eco_lifecycle_use",
    assessmentId: "eco_assessment_use",
    attributeId: "eco_attributes_use",
    intro:
      "Think about how the customer uses the product and what maintenance is required during its lifetime.",
    considerations: [
      "Energy required during use",
      "Water or consumables needed during use",
      "Maintenance needs",
      "Availability of spare parts and upgrades"
    ]
  },
  {
    id: "end-of-life",
    title: "End of life",
    answerId: "eco_lifecycle_end_of_life",
    assessmentId: "eco_assessment_end_of_life",
    attributeId: "eco_attributes_end_of_life",
    intro:
      "Think about what happens when the product reaches disposal, recovery, or another end-of-life route.",
    considerations: [
      "Disassembly into materials and components",
      "Reuse, remanufacture, and recycling options",
      "Information provided about end-of-life handling",
      "Waste treatment and residual impacts"
    ]
  }
];

const ASSESSMENT_OPTIONS = [
  { value: "1", label: "1 - Low room for improvement" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5 - High room for improvement" },
  { value: "No answer", label: "No answer" }
];

function hasText(value) {
  return String(value || "").trim().length > 0;
}

function hasAnswered(value) {
  if (Array.isArray(value)) return true;
  return hasText(value);
}

export default function EcoDesignToolView({ answers, setA }) {
  const [activeStageId, setActiveStageId] = useState(LIFECYCLE_STAGES[0].id);
  const [attributeDrafts, setAttributeDrafts] = useState({});
  const scope = answers.eco_scope || "Product";
  const readStages = Array.isArray(answers.eco_read_stages) ? answers.eco_read_stages : [];
  const activeStage = LIFECYCLE_STAGES.find((stage) => stage.id === activeStageId) || LIFECYCLE_STAGES[0];

  function markStageRead(stageId) {
    if (readStages.includes(stageId)) return;
    setA("eco_read_stages", [...readStages, stageId]);
  }

  function openStage(stageId) {
    setActiveStageId(stageId);
    markStageRead(stageId);
  }

  function getSelectedAttributes(stage) {
    return Array.isArray(answers[stage.attributeId]) ? answers[stage.attributeId] : stage.considerations;
  }

  function getVisibleAttributes(stage) {
    const selected = getSelectedAttributes(stage);
    return [
      ...stage.considerations,
      ...selected.filter((attribute) => !stage.considerations.includes(attribute))
    ];
  }

  function toggleAttribute(stage, attribute) {
    const current = getSelectedAttributes(stage);
    const next = current.includes(attribute)
      ? current.filter((item) => item !== attribute)
      : [...current, attribute];
    setA(stage.attributeId, next);
  }

  function addCustomAttribute(stage) {
    const value = String(attributeDrafts[stage.id] || "").trim();
    if (!value) return;

    const current = getSelectedAttributes(stage);
    if (current.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setAttributeDrafts((drafts) => ({ ...drafts, [stage.id]: "" }));
      return;
    }

    setA(stage.attributeId, [...current, value]);
    setAttributeDrafts((drafts) => ({ ...drafts, [stage.id]: "" }));
  }

  return (
    <div className="eco-tool">
      <section className="card eco-hero-card">
        <div className="eco-kicker">Intro</div>
        <h3>Welcome to the switch to Eco-Design tool</h3>
        <p>
          This toolbox guides your company as you rethink and redesign a current product or service to reduce
          environmental impact and improve sustainability.
        </p>
        <div className="eco-highlight-grid">
          <article className="eco-highlight">
            <strong>Easy to use</strong>
            <p>Flexible and intuitive, so both entrepreneurs and established companies can work through it.</p>
          </article>
          <article className="eco-highlight">
            <strong>Proactive</strong>
            <p>It suggests ways to improve environmental performance instead of only describing the problem.</p>
          </article>
          <article className="eco-highlight">
            <strong>Practical</strong>
            <p>It focuses on workable examples and decisions you can apply to a real product or service.</p>
          </article>
        </div>
        <div className="eco-callout">
          <p>This tool helps you identify environmental hotspots and define useful sustainability strategies.</p>
          <p>If you want to eco-design the business model itself, use the eco-design cards in the BM Canvas instead.</p>
        </div>
      </section>

      <section className="card eco-section-card">
        <div className="eco-section-head">
          <div>
            <div className="eco-kicker">Pack the Bag</div>
            <h3>Five steps to Eco-Design</h3>
          </div>
          <span className="badge">Journey map</span>
        </div>
        <p>
          Solo entrepreneurs can move through the journey on their own. Teams should work in group sessions so the
          decisions and tradeoffs are shared.
        </p>
        <div className="eco-journey-grid">
          <div className="eco-journey-steps">
            {JOURNEY_STEPS.map((step, index) => (
              <article key={step.title} className="eco-step-card">
                <span className="eco-step-number">{index + 1}</span>
                <div>
                  <h4>{step.title}</h4>
                  <p>{step.text}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="eco-journey-media">
            <figure className="eco-media-frame eco-map-frame">
              <img src="/eco-design/bag.png" alt="Eco-design pack the bag illustration" loading="lazy" />
            </figure>
            <figure className="eco-media-frame eco-map-frame">
              <img src="/eco-design/map.png" alt="Eco-design journey map" loading="lazy" />
            </figure>
          </div>
        </div>
      </section>

      <section className="card eco-section-card">
        <div className="eco-section-head">
          <div>
            <div className="eco-kicker">Scope</div>
            <h3>What are you going to eco-design?</h3>
          </div>
        </div>
        <p>
          Most environmental impacts and costs are determined at the design stage. Choose whether you are redesigning
          a product or a service, then frame the exercise around that scope.
        </p>
        <div className="eco-choice-grid">
          <label className={`eco-choice-card ${scope === "Product" ? "active" : ""}`}>
            <input
              type="radio"
              name="eco-scope"
              checked={scope === "Product"}
              onChange={() => setA("eco_scope", "Product")}
            />
            <span>Product</span>
          </label>
          <label className={`eco-choice-card ${scope === "Service" ? "active" : ""}`}>
            <input
              type="radio"
              name="eco-scope"
              checked={scope === "Service"}
              onChange={() => setA("eco_scope", "Service")}
            />
            <span>Service</span>
          </label>
        </div>
        <div className="eco-scope-card">
          <figure className="eco-media-frame">
            <img src="/eco-design/ps.png" alt="Product and service eco-design card" loading="lazy" />
          </figure>
          {scope === "Product" ? (
            <div className="eco-copy-stack">
              <p>
                <strong>Product:</strong> an object or item that you conceptualize, produce, and sell.
              </p>
              <p>
                Eco-product design means understanding the full life cycle of the product, from production and
                distribution to use, maintenance, and disposal, so environmental performance can improve across the
                whole system.
              </p>
            </div>
          ) : (
            <div className="eco-copy-stack">
              <p>
                <strong>Service:</strong> the act of generating, delivering, and exchanging value through a set of
                tasks. The value can be informational, emotional, or material.
              </p>
              <p>
                Use the same eco-design logic to map how the service is delivered, what resources it needs, and where
                environmental improvements can be made.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="card eco-section-card">
        <div className="eco-section-head">
          <div>
            <div className="eco-kicker">Pack the Bag</div>
            <h3>Get ready for the journey</h3>
          </div>
        </div>
        <p>
          The first phase helps you collect the context, people, and priorities you need before redefining the product.
          Use the notes below to capture the essentials.
        </p>
        <div className="eco-pack-grid">
          <div className="question-card">
            <label htmlFor="eco_project_name">
              <strong>Project name</strong>
            </label>
            <p className="question-description">Give the eco-design project a name that captures its intent.</p>
            <input
              id="eco_project_name"
              type="text"
              value={answers.eco_project_name || ""}
              onChange={(event) => setA("eco_project_name", event.target.value)}
              placeholder="Example: Refillable Kitchen Cleaner"
            />
          </div>
          {PACK_BAG_SECTIONS.map((section) => (
            <article key={section.id} className="eco-pack-card">
              <div className="eco-pack-copy">
                <div className="eco-kicker">{section.eyebrow}</div>
                <h4>{section.title}</h4>
                <p>{section.copy}</p>
                <p className="question-description">{section.helper}</p>
                <label htmlFor={section.id}>
                  <strong>Your notes</strong>
                </label>
                <textarea
                  id={section.id}
                  rows="5"
                  value={answers[section.id] || ""}
                  onChange={(event) => setA(section.id, event.target.value)}
                />
              </div>
              <div className="eco-pack-prompts">
                <strong>What to capture</strong>
                <ul className="eco-list">
                  {section.id === "eco_team_setup" ? (
                    <>
                      <li>Names, roles, and backgrounds of participants</li>
                      <li>Who will coordinate the tool and consolidate decisions</li>
                      <li>What expertise is missing and should be consulted</li>
                    </>
                  ) : null}
                  {section.id === "eco_project_overview" ? (
                    <>
                      <li>What product or service is being redesigned</li>
                      <li>Who uses it and what value it delivers today</li>
                      <li>What boundary is included in this eco-design exercise</li>
                    </>
                  ) : null}
                  {section.id === "eco_context_forces" ? (
                    <>
                      <li>Political and legal shifts that affect compliance or incentives</li>
                      <li>Economic, social, and customer trends shaping demand</li>
                      <li>Technology and environmental changes that create risk or opportunity</li>
                    </>
                  ) : null}
                  {section.id === "eco_sustainable_vision" ? (
                    <>
                      <li>What the ideal low-impact product should look like</li>
                      <li>What should be reduced, replaced, simplified, reused, or recovered</li>
                      <li>What environmental result the redesign should achieve</li>
                    </>
                  ) : null}
                </ul>
              </div>
            </article>
          ))}
        </div>
        <div className="eco-callout">
          <p>
            Achievement: at this point you have packed the bag with the project setup, context, and sustainability
            vision that will guide the rest of the tool.
          </p>
        </div>
      </section>

      <section className="card eco-section-card">
        <div className="eco-section-head">
          <div>
            <div className="eco-kicker">System</div>
            <h3>Understand and improve your system</h3>
          </div>
        </div>
        <p>
          Map the life cycle of the product and decide which attributes are relevant at each stage. Open the stages
          below to review them. Once a stage has been opened, it is marked as read.
        </p>
        <div className="eco-system-layout">
          <div className="eco-system-visual">
            <figure className="eco-media-frame">
              <img src="/eco-design/cycle.png" alt="Product lifecycle diagram" loading="lazy" />
            </figure>
          </div>
          <div className="eco-stage-rail">
            {LIFECYCLE_STAGES.map((stage) => {
              const isRead = readStages.includes(stage.id);
              const isFilled = hasText(answers[stage.answerId]);
              return (
                <button
                  key={stage.id}
                  type="button"
                  className={`eco-stage-chip ${activeStageId === stage.id ? "active" : ""} ${isRead ? "read" : ""} ${isFilled ? "filled" : ""}`}
                  onClick={() => openStage(stage.id)}
                >
                  <strong>{stage.title}</strong>
                  <span>{isRead ? "Read" : "Unread"}{isFilled ? " | Filled" : ""}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="eco-stage-popup">
          <div className="eco-stage-popup-head">
            <div>
              <div className="eco-kicker">Life cycle stage</div>
              <h4>{activeStage.title}</h4>
            </div>
            <span className="badge">{readStages.includes(activeStage.id) ? "Read" : "Unread"}</span>
          </div>
          <p>{activeStage.intro}</p>
          <ul className="eco-list">
            {activeStage.considerations.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <label htmlFor={activeStage.answerId}>
            <strong>Describe this life cycle stage for your product</strong>
          </label>
          <textarea
            id={activeStage.answerId}
            rows="5"
            value={answers[activeStage.answerId] || ""}
            onChange={(event) => setA(activeStage.answerId, event.target.value)}
          />
        </div>
      </section>

      <section className="card eco-section-card">
        <div className="eco-section-head">
          <div>
            <div className="eco-kicker">System</div>
            <h3>Shift to a sustainable product</h3>
          </div>
        </div>
        <p>
          Start from a default list of life cycle attributes and unselect the ones that do not make sense for your
          product. You can also add custom attributes when something important is missing.
        </p>
        <div className="eco-attribute-media">
          <figure className="eco-media-frame eco-cycle1-frame">
            <img src="/eco-design/cycle1.png" alt="Lifecycle attributes overview" loading="lazy" />
          </figure>
        </div>
        <div className="eco-attribute-grid">
          {LIFECYCLE_STAGES.map((stage) => {
            const selectedAttributes = getSelectedAttributes(stage);
            const visibleAttributes = getVisibleAttributes(stage);
            return (
              <article key={stage.id} className={`eco-attribute-card ${selectedAttributes.length ? "active" : ""}`}>
                <div className="eco-attribute-head">
                  <h4>{stage.title}</h4>
                  <span className="badge">{selectedAttributes.length} selected</span>
                </div>
                <div className="eco-checkbox-list">
                  {visibleAttributes.map((attribute) => (
                    <label key={attribute} className="eco-checkbox-row">
                      <input
                        type="checkbox"
                        checked={selectedAttributes.includes(attribute)}
                        onChange={() => toggleAttribute(stage, attribute)}
                      />
                      <span>{attribute}</span>
                    </label>
                  ))}
                </div>
                <div className="eco-inline-form">
                  <input
                    type="text"
                    value={attributeDrafts[stage.id] || ""}
                    onChange={(event) =>
                      setAttributeDrafts((drafts) => ({ ...drafts, [stage.id]: event.target.value }))
                    }
                    placeholder="Add another relevant attribute"
                  />
                  <button type="button" className="btn" onClick={() => addCustomAttribute(stage)}>
                    Add
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <div className="eco-callout">
          <p>
            Achievement: you now have a product-specific list of life cycle attributes that can be improved to reach
            the sustainable vision.
          </p>
        </div>
      </section>

      <section className="card eco-section-card">
        <div className="eco-section-head">
          <div>
            <div className="eco-kicker">Assessment</div>
            <h3>Discover your product environmental performance</h3>
          </div>
        </div>
        <p>
          Score the room for improvement from 1 to 5 for each stage. The goal is not to be perfect, but to use
          informed judgment and highlight the hotspots where the current product is furthest from the sustainable
          vision.
        </p>
        <div className="eco-assessment-media">
          <figure className="eco-media-frame">
            <img src="/eco-design/assesment.png" alt="Assessment overview chart" loading="lazy" />
          </figure>
        </div>
        <div className="eco-assessment-grid">
          {LIFECYCLE_STAGES.map((stage) => (
            <article key={stage.assessmentId} className={`eco-assessment-card ${hasAnswered(answers[stage.assessmentId]) ? "active" : ""}`}>
              <h4>{stage.title}</h4>
              <p className="question-description">Use a 1 to 5 scale, or choose No answer if information is missing.</p>
              <select
                value={answers[stage.assessmentId] || ""}
                onChange={(event) => setA(stage.assessmentId, event.target.value)}
              >
                <option value="">Select a score</option>
                {ASSESSMENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </article>
          ))}
        </div>
        <div className="question-card">
          <label htmlFor="eco_action_priority">
            <strong>Which eco-design priorities should move into the action plan?</strong>
          </label>
          <p className="question-description">
            Summarize the hotspots, useful strategies, and the first practical actions the company should take.
          </p>
          <textarea
            id="eco_action_priority"
            rows="5"
            value={answers.eco_action_priority || ""}
            onChange={(event) => setA("eco_action_priority", event.target.value)}
          />
        </div>
      </section>
    </div>
  );
}
