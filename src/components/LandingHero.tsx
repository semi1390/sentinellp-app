import { useEffect, useRef } from "react";
import { ConnectButton } from "@rainbow-me/rainbowkit";

function useFadeIn() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add("visible"); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useFadeIn();
  return (
    <div ref={ref} className={`fade-in ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function FlowDiagram() {
  const steps = [
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="12" cy="7" r="4" stroke="#6366f1" strokeWidth="2"/>
        </svg>
      ),
      label: "Your Wallet",
      sub: "Any Ethereum wallet",
      color: "#6366f1",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#6366f1"/>
        </svg>
      ),
      label: "SentinelLP Agent",
      sub: "Monitors every 5 min",
      color: "#6366f1",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect width="24" height="24" rx="6" fill="#CC785C"/>
          <path d="M7 17l2.5-7 2.5 4 2.5-4L17 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: "Claude AI",
      sub: "Economic reasoning",
      color: "#CC785C",
      highlight: true,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#00D395"/>
          <path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: "KeeperHub",
      sub: "Gas-sponsored execution",
      color: "#00D395",
      highlight: true,
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <rect x="2" y="7" width="20" height="14" rx="2" stroke="#6366f1" strokeWidth="2"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#6366f1" strokeWidth="2"/>
        </svg>
      ),
      label: "Ethereum",
      sub: "Onchain confirmation",
      color: "#6366f1",
    },
    {
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0121.99 15l-.07 1.92z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      ),
      label: "You're Notified",
      sub: "Telegram + audit trail",
      color: "#6366f1",
    },
  ];

  return (
    <div className="hero-flow">
      <div className="hero-flow-card">
        <div className="hero-flow-title">How it executes</div>
        <div className="hero-flow-steps">
          {steps.map((step, i) => (
            <div key={i} className="hero-flow-step">
              <div className="hero-flow-step-left">
                <div className={`hero-flow-icon ${step.highlight ? "highlight" : ""}`}>
                  {step.icon}
                </div>
                {i < steps.length - 1 && <div className="hero-flow-line" />}
              </div>
              <div className="hero-flow-text">
                <div className="hero-flow-label">{step.label}</div>
                <div className="hero-flow-sub">{step.sub}</div>
              </div>
              {step.highlight && (
                <div className="hero-flow-badge">
                  {step.label === "Claude AI" ? "Decides" : "Executes"}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="hero-flow-footer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Gas sponsored · MEV protected · Non-custodial
        </div>
      </div>
    </div>
  );
}

export function LandingHero() {
  return (
    <div className="landing">

      {/* ---- HERO ---- */}
      <section className="hero-section">
        <div className="hero-inner">
          {/* Left — text */}
          <div className="hero-left">
            <FadeIn className="hero-badge-wrap">
              <div className="hero-badge">Autonomous Uniswap v3 LP Position Manager</div>
            </FadeIn>
            <FadeIn delay={80}>
              <h1 className="hero-title">
                Your Uniswap v3<br />
                positions,{" "}
                <span className="hero-highlight">autonomously<br />protected.</span>
              </h1>
            </FadeIn>
            <FadeIn delay={160}>
              <p className="hero-subtitle">
                SentinelLP monitors your LP positions 24/7. When a position drifts out of range,
                our AI agent rebalances it automatically — gas sponsored, MEV protected,
                with a full audit trail.
              </p>
            </FadeIn>
            <FadeIn delay={240} className="hero-cta-wrap">
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button className="btn-hero" onClick={openConnectModal}>
                    Get Started — Connect Wallet
                  </button>
                )}
              </ConnectButton.Custom>
              <p className="hero-terms">
                No private keys required · Non-custodial · 0.05% per rebalance
              </p>
            </FadeIn>
            <FadeIn delay={320} className="hero-powered-wrap">
              <div className="hero-powered">
                <span className="powered-label">Powered by</span>
                <div className="powered-items">
                  <div className="powered-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#00D395"/><path d="M8 12l3 3 5-6" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    KeeperHub
                  </div>
                  <div className="powered-dot" />
                  <div className="powered-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="6" fill="#CC785C"/><path d="M7 17l2.5-7 2.5 4 2.5-4L17 17" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    Claude AI
                  </div>
                  <div className="powered-dot" />
                  <div className="powered-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#375BD2"/><path d="M12 6v12M6 12h12" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
                    Chainlink
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right — flow diagram */}
          <FadeIn delay={200} className="hero-right">
            <FlowDiagram />
          </FadeIn>
        </div>
      </section>

      {/* ---- STATS BAR ---- */}
      <section className="stats-bar-section">
        <FadeIn>
          <div className="stats-bar">
            {[
              { value: "6", label: "Workflow steps per rebalance" },
              { value: "$0", label: "Gas from your wallet" },
              { value: "24/7", label: "Autonomous monitoring" },
              { value: "0.05%", label: "Fee per rebalance" },
              { value: "100%", label: "Non-custodial" },
            ].map((s, i) => (
              <div key={i} className="stats-bar-item">
                <div className="stats-bar-value">{s.value}</div>
                <div className="stats-bar-label">{s.label}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ---- HOW IT WORKS ---- */}
      <section className="section">
        <FadeIn>
          <div className="section-label">How it works</div>
          <h2 className="section-title">From out-of-range to earning fees<br />in under 60 seconds.</h2>
          <p className="section-subtitle">
            SentinelLP handles the full rebalance cycle automatically.
            You set it up once and never think about it again.
          </p>
        </FadeIn>

        <div className="steps-grid">
          {[
            {
              num: "01",
              title: "Connect & Register",
              desc: "Connect your wallet and register with SentinelLP. Free — no deposit required. Takes 2 minutes.",
              detail: "One transaction. No upfront cost.",
            },
            {
              num: "02",
              title: "Approve as Operator",
              desc: "Grant SentinelLP permission to manage your Uniswap v3 positions. Your tokens always return to your wallet.",
              detail: "One transaction. Revocable anytime.",
            },
            {
              num: "03",
              title: "Agent Monitors 24/7",
              desc: "Claude AI checks your positions every 5 minutes. When one drifts out of range, it reasons about whether to act.",
              detail: "Chainlink prices feed real economics",
            },
            {
              num: "04",
              title: "KeeperHub Executes",
              desc: "A 5-step workflow fires through KeeperHub — gas sponsored, MEV protected, with full audit trail.",
              detail: "decreaseLiquidity → collect → approve → mint",
            },
            {
              num: "05",
              title: "Tokens Return to You",
              desc: "Your rebalanced position opens at the optimal range. All tokens go directly back to your wallet.",
              detail: "We never hold your funds",
            },
          ].map((step, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div className="step-card">
                <div className="step-card-num">{step.num}</div>
                <h3 className="step-card-title">{step.title}</h3>
                <p className="step-card-desc">{step.desc}</p>
                <div className="step-card-detail">{step.detail}</div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---- FEATURES ---- */}
      <section className="section section-gray">
        <FadeIn>
          <div className="section-label">Features</div>
          <h2 className="section-title">Built on best-in-class infrastructure.</h2>
          <p className="section-subtitle">
            Every component is chosen for reliability, not novelty.
          </p>
        </FadeIn>

        <div className="features-grid">
          {[
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              tag: "Execution",
              title: "KeeperHub Workflows",
              desc: "Every rebalance is a 5-step workflow submitted to KeeperHub's execution layer. Gas is sponsored, transactions are MEV-protected via private mempool, and every step is logged with a transaction hash.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="#6366f1" strokeWidth="2"/>
                  <path d="M12 6v6l4 2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              ),
              tag: "AI Reasoning",
              title: "Claude AI Decision Engine",
              desc: "Claude Haiku analyzes your position's health, current price, gas costs, and daily fee loss — then decides whether to HOLD, WAIT, or REBALANCE. No hardcoded rules. Real economic reasoning.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3h18v18H3z" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round"/>
                  <path d="M3 9h18M9 21V9" stroke="#6366f1" strokeWidth="2"/>
                </svg>
              ),
              tag: "Price Feeds",
              title: "Chainlink Oracles",
              desc: "Real-time ETH/USD and USDC/USD prices from Chainlink. The agent uses live prices to calculate accurate position values, gas costs in USD, and daily fee loss estimates.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              tag: "Security",
              title: "Non-Custodial by Design",
              desc: "SentinelLP never holds your funds. The operator contract uses Uniswap's native setApprovalForAll — your tokens move directly from the pool back to your wallet. Revoke access anytime.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              tag: "Observability",
              title: "Full Audit Trail",
              desc: "Every decision the agent makes is logged — timestamp, reasoning, action, KeeperHub job ID, and transaction hash. Run npm run audit to see the complete history.",
            },
            {
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ),
              tag: "Performance",
              title: "Tick-Aware Rebalancing",
              desc: "Claude proposes new tick ranges snapped to the pool's tick spacing. The agent understands fee tiers — 0.05% pools use 10-tick spacing, 0.3% use 60, 1% use 200.",
            },
          ].map((f, i) => (
            <FadeIn key={i} delay={i * 60}>
              <div className="feature-card">
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-tag">{f.tag}</div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---- SOCIAL PROOF ---- */}
      <section className="section">
        <FadeIn>
          <div className="section-label">By the numbers</div>
          <h2 className="section-title">Built for serious LP managers.</h2>
        </FadeIn>
        <FadeIn delay={80}>
          <div className="proof-grid">
            {[
              { value: "5", label: "Onchain transactions", sub: "Per full rebalance cycle" },
              { value: "856k", label: "Gas units per rebalance", sub: "Fully sponsored by KeeperHub" },
              { value: "5 min", label: "Monitoring interval", sub: "Configurable down to 1 min" },
              { value: "< 60s", label: "Time to rebalance", sub: "From detection to confirmation" },
            ].map((p, i) => (
              <div key={i} className="proof-card">
                <div className="proof-value">{p.value}</div>
                <div className="proof-label">{p.label}</div>
                <div className="proof-sub">{p.sub}</div>
              </div>
            ))}
          </div>
        </FadeIn>
      </section>

      {/* ---- PRICING ---- */}
      <section className="section section-gray">
        <FadeIn>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple. Aligned with your success.</h2>
          <p className="section-subtitle">
            We only charge when we rebalance. No monthly fees, no subscriptions.
          </p>
        </FadeIn>
        <FadeIn delay={80}>
          <div className="pricing-card">
            <div className="pricing-left">
              <div className="pricing-name">Pay per rebalance</div>
              <div className="pricing-price">0.05% <span>per rebalance</span></div>
              <p className="pricing-desc">
                Charged only when SentinelLP rebalances your position.
                If it's not worth rebalancing, we don't charge.
              </p>
              <ConnectButton.Custom>
                {({ openConnectModal }) => (
                  <button className="btn-hero" onClick={openConnectModal} style={{ marginTop: 24 }}>
                    Start for free
                  </button>
                )}
              </ConnectButton.Custom>
            </div>
            <div className="pricing-right">
              {[
                "Unlimited positions monitored",
                "Gas sponsored on all rebalances",
                "MEV protection via private mempool",
                "Full KeeperHub audit trail",
                "Claude AI reasoning on every decision",
                "Chainlink real-time price feeds",
                "Non-custodial — revoke anytime",
                "Free to register — pay only on rebalance",
              ].map((item, i) => (
                <div key={i} className="pricing-feature">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ---- FAQ ---- */}
      <section className="section">
        <FadeIn>
          <div className="section-label">FAQ</div>
          <h2 className="section-title">Common questions.</h2>
        </FadeIn>
        <div className="faq-grid">
          {[
            {
              q: "Does SentinelLP hold my funds?",
              a: "Never. SentinelLP uses Uniswap's native operator approval (setApprovalForAll) which allows it to manage your positions without ever holding your tokens. All tokens go directly from the pool back to your wallet.",
            },
            {
              q: "How does gas sponsorship work?",
              a: "KeeperHub sponsors gas for rebalance transactions on Sepolia testnet. On mainnet, gas handling depends on your KeeperHub configuration. You never need ETH in your wallet specifically for gas.",
            },
            {
              q: "How does the AI decide when to rebalance?",
              a: "Claude compares the estimated daily fee loss from being out of range against the gas cost of rebalancing. If the economics justify it — it rebalances. Otherwise, it waits. All decisions are logged.",
            },
            {
              q: "Which Uniswap v3 pools are supported?",
              a: "SentinelLP supports all Uniswap v3 pools on Ethereum — any fee tier (0.05%, 0.3%, 1%) and any token pair. The tick spacing is automatically calculated per fee tier.",
            },
            {
              q: "Can I stop the agent?",
              a: "Yes, anytime. Click Deregister in the dashboard to stop monitoring. You can also revoke operator approval directly from Uniswap's interface.",
            },
            {
              q: "What network is this on?",
              a: "Currently on Ethereum Sepolia testnet for beta. Mainnet launch is targeted for the KeeperHub hackathon submission date (August 13, 2026).",
            },
          ].map((item, i) => (
            <FadeIn key={i} delay={i * 40}>
              <div className="faq-item">
                <h3 className="faq-q">{item.q}</h3>
                <p className="faq-a">{item.a}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      {/* ---- FOOTER CTA ---- */}
      <section className="section footer-cta-section">
        <FadeIn>
          <h2 className="footer-cta-title">
            Start protecting your positions today.
          </h2>
          <p className="footer-cta-sub">
            Connect your wallet and be up and running in under 5 minutes.
          </p>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <button className="btn-hero" onClick={openConnectModal}>
                Connect Wallet
              </button>
            )}
          </ConnectButton.Custom>
        </FadeIn>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#6366f1"/>
              </svg>
              <span>SentinelLP</span>
            </div>
            <p className="footer-tagline">Autonomous LP protection for serious DeFi participants.</p>
          </div>
          <div className="footer-links">
            <div className="footer-col">
              <div className="footer-col-title">Product</div>
              <a href="#">How it works</a>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Changelog</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Developers</div>
              <a href="https://github.com/semi1390/sentinellp" target="_blank" rel="noopener noreferrer">GitHub</a>
              <a href="https://github.com/semi1390/sentinellp-contracts" target="_blank" rel="noopener noreferrer">Smart Contract</a>
              <a href="https://docs.keeperhub.com" target="_blank" rel="noopener noreferrer">KeeperHub Docs</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Legal</div>
              <a href="#">Terms of Service</a>
              <a href="#">Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 SentinelLP. Built for the KeeperHub Agents Onchain Hackathon.</span>
          <div className="footer-powered">
            <span>Powered by KeeperHub · Claude AI · Chainlink</span>
          </div>
        </div>
      </footer>

    </div>
  );
}