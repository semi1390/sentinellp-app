import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Dashboard } from "./components/Dashboard";
import { LandingHero } from "./components/LandingHero";

export default function App() {
  const { isConnected } = useAccount();

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="app">
      {isConnected ? (
        <>
          <nav className="dash-navbar">
            <div className="dash-nav-left">
              <div className="nav-brand">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#6366f1"/>
                </svg>
                <span className="brand-name">Sentinel<span>LP</span></span>
              </div>
              <div className="dash-nav-links">
                <a className="dash-nav-link active">Dashboard</a>
                <a className="dash-nav-link">Positions</a>
                <a className="dash-nav-link">Activity</a>
                <a className="dash-nav-link">Settings</a>
              </div>
            </div>
            <ConnectButton />
          </nav>
          <Dashboard />
        </>
      ) : (
        <>
          <nav className="navbar">
            <div className="nav-brand">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" fill="#6366f1"/>
              </svg>
              <span className="brand-name">Sentinel<span>LP</span></span>
            </div>
            <div className="nav-links">
              <a href="#how-it-works" onClick={(e) => { e.preventDefault(); scrollTo("how-it-works"); }}>How it works</a>
              <a href="#features" onClick={(e) => { e.preventDefault(); scrollTo("features"); }}>Features</a>
              <a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo("pricing"); }}>Fees</a>
              <a href="#faq" onClick={(e) => { e.preventDefault(); scrollTo("faq"); }}>FAQ</a>
            </div>
            <ConnectButton label="Connect Wallet" />
          </nav>
          <LandingHero />
        </>
      )}
    </div>
  );
}