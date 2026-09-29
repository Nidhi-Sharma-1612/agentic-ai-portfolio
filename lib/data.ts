// Single source of truth for all portfolio content.
// The UI sections AND the "Ask my agent" chatbot both read from this file,
// so updating something here updates it everywhere.

export const profile = {
  name: "Nidhi Sharma",
  firstName: "Nidhi",
  roles: ["AI Engineer", "Agentic AI Engineer", "Full Stack AI Engineer"],
  tagline:
    "I build autonomous AI agents and the production-grade full-stack products that put them in front of real users.",
  summary:
    "Full Stack Engineer with 2+ years of experience building and shipping production web applications (Next.js, TypeScript, Node.js, PostgreSQL), now focused on AI Engineering. Certified Agentic AI Engineer (Edureka, 2026) with hands-on experience building autonomous agents using LangChain, LangGraph, CrewAI and LlamaIndex — including Agentic RAG (ReAct), multi-agent orchestration and vector search. I've shipped AI-powered products in production, including an AI legal-document platform and an AI website generator.",
  location: "Delhi, India",
  email: "nidhisharma1133@gmail.com",
  phone: "+91 7042918917",
  // TODO: drop your photo at public/profile-photo.jpeg (square works best).
  photo: "/profile-photo.jpeg",
  resume: "/resume.pdf",
  openTo: "AI Engineer · Agentic AI Engineer · Full Stack AI Engineer roles (remote / hybrid)",
  socials: {
    github: "https://github.com/Nidhi-Sharma-1612",
    linkedin: "https://linkedin.com/in/nidhisharma11",
  },
};

// About section: first-person story. **text** is highlighted.
export const aboutStory = [
  "I started out building **real-time products**: DeFi dashboards and a live betting game at Rapid Innovation, streaming data over GraphQL subscriptions. At Flowlaunch I moved into **AI products**, building the case chat for Docuswift, an AI legal-document platform, and the generation workflows behind Sites60, an AI website generator.",
  "Today I own **end-to-end delivery of 10+ production apps** at DesignByDial, and I build **autonomous agents**: agentic RAG with ReAct, multi-agent CrewAI pipelines and LangGraph workflows with a human in the loop. I do my best work where the model meets the product.",
];

// What I bring to a team (About cards).
export const strengths = [
  {
    title: "Agentic systems",
    text: "Agents that plan, call tools and retrieve the right context, with evals to check what they produce.",
  },
  {
    title: "Full-stack delivery",
    text: "Features from Figma to production: UI, APIs, databases, payments and deployment.",
  },
  {
    title: "AI product sense",
    text: "AI UX people trust: streaming answers, regenerate, feedback loops and persistent history.",
  },
];

export const stats = [
  { value: 2, suffix: "+", label: "Years shipping production code" },
  { value: 10, suffix: "+", label: "Production apps delivered" },
  { value: 7, suffix: "+", label: "Agentic AI projects built" },
  { value: 2, suffix: "", label: "AI products shipped to production" },
];

export const nowNext = {
  now: "Full Stack Developer @ DesignByDial",
  next: "AI Engineer · Agentic AI roles",
};

export type StackGroup = {
  id: string;
  name: string;
  tagline: string;
  // Core skills, each tied to real work so the claim is verifiable.
  core: { name: string; usedIn: string[] }[];
  also: string[];
};

