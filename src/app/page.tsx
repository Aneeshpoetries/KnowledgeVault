import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  ShieldCheck,
  Users,
} from "@/components/ui/icons";
import { KnowledgeVaultLogo } from "@/components/ui/KnowledgeVaultLogo";
import {
  InterviewDemo,
  AnswerDemo,
  StoryMotion,
} from "@/components/marketing/ProductStory";
import { MemoryFlow } from "@/components/marketing/MemoryFlow";
import { CinematicDemo } from "@/components/marketing/CinematicDemo";
import "./marketing-redesign.css";
import "./cinematic.css";
import "./marketing-polish.css";
import "./marketing-flow.css";

function CTA({
  href,
  children,
  secondary = false,
}: {
  href: string;
  children: React.ReactNode;
  secondary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`kv-button ${secondary ? "kv-button-secondary" : ""}`}
    >
      {children}
      <ArrowUpRight size={16} />
    </Link>
  );
}
function Heading({
  number,
  label,
  title,
  children,
}: {
  number: string;
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="kv-section-heading">
      <p className="kv-eyebrow">
        <span>{number}</span>
        {label}
      </p>
      <h2>{title}</h2>
      {children && <p className="kv-lead">{children}</p>}
    </div>
  );
}
export default function LandingPage() {
  return (
    <div className="kv-marketing">
      <StoryMotion />
      <header className="kv-header">
        <div className="kv-container kv-nav">
          <Link href="/" className="kv-brand">
            <KnowledgeVaultLogo size={28} />
            <span>
              KnowledgeVault<span className="kv-brand-dot">.</span>
            </span>
          </Link>
          <nav aria-label="Main navigation">
            <a href="#memory">Product</a>
            <a href="#coverage">Coverage & risk</a>
            <a href="#interview">How it works</a>
            <a href="#retrieve">Answers & evidence</a>
          </nav>
          <div className="kv-nav-actions">
            <Link href="/login">Sign in</Link>
            <CTA href="/login">Get started</CTA>
          </div>
        </div>
      </header>
      <main>
        <section className="kv-hero kv-container">
          <div className="kv-hero-copy">
            <p className="kv-eyebrow">
              <span className="kv-status-dot" />
              KNOWLEDGE CONTINUITY FOR ENGINEERING TEAMS
            </p>
            <h1>
              People leave.
              <br />
              <span>Knowledge stays.</span>
            </h1>
            <p className="kv-hero-description">
              Find the procedures only one person knows. Capture their
              experience in focused interviews, verify it, and give the next
              engineer answers with sources.
            </p>
            <div className="kv-actions">
              <CTA href="#product-demo">See the product in motion</CTA>
              <CTA secondary href="/login">
                Explore the workspace
              </CTA>
            </div>
            <div className="kv-hero-foot">
              <span>FIND KNOWLEDGE GAPS</span>
              <span>CAPTURE THE CONTEXT</span>
              <span>VERIFY BEFORE RELYING</span>
            </div>
          </div>
        </section>
        <CinematicDemo />
        <p className="kv-demo-disclosure kv-container">
          Illustrative demo workspace. Coverage, confidence, and ownership
          figures show an example continuity assessment.
        </p>
        <section className="kv-section kv-container" id="memory" data-reveal>
          <Heading
            number="01"
            label="CAPTURE THE CONTEXT"
            title="Turn scattered context into organizational memory."
          >
            The answer is rarely in one document. Connect documents, incident
            notes, and employee experience to the procedures, projects, and
            people they describe.
          </Heading>
          <MemoryFlow />
        </section>
        <section
          className="kv-section kv-container kv-split"
          id="coverage"
          data-reveal
        >
          <div className="kv-stage kv-coverage">
            <div className="kv-stage-title">
              <span>KNOWLEDGE COVERAGE</span>
              <span>Payment Service · Sample</span>
            </div>
            {[
              ["Architecture", 92],
              ["Deployment", 88],
              ["Troubleshooting", 61],
              ["Edge cases", 42],
            ].map(([name, value]) => (
              <div className="kv-coverage-row" key={name}>
                <div>
                  <span>{name}</span>
                  <strong>{value}%</strong>
                </div>
                <div className="kv-track">
                  <span
                    style={{
                      width: `${value}%`,
                      background: Number(value) < 50 ? "#b48450" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="kv-coverage-owner">
              <Users size={17} />
              <div>
                <strong>One owner holds 84% of the context</strong>
                <p>Rahul Sharma · Payment Service</p>
              </div>
            </div>
            <a className="kv-gap-alert" href="#interview">
              <span>3 critical gaps to address</span>
              <ArrowRight size={16} />
            </a>
          </div>
          <div>
            <span id="risk" className="kv-anchor" />
            <Heading
              number="02"
              label="SEE WHAT’S AT RISK"
              title="Know the gaps before they become incidents."
            >
              See what is documented, what is getting stale, and what only one
              person knows. Use coverage and ownership together to decide what
              needs attention first.
            </Heading>
            <p className="kv-inline-note">
              A missing runbook and a single-owner workflow need different
              conversations. Start with the context that puts continuity at
              risk.
            </p>
          </div>
        </section>
        <section className="kv-section kv-interview-section" id="interview">
          <div className="kv-container" data-reveal>
            <span id="exit-mode" className="kv-anchor" />
            <Heading
              number="03"
              label="PRESERVE THE EXPERIENCE"
              title="Don’t ask people to document everything. Ask what matters."
            >
              Turn a real knowledge gap into a focused interview. Capture the
              reasoning, review the result, and give the next engineer a useful
              handover when someone leaves or changes teams.
            </Heading>
            <InterviewDemo />
          </div>
        </section>
        <section className="kv-section kv-container" id="retrieve" data-reveal>
          <span id="trust" className="kv-anchor" />
          <Heading
            number="04"
            label="ANSWERS WITH EVIDENCE"
            title="When the expert is gone, the answer is still there."
          >
            Ask about a procedure or incident. Inspect the original evidence,
            see who owns the knowledge, and check when it was verified before
            relying on the answer.
          </Heading>
          <AnswerDemo />
          <p className="kv-trust-strip">
            <ShieldCheck size={17} />
            <span>Human verification</span>
            <span>Original evidence</span>
            <span>Role-based workspace access</span>
          </p>
        </section>
        <section className="kv-final kv-container" data-reveal>
          <KnowledgeVaultLogo size={40} />
          <p className="kv-eyebrow">EXPERIENCE SHOULD OUTLAST EMPLOYMENT</p>
          <h2>
            Keep what makes
            <br />
            your organization work.
          </h2>
          <p>
            Less knowledge held by one person. A clearer starting point for
            everyone.
          </p>
          <CTA href="/login">Explore the workspace</CTA>
        </section>
      </main>
      <footer className="kv-footer kv-container">
        <Link className="kv-brand" href="/">
          <KnowledgeVaultLogo size={22} />
          KnowledgeVault.
        </Link>
        <span>Organizational memory, made trustworthy.</span>
        <div>
          <a href="#memory">Product</a>
          <a href="#retrieve">Evidence & trust</a>
          <Link href="/login">
            Sign in <ArrowUpRight size={13} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
