export const TOOLS_CATALOG = [
  {
    key: "green-business-model",
    title: "Green Business Model",
    description: "Build and refine your sustainable business model.",
    exportable: true,
    questions: [
      {
        id: "valueProposition",
        label: "What is your green value proposition?",
        description: "This clarifies the concrete sustainable value your customer gets.",
        inputType: "textarea"
      },
      {
        id: "customerSegments",
        label: "Who are your key customer segments?",
        description: "This identifies who you serve and which users benefit most.",
        inputType: "textarea"
      },
      {
        id: "channels",
        label: "Which channels will you use to reach customers?",
        description: "This ensures your model includes a realistic go-to-customer path.",
        inputType: "textarea"
      },
      {
        id: "revenueStreams",
        label: "How will the business generate revenue?",
        description: "This checks if your impact model is also economically viable.",
        inputType: "textarea"
      },
      {
        id: "environmentalImpact",
        label: "What environmental impact do you expect?",
        description: "This measures the ecological improvements your solution creates.",
        inputType: "textarea"
      },
      {
        id: "socialImpact",
        label: "What social impact do you expect?",
        description: "This captures community, inclusion, and social well-being outcomes.",
        inputType: "textarea"
      },
      {
        id: "financialPlan",
        label: "What is your short-term financial plan?",
        description: "This helps confirm your startup can operate and scale responsibly.",
        inputType: "textarea"
      }
    ]
  },
  {
    key: "green-business-plan",
    title: "Green Business Plan",
    description: "Translate your model into an execution plan.",
    exportable: false,
    questions: [
      {
        id: "executiveSummary",
        label: "What is your business plan summary?",
        description: "This gives a concise view of strategy, impact, and ambition.",
        inputType: "textarea"
      },
      {
        id: "marketAnalysis",
        label: "What does your market analysis show?",
        description: "This validates demand, competitors, and your positioning.",
        inputType: "textarea"
      },
      {
        id: "operationsPlan",
        label: "What is your operations plan?",
        description: "This explains how the solution will be delivered efficiently.",
        inputType: "textarea"
      },
      {
        id: "marketingStrategy",
        label: "What is your marketing strategy?",
        description: "This details how you will attract and retain customers.",
        inputType: "textarea"
      },
      {
        id: "impactGoals",
        label: "What measurable impact goals have you set?",
        description: "This makes environmental and social targets auditable.",
        inputType: "textarea"
      },
      {
        id: "financialForecast",
        label: "What is your financial forecast?",
        description: "This checks revenue, cost, and cash assumptions over time.",
        inputType: "textarea"
      }
    ]
  },
  {
    key: "eco-design-tool",
    title: "Eco-design Tool",
    description: "Map the lifecycle, assess hotspots, and define eco-design actions.",
    exportable: false,
    questions: [
      {
        id: "eco_scope",
        label: "What are you going to eco-design?",
        description: "This fixes the scope of the work around either a product or a service.",
        inputType: "select",
        options: ["Product", "Service"]
      },
      {
        id: "eco_team_setup",
        label: "Who is involved in the eco-design work?",
        description: "This clarifies the mix of roles, knowledge, and coordination needed for the journey.",
        inputType: "textarea"
      },
      {
        id: "eco_project_name",
        label: "What is the name of the eco-design project?",
        description: "This gives the redesign effort a clear identity and makes the scope easier to communicate.",
        inputType: "text"
      },
      {
        id: "eco_project_overview",
        label: "What do you want to eco-design?",
        description: "This describes the current offer and the part of it that will be redesigned.",
        inputType: "textarea"
      },
      {
        id: "eco_context_forces",
        label: "Which forces of change matter most?",
        description: "This identifies the external trends and risks that should shape your eco-design strategy.",
        inputType: "textarea"
      },
      {
        id: "eco_sustainable_vision",
        label: "How would your ideal sustainable product or service look?",
        description: "This sets the target state you want the redesign to move toward.",
        inputType: "textarea"
      },
      {
        id: "eco_lifecycle_raw_materials",
        label: "How do raw materials and resources work today?",
        description: "This captures the starting point for the raw materials stage of the lifecycle.",
        inputType: "textarea"
      },
      {
        id: "eco_lifecycle_production",
        label: "How is the product produced today?",
        description: "This documents the current production process, inputs, and impacts.",
        inputType: "textarea"
      },
      {
        id: "eco_lifecycle_packaging",
        label: "How is the product packaged today?",
        description: "This describes the packaging choices and whether they can be improved.",
        inputType: "textarea"
      },
      {
        id: "eco_lifecycle_distribution",
        label: "How is the product distributed today?",
        description: "This shows the transport and logistics setup that supports delivery.",
        inputType: "textarea"
      },
      {
        id: "eco_lifecycle_use",
        label: "How is the product used and maintained today?",
        description: "This covers use-phase energy, maintenance, spare parts, and customer practices.",
        inputType: "textarea"
      },
      {
        id: "eco_lifecycle_end_of_life",
        label: "What happens at end of life today?",
        description: "This clarifies disposal, reuse, recycling, and recovery options.",
        inputType: "textarea"
      },
      {
        id: "eco_assessment_raw_materials",
        label: "What is the room for improvement in raw materials?",
        description: "This scores how far the raw materials stage is from the sustainable vision.",
        inputType: "select",
        options: ["1", "2", "3", "4", "5", "No answer"]
      },
      {
        id: "eco_assessment_production",
        label: "What is the room for improvement in production?",
        description: "This scores how far the production stage is from the sustainable vision.",
        inputType: "select",
        options: ["1", "2", "3", "4", "5", "No answer"]
      },
      {
        id: "eco_assessment_packaging",
        label: "What is the room for improvement in packaging?",
        description: "This scores how far the packaging stage is from the sustainable vision.",
        inputType: "select",
        options: ["1", "2", "3", "4", "5", "No answer"]
      },
      {
        id: "eco_assessment_distribution",
        label: "What is the room for improvement in distribution?",
        description: "This scores how far the distribution stage is from the sustainable vision.",
        inputType: "select",
        options: ["1", "2", "3", "4", "5", "No answer"]
      },
      {
        id: "eco_assessment_use",
        label: "What is the room for improvement in use and maintenance?",
        description: "This scores how far the use stage is from the sustainable vision.",
        inputType: "select",
        options: ["1", "2", "3", "4", "5", "No answer"]
      },
      {
        id: "eco_assessment_end_of_life",
        label: "What is the room for improvement at end of life?",
        description: "This scores how far the end-of-life stage is from the sustainable vision.",
        inputType: "select",
        options: ["1", "2", "3", "4", "5", "No answer"]
      },
      {
        id: "eco_action_priority",
        label: "Which eco-design priorities should move into the action plan?",
        description: "This turns the assessment into concrete priorities for action.",
        inputType: "textarea"
      }
    ]
  },
  {
    key: "finance-toolkit",
    title: "Finance Toolkit",
    description: "Prepare your financing strategy for growth.",
    exportable: false,
    questions: [
      {
        id: "fundingNeed",
        label: "What funding amount do you need for the next phase?",
        description: "This anchors your capital strategy on a clear target.",
        inputType: "text"
      },
      {
        id: "fundingUse",
        label: "How will you use the funds?",
        description: "This demonstrates operational discipline to partners.",
        inputType: "textarea"
      },
      {
        id: "revenueReadiness",
        label: "How mature is your current revenue stream?",
        description: "This signals repayment and investment readiness.",
        inputType: "select",
        options: ["No revenue", "Early traction", "Recurring revenue", "Scaling revenue"]
      },
      {
        id: "financialRisk",
        label: "What is your main financial risk?",
        description: "This helps prioritize mitigation before fundraising.",
        inputType: "textarea"
      }
    ]
  },
  {
    key: "access-to-market",
    title: "Access to Market",
    description: "Plan market entry and scale channels.",
    exportable: false,
    questions: [
      {
        id: "targetMarket",
        label: "What is your priority target market?",
        description: "This keeps your market launch focused and testable.",
        inputType: "textarea"
      },
      {
        id: "entryStrategy",
        label: "What is your market entry strategy?",
        description: "This defines how you convert early market opportunities.",
        inputType: "textarea"
      },
      {
        id: "salesChannels",
        label: "Which sales channels are your priority?",
        description: "This identifies where you expect fastest traction.",
        inputType: "textarea"
      },
      {
        id: "partnerships",
        label: "What partnerships will accelerate access to market?",
        description: "This highlights external levers for growth.",
        inputType: "textarea"
      }
    ]
  },
  {
    key: "impact-measurement-toolkit",
    title: "Impact Measurement Toolkit",
    description: "Define, track, and report your impact metrics.",
    exportable: false,
    questions: [
      {
        id: "impactMetric",
        label: "What is your main impact metric?",
        description: "This sets a central KPI for your sustainability claims.",
        inputType: "text"
      },
      {
        id: "baseline",
        label: "What baseline are you comparing against?",
        description: "This ensures measured impact is credible and contextualized.",
        inputType: "textarea"
      },
      {
        id: "dataCollection",
        label: "How will you collect impact data?",
        description: "This validates that tracking can be done consistently.",
        inputType: "textarea"
      },
      {
        id: "reportingFrequency",
        label: "How often will you report impact?",
        description: "This aligns monitoring with operational cadence.",
        inputType: "select",
        options: ["Monthly", "Quarterly", "Bi-annually", "Annually"]
      }
    ]
  }
];

export function getToolByKey(toolKey) {
  return TOOLS_CATALOG.find((tool) => tool.key === toolKey) || null;
}