export const stackGroups: StackGroup[] = [
  {
    id: "agents",
    name: "Agentic AI",
    tagline: "Agents that plan, call tools, remember context and hand off to each other.",
    core: [
      { name: "LangGraph", usedIn: ["Healthcare Research Assistant"] },
      { name: "CrewAI", usedIn: ["FeedWise Agent"] },
      { name: "ReAct · Agentic RAG", usedIn: ["Competitive Analysis Agent"] },
      { name: "LangChain", usedIn: ["Code Review Agent"] },
      { name: "Agno", usedIn: ["YNC Support Triage Agent"] },
    ],
    also: ["AutoGen", "Langflow", "Multi-agent orchestration", "Agent memory", "Human-in-the-loop"],
  },
  {
    id: "llm",
    name: "LLMs & Retrieval",
    tagline: "Grounding models in the right context and getting reliable output back.",
    core: [
      { name: "OpenAI GPT-4o", usedIn: ["Rayeva AI", "YNC Support Triage Agent"] },
      { name: "LlamaIndex", usedIn: ["Competitive Analysis Agent"] },
      { name: "Pinecone", usedIn: ["YNC Support Triage Agent"] },
      { name: "Cohere", usedIn: ["Competitive Analysis Agent"] },
      { name: "Vercel AI SDK", usedIn: ["This portfolio's agent"] },
    ],
    also: [
      "Google Gemini",
      "Embeddings",
      "Hybrid search",
      "Semantic search",
      "Prompt engineering",
      "Structured outputs",
    ],
  },
  {
    id: "backend",
    name: "Backend & APIs",
    tagline: "The services that put AI features in front of real users.",
    core: [
      { name: "Node.js · Express", usedIn: ["Rayeva AI"] },
      { name: "Python", usedIn: ["Agentic AI projects"] },
      { name: "REST APIs", usedIn: ["Docuswift", "Sites60"] },
      { name: "GraphQL", usedIn: ["Rapid Innovation"] },
      { name: "Stripe", usedIn: ["DesignByDial"] },
    ],
    also: ["Hostaway API", "Guesty API", "Lodgify API", "Web3.js"],
  },
  {
    id: "frontend",
    name: "Frontend",
    tagline: "Fast, polished interfaces, from Figma to production.",
    core: [
      { name: "Next.js", usedIn: ["DesignByDial", "Docuswift", "This portfolio"] },
      { name: "TypeScript", usedIn: ["DesignByDial", "This portfolio"] },
      { name: "React", usedIn: ["Rapid Innovation", "Rayeva AI"] },
      { name: "Tailwind CSS", usedIn: ["Docuswift", "This portfolio"] },
      { name: "Three.js", usedIn: ["This portfolio"] },
    ],
    also: ["Framer Motion", "Streamlit", "Styled-Components", "ApexCharts", "JavaScript"],
  },
  {
    id: "data",
    name: "Data & Delivery",
    tagline: "Storage, deployment and the tooling that keeps shipping smooth.",
    core: [
      { name: "PostgreSQL", usedIn: ["DesignByDial"] },
      { name: "MongoDB", usedIn: ["Rayeva AI"] },
      { name: "Coolify · VPS", usedIn: ["DesignByDial"] },
      { name: "Vercel", usedIn: ["This portfolio"] },
    ],
    also: ["Git & GitHub", "Claude Code", "Figma", "Jira"],
  },
];

export type Experience = {
  role: string;
  company: string;
  period: string;
  location: string;
  current?: boolean;
  // One-line focus shown as a tag; `ai` highlights the AI-relevant role.
  focus: { label: string; ai?: boolean };
  highlights: { title: string; detail: string }[];
  // Tools not already named in the highlights.
  tech: string[];
  links?: { label: string; href: string }[];
};

export const experience: Experience[] = [
  {
    role: "Full Stack Developer",
    company: "DesignByDial",
    period: "Jun 2026 — Present",
    location: "Remote",
    current: true,
    focus: { label: "Production full-stack" },
    highlights: [
      {
        title: "Own end-to-end delivery",
        detail: "of 10+ production vacation-rental websites and web apps.",
      },
      {
        title: "Built a multi-tenant admin/CMS",
        detail: "that manages content and leads for 10+ client frontends from one dashboard.",
      },
      {
        title: "Integrated PMS and payment APIs",
        detail: "(Hostaway, Guesty, Lodgify, Stripe), and deploy on a VPS with Coolify.",
      },
    ],
    tech: ["Next.js", "TypeScript", "PostgreSQL"],
    links: [
      { label: "designbydial.com", href: "https://designbydial.com" },
      { label: "staywithrentico.com", href: "https://staywithrentico.com" },
    ],
  },
  {
    role: "Frontend Developer",
    company: "Flowlaunch",
    period: "Jun 2024 — Oct 2024",
    location: "Remote",
    focus: { label: "AI products", ai: true },
    highlights: [
      {
        title: "Docuswift, AI legal-document platform:",
        detail: "built the AI case chat (regenerate, feedback, persistent history) and AI-generated case insights.",
      },
      {
        title: "Sites60, AI website generator:",
        detail: "built templates and AI edit, regenerate and delete workflows for sites generated in 60 seconds.",
      },
      {
        title: "Marketing sites",
        detail: "for Docuswift and Flowlaunch, from Figma to production.",
      },
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "REST APIs"],
    links: [{ label: "See Docuswift & Sites60", href: "#projects" }],
  },
  {
    role: "Associate Software Developer",
    company: "Rapid Innovation",
    period: "Aug 2021 — Dec 2022",
    location: "Remote",
    focus: { label: "Real-time & Web3" },
    highlights: [
      {
        title: "DeFi and gaming apps",
        detail: "in React and Next.js (Exo DeFi Marketplace, Pulse Crash), integrated with Web3.js.",
      },
      {
        title: "Real-time data",
        detail: "over GraphQL subscriptions, including live crash-point updates for a betting game.",
      },
      {
        title: "Interactive charts",
        detail: "with ApexCharts and Canvas for market data and live game events.",
      },
    ],
    tech: ["Styled-Components", "Figma"],
  },
];

