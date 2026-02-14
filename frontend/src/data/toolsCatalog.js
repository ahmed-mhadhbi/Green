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
    description: "Improve product design through lifecycle thinking.",
    exportable: false,
    questions: [
      {
        id: "materialsSelection",
        label: "How do you select low-impact materials?",
        description: "This identifies where resource and emissions savings start.",
        inputType: "textarea"
      },
      {
        id: "lifecycleHotspots",
        label: "Which lifecycle stages have the biggest impact?",
        description: "This focuses your design effort on the most critical stages.",
        inputType: "textarea"
      },
      {
        id: "repairability",
        label: "How repairable and reusable is your solution?",
        description: "This assesses circularity and product longevity.",
        inputType: "textarea"
      },
      {
        id: "designPriority",
        label: "Which eco-design priority is most urgent?",
        description: "This helps choose the first practical action to implement.",
        inputType: "select",
        options: ["Material reduction", "Energy efficiency", "Repairability", "End-of-life recovery"]
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
