import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { profile } from "@/lib/data";
import "./globals.css";
import { siteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains" });

const title = `${profile.name} — AI Engineer · Agentic AI · Full Stack`;
const description =
  "Portfolio of Nidhi Sharma, an AI Engineer building autonomous agents (LangGraph, CrewAI, LlamaIndex, Agentic RAG) and production full-stack products with Next.js and TypeScript.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "AI Engineer",
    "Agentic AI Engineer",
    "Full Stack AI Engineer",
    "LangGraph",
    "LangChain",
    "CrewAI",
    "LlamaIndex",
    "RAG",
    "Next.js",
    "TypeScript",
    "Nidhi Sharma",
  ],
  authors: [{ name: profile.name, url: profile.socials.linkedin }],
  openGraph: { title, description, type: "website", url: siteUrl, siteName: profile.name },
  twitter: { card: "summary_large_image", title, description },
};

export const viewport: Viewport = { themeColor: "#04050d" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: "AI Engineer",
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Delhi", addressCountry: "IN" },
  sameAs: [profile.socials.github, profile.socials.linkedin],
  knowsAbout: ["Agentic AI", "LangGraph", "LangChain", "CrewAI", "RAG", "Next.js", "TypeScript"],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrains.variable}`}
    >
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
      </body>
    </html>
  );
}