export type ProjectCategory = "agentic" | "fullstack-ai" | "production";

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  category: ProjectCategory;
  description: string;
  highlights: string[];
  tech: string[];
  // Architecture flow rendered as an animated pipeline on the card.
  flow: string[];
  // TODO: replace with the exact repo / live-demo URLs.
  github?: string;
  demo?: string;
  featured?: boolean;
};

const GH = profile.socials.github;

export const projects: Project[] = [
  {
    id: "competitive-analysis",
    featured: true,
    title: "Competitive Analysis Agent",
    subtitle: "Agentic RAG · ReAct",
    category: "agentic",
    description:
      "An agentic RAG system that uses the ReAct (Reason + Act) loop to break a business question into sub-goals, retrieve evidence from a LlamaIndex vector index and produce structured competitive insights.",
    highlights: [
      "Query decomposition into sub-goals with adaptive retrieval",
      "Cohere for both embeddings and generation",
      "Full reasoning-step transparency in a live Streamlit app",
    ],
    tech: ["Python", "LlamaIndex", "Cohere", "ReAct", "Streamlit"],
    flow: ["Query", "ReAct Planner", "Vector Retrieval", "Cohere LLM", "Insights"],
    github: GH,
  },
  {
    id: "ync-triage",
    featured: true,
    title: "YNC Support Triage Agent",
    subtitle: "Classification · Hybrid Search",
    category: "agentic",
    description:
      "An e-commerce support-triage agent that classifies tickets by sentiment, urgency and intent, retrieves similar tickets and policies via hybrid search over Pinecone, and drafts policy-compliant replies.",
    highlights: [
      "Sentiment / urgency / intent classification",
      "Hybrid search over Pinecone for similar tickets & policies",
      "Supervisor dashboard with KPIs and AI-generated summaries",
    ],
    tech: ["Agno", "GPT-4o-mini", "Pinecone", "Streamlit"],
    flow: ["Ticket", "Classifier", "Hybrid Search", "GPT-4o-mini", "Draft Reply"],
    github: GH,
  },
  {
    id: "feedwise",
    title: "FeedWise Agent",
    subtitle: "6-Agent CrewAI Pipeline",
    category: "agentic",
    description:
      "A multi-agent pipeline that automates triage of app-store reviews and support emails — classifying feedback, extracting bug and feature details, generating structured tickets and scoring ticket quality end-to-end.",
    highlights: [
      "6 specialised agents with clear hand-offs",
      "Bug / feature extraction into structured tickets",
      "Automated quality scoring of every generated ticket",
    ],
    tech: ["CrewAI", "Python", "LLMs"],
    flow: ["Feedback", "Classifier", "Extractor", "Ticket Writer", "QA Scorer"],
    github: GH,
  },
  {
    id: "rayeva",
    title: "Rayeva AI",
    subtitle: "Sustainable Procurement Platform",
    category: "fullstack-ai",
    description:
      "A full-stack B2B platform with an AI Product Categorizer and an AI Proposal Generator that auto-creates procurement proposals with budget breakdowns and ESG / carbon-impact summaries.",
    highlights: [
      "GPT-4o product categorization",
      "Auto-generated proposals with budget & ESG breakdowns",
      "Clean separation of AI/prompt logic from business logic",
    ],
    tech: ["React", "Node.js", "Express.js", "MongoDB", "GPT-4o"],
    flow: ["React UI", "Express API", "Prompt Layer", "GPT-4o", "MongoDB"],
    github: GH,
  },
  {
    id: "healthcare-langgraph",
    title: "Healthcare Research Assistant",
    subtitle: "LangGraph · Human-in-the-loop",
    category: "agentic",
    description:
      "A LangGraph research assistant for healthcare questions with a human-in-the-loop approval step before the agent commits to its final answer.",
    highlights: ["Stateful graph-based agent workflow", "Human approval checkpoint"],
    tech: ["LangGraph", "Python", "LLMs"],
    flow: ["Question", "Research Node", "Human Review", "Answer"],
    github: GH,
  },
  {
    id: "code-review",
    title: "Code Review Agent",
    subtitle: "LangChain",
    category: "agentic",
    description: "A LangChain agent that reviews code and returns structured, actionable feedback.",
    highlights: ["Tool-using review agent", "Structured feedback output"],
    tech: ["LangChain", "Python", "LLMs"],
    flow: ["Code", "Analyzer", "LLM Review", "Feedback"],
    github: GH,
  },
  {
    id: "bookstore",
    title: "Bookstore Assistant",
    subtitle: "Langflow",
    category: "agentic",
    description: "A conversational bookstore assistant built visually with Langflow.",
    highlights: ["Visual agent flow design", "Conversational recommendations"],
    tech: ["Langflow", "LLMs"],
    flow: ["User", "Langflow Agent", "Catalog", "Reply"],
    github: GH,
  },
  {
    id: "docuswift",
    featured: true,
    title: "Docuswift",
    subtitle: "AI Legal-Document Platform · Flowlaunch",
    category: "production",
    description:
      "An AI-powered legal-document platform, shipped to production at Flowlaunch. I built its AI case chat and the case-insight features around it.",
    highlights: [
      "Regenerate and dislike feedback on every AI answer",
      "Chat history that persists across sessions",
      "AI-generated case insights surfaced through integrated APIs",
    ],
    tech: ["Next.js", "React", "Tailwind CSS", "REST APIs"],
    flow: ["Case Docs", "API Layer", "LLM", "Case Chat UI"],
  },
  {
    id: "sites60",
    title: "Sites60",
    subtitle: "AI Website Generator · Flowlaunch",
    category: "production",
    description:
      "An AI website generator that creates fully customizable sites in 60 seconds. I built the responsive templates and the AI content edit / regenerate / delete workflows.",
    highlights: ["Site generated in ~60 seconds", "AI content regenerate workflows"],
    tech: ["Next.js", "React", "REST APIs"],
    flow: ["Prompt", "AI Generator", "Templates", "Live Site"],
  },
  {
    id: "designbydial",
    title: "DesignByDial Platform",
    subtitle: "Multi-tenant CMS · 10+ sites",
    category: "production",
    description:
      "10+ production vacation-rental websites driven by one multi-tenant admin/CMS panel, integrated with Hostaway, Guesty, Lodgify and Stripe.",
    highlights: ["Multi-tenant CMS for 10+ frontends", "PMS + Stripe integrations", "Self-hosted on VPS with Coolify"],
    tech: ["Next.js", "TypeScript", "PostgreSQL", "Stripe"],
    flow: ["Admin CMS", "Postgres", "PMS APIs", "10+ Sites"],
    demo: "https://designbydial.com",
  },
];

