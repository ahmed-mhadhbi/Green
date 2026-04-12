export const TOOL_SECTIONS = {
  "green-business-plan": [
    {
      id: "gbp-intro",
      title: "Instruction 1.1: Tool overview",
      description: "Review how the Green Business Plan works before you start writing your answers.",
      stepGroup: 1,
      questionIds: []
    },
    {
      id: "gbp-launching",
      title: "Instruction 1.2: Launching your business",
      description: "Use this step to understand the purpose of the business-planning phase and how it guides execution.",
      stepGroup: 1,
      questionIds: []
    },
    {
      id: "gbp-operations",
      title: "Instruction 1.3: Operation and management plan",
      description: "Define how the business will operate day to day, who will run it, and what resources are required.",
      stepGroup: 1,
      questionIds: [
        "operationsPlan",
        "gbp_management_problem_solving",
        "gbp_human_resources_policy",
        "gbp_physical_assets",
        "gbp_intellectual_resources",
        "gbp_production_suppliers"
      ]
    },
    {
      id: "gbp-marketing",
      title: "Instruction 1.4: Marketing plan",
      description: "Clarify your customers, positioning, channels, and the way your sustainable offer reaches the market.",
      stepGroup: 1,
      questionIds: [
        "marketingStrategy",
        "gbp_customers_value_proposition",
        "marketAnalysis",
        "gbp_product_offer_pricing",
        "gbp_branding_positioning",
        "gbp_communication_channels",
        "gbp_customer_relationships"
      ]
    },
    {
      id: "gbp-financial",
      title: "Instruction 1.5: Financial plan",
      description: "Document setup costs, forecasts, and the core numbers that prove the plan is viable.",
      stepGroup: 1,
      questionIds: [
        "gbp_setup_costs_capital",
        "gbp_income_statement_y0",
        "gbp_cash_flow",
        "gbp_balance_sheet",
        "gbp_break_even",
        "financialForecast",
        "gbp_financial_accounting_break_even_details",
        "gbp_other_financial_metrics"
      ]
    },
    {
      id: "gbp-legal",
      title: "Instruction 1.6: Legal management plan",
      description: "Capture the legal structure, market protections, and regulatory context for the business.",
      stepGroup: 1,
      questionIds: [
        "gbp_legal_organizational",
        "gbp_legal_market",
        "gbp_legal_territorial"
      ]
    },
    {
      id: "gbp-measuring",
      title: "Instruction 1.7: Measuring and looking forward",
      description: "Explain how you will forecast the future and measure impact so the business can improve continuously.",
      stepGroup: 1,
      questionIds: [
        "gbp_forecasting_future",
        "impactGoals"
      ]
    },
    {
      id: "gbp-summary",
      title: "Instruction 1.8: Executive summary and organization profile",
      description: "Assemble the core summary, organization profile, business overview, and investor-facing details.",
      stepGroup: 1,
      questionIds: [
        "executiveSummary",
        "gbp_vision",
        "gbp_mission",
        "gbp_objectives",
        "gbp_value_proposition",
        "gbp_business_summary",
        "gbp_testimony",
        "gbp_video_pitch_link",
        "gbp_org_name",
        "gbp_org_contact",
        "gbp_org_email",
        "gbp_org_address",
        "gbp_org_phone",
        "gbp_org_website",
        "gbp_org_employees",
        "gbp_org_maturity",
        "gbp_org_legal_status",
        "gbp_org_sector",
        "gbp_org_country",
        "gbp_org_team",
        "gbp_business_problem_needs",
        "gbp_business_best_solution",
        "gbp_business_offer",
        "gbp_business_target_market",
        "gbp_business_competitive_edge",
        "gbp_financial_summary",
        "gbp_financial_capital_raised",
        "gbp_financial_burn_rate",
        "gbp_financial_pre_money",
        "gbp_financial_why_financing",
        "gbp_financial_use_of_funds",
        "gbp_financial_capital_seeking",
        "gbp_financial_type_sought",
        "gbp_financial_projections",
        "gbp_financial_funds_raised",
        "gbp_project_impact_indicators"
      ]
    },
    {
      id: "gbp-take-off",
      title: "Instruction 2: The business take off",
      description: "List the next execution steps that move the plan into action.",
      stepGroup: 2,
      questionIds: ["gbp_execution_next_steps"]
    },
    {
      id: "gbp-funding",
      title: "Instruction 3: Get funded",
      description: "Summarize your funding strategy, target sources, and outreach plan.",
      stepGroup: 3,
      questionIds: ["gbp_funding_strategy"]
    }
  ],
  "eco-design-tool": [
    {
      id: "eco-intro",
      title: "Instruction 1.1: Tool overview",
      description: "Start with the eco-design overview so the team understands the purpose of the tool.",
      stepGroup: 1,
      questionIds: []
    },
    {
      id: "eco-journey",
      title: "Instruction 1.2: Eco-design journey",
      description: "Review the eco-design journey and the logic of the steps before answering.",
      stepGroup: 1,
      questionIds: []
    },
    {
      id: "eco-scope",
      title: "Instruction 1.3: Define your scope",
      description: "Choose whether you are eco-designing a product or a service.",
      stepGroup: 1,
      questionIds: ["eco_scope"]
    },
    {
      id: "eco-pack-bag",
      title: "Instruction 1.4: Pack the bag",
      description: "Capture the project name, team, context, and sustainable vision for the redesign journey.",
      stepGroup: 1,
      questionIds: [
        "eco_project_name",
        "eco_team_setup",
        "eco_project_overview",
        "eco_context_forces",
        "eco_sustainable_vision"
      ]
    },
    {
      id: "eco-life-cycle",
      title: "Instruction 2: Current life cycle",
      description: "Describe the current life cycle of the offer across all major stages.",
      stepGroup: 2,
      questionIds: [
        "eco_lifecycle_raw_materials",
        "eco_lifecycle_production",
        "eco_lifecycle_packaging",
        "eco_lifecycle_distribution",
        "eco_lifecycle_use",
        "eco_lifecycle_end_of_life"
      ]
    },
    {
      id: "eco-assessment",
      title: "Instruction 3: Assessment and action priorities",
      description: "Score the room for improvement and turn the hotspots into a practical action priority list.",
      stepGroup: 3,
      questionIds: [
        "eco_assessment_raw_materials",
        "eco_assessment_production",
        "eco_assessment_packaging",
        "eco_assessment_distribution",
        "eco_assessment_use",
        "eco_assessment_end_of_life",
        "eco_action_priority"
      ]
    }
  ],
  "access-to-market": [
    {
      id: "atm-intro",
      title: "Instruction 1.1: Tool overview",
      description: "Review the purpose of the Access to Market tool and how it strengthens a sustainable brand.",
      stepGroup: 1,
      questionIds: []
    },
    {
      id: "atm-start",
      title: "Instruction 1.2: How to get started",
      description: "Use this overview step to understand the modules before filling in the tool.",
      stepGroup: 1,
      questionIds: []
    },
    {
      id: "atm-brand-goals",
      title: "Instruction 1.3: Align brand and business goals",
      description: "Align the brand with the business mission and summarize the origin story of the venture.",
      stepGroup: 1,
      questionIds: [
        "atm_challenge_summary",
        "atm_founder_story",
        "atm_offer_value_prop",
        "atm_why_it_matters",
        "atm_mission_sentence",
        "atm_genesis_milestones",
        "atm_genesis_key_players",
        "atm_genesis_story"
      ]
    },
    {
      id: "atm-positioning",
      title: "Instruction 2.1: Brand positioning",
      description: "Define the strengths, positioning space, and manifesto that make the brand stand out.",
      stepGroup: 2,
      questionIds: [
        "atm_swot_strengths",
        "atm_swot_weaknesses",
        "atm_swot_opportunities",
        "atm_swot_threats",
        "atm_positioning_top_strengths",
        "atm_positioning_quadrant",
        "atm_positioning_niche",
        "atm_brand_manifesto"
      ]
    },
    {
      id: "atm-visual",
      title: "Instruction 2.2: Visual identity",
      description: "Build the visual side of the brand and document the foundations of the style guide.",
      stepGroup: 2,
      questionIds: [
        "atm_brand_name_notes",
        "atm_logo_benchmarking",
        "atm_logo_tests",
        "atm_visual_identity_consistency",
        "atm_style_guide_basics",
        "atm_style_guide_visuals",
        "atm_style_guide_keywords",
        "atm_style_guide_messages"
      ]
    },
    {
      id: "atm-narrative",
      title: "Instruction 3: Narrative and key messages",
      description: "Clarify the audiences, core messages, and storytelling structure for the brand.",
      stepGroup: 3,
      questionIds: [
        "atm_audience_core",
        "atm_audience_ambassadors",
        "atm_audience_future",
        "targetMarket",
        "atm_message_current",
        "atm_message_desired",
        "atm_message_avoid",
        "atm_message_three_sentences",
        "atm_story_subject",
        "atm_story_goals",
        "atm_story_audience",
        "atm_story_before_after",
        "atm_story_scene",
        "atm_story_key_messages",
        "atm_story_conclusion"
      ]
    },
    {
      id: "atm-offline",
      title: "Instruction 4.1: Offline communications",
      description: "Plan market entry, sales channels, offline campaigns, and sustainable promotional materials.",
      stepGroup: 4,
      questionIds: [
        "entryStrategy",
        "salesChannels",
        "atm_offline_tool_mix",
        "atm_creative_brief",
        "atm_promo_materials",
        "atm_packaging_practices"
      ]
    },
    {
      id: "atm-digital",
      title: "Instruction 4.2: Digital communications",
      description: "Define the website structure and the digital channels, cadence, and metrics that support growth.",
      stepGroup: 4,
      questionIds: [
        "atm_website_plan",
        "atm_social_goals",
        "atm_social_channels",
        "atm_social_calendar",
        "atm_social_metrics"
      ]
    },
    {
      id: "atm-stakeholders",
      title: "Instruction 5.1: Stakeholder mapping",
      description: "Identify, map, and prioritize the external stakeholders who matter most.",
      stepGroup: 5,
      questionIds: [
        "atm_stakeholder_list",
        "atm_stakeholder_map",
        "atm_stakeholder_priority"
      ]
    },
    {
      id: "atm-partnerships",
      title: "Instruction 5.2: Partnership activation",
      description: "Select partnership opportunities and define how you will activate and evaluate them.",
      stepGroup: 5,
      questionIds: [
        "partnerships",
        "atm_partnership_benefits_risks",
        "atm_partnership_activation"
      ]
    },
    {
      id: "atm-glossary",
      title: "Instruction 6: Glossary of key concepts",
      description: "Use the glossary as a reference while you complete the tool.",
      stepGroup: 6,
      questionIds: []
    }
  ],
  "finance-toolkit": [
    {
      id: "finance-1",
      title: "Instruction 1: Funding need",
      description: "Clarify the funding amount required for the next phase.",
      stepGroup: 1,
      questionIds: ["fundingNeed"]
    },
    {
      id: "finance-2",
      title: "Instruction 2: Use of funds",
      description: "Explain how the financing will be used.",
      stepGroup: 2,
      questionIds: ["fundingUse"]
    },
    {
      id: "finance-3",
      title: "Instruction 3: Revenue readiness",
      description: "Describe the maturity of the current revenue model.",
      stepGroup: 3,
      questionIds: ["revenueReadiness"]
    },
    {
      id: "finance-4",
      title: "Instruction 4: Financial risk",
      description: "Identify the main financial risk to manage.",
      stepGroup: 4,
      questionIds: ["financialRisk"]
    }
  ],
  "impact-measurement-toolkit": [
    {
      id: "impact-1",
      title: "Instruction 1: Impact metric",
      description: "Define the main impact metric you will track.",
      stepGroup: 1,
      questionIds: ["impactMetric"]
    },
    {
      id: "impact-2",
      title: "Instruction 2: Baseline",
      description: "Set the baseline that the impact metric will be compared against.",
      stepGroup: 2,
      questionIds: ["baseline"]
    },
    {
      id: "impact-3",
      title: "Instruction 3: Data collection",
      description: "Explain how impact data will be collected.",
      stepGroup: 3,
      questionIds: ["dataCollection"]
    },
    {
      id: "impact-4",
      title: "Instruction 4: Reporting frequency",
      description: "Choose the reporting frequency for impact measurement.",
      stepGroup: 4,
      questionIds: ["reportingFrequency"]
    }
  ]
};

export function getToolSections(tool) {
  if (!tool) return [];
  if (TOOL_SECTIONS[tool.key]) return TOOL_SECTIONS[tool.key];

  return (tool.questions || []).map((question, index) => ({
    id: `${tool.key}-${question.id}`,
    title: question.label,
    description: question.description,
    questionIds: [question.id],
    step: index + 1
  }));
}