export const categoryLabels: Record<ProjectCategory, string> = {
  agentic: "Agentic AI",
  "fullstack-ai": "Full-stack AI",
  production: "In production",
};

export type Certification = {
  title: string;
  issuer: string;
  date: string;
  featured?: boolean;
  // TODO: paste the public verification link (e.g. from Edureka / Udemy) to show "Verify ↗".
  url?: string;
};

export const certifications: Certification[] = [
  { title: "Agentic AI Engineer Certification", issuer: "Edureka", date: "May 2026", featured: true },
  { title: "Node.js, Express, MongoDB & More: The Complete Bootcamp", issuer: "Udemy", date: "2024" },
  { title: "The Complete Web Development Bootcamp", issuer: "Udemy", date: "2021" },
  { title: "Programming for Everybody (Python)", issuer: "University of Michigan · Coursera", date: "" },
];

export const education = [
  {
    degree: "B.Tech, Computer Science & Engineering",
    school: "Krishna Engineering College, Ghaziabad",
    period: "2017 — 2021",
    score: "89.76%",
    honors: "Certificate of Merit in all 4 years",
  },
];

export const navLinks = [
  { id: "about", label: "About" },
  { id: "stack", label: "Stack" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "agent", label: "Ask AI" },
  { id: "contact", label: "Contact" },
];
