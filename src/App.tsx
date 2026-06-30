import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Dashboard } from "./components/Dashboard";
import { LandingHero } from "./components/LandingHero";

export default function App() {
  const { isConnected } = useAccount();

  return (
    <div className="app">
      {isConnected ? (
        <>
          <nav className="dash-navbar">
            <div className="dash-nav-left">
              <div className="nav-brand">
                <span className="shield">🛡️</span>
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
              <span className="shield">🛡️</span>
              <span className="brand-name">Sentinel<span>LP</span></span>
            </div>
            <div className="nav-links">
              <a href="#">How it works</a>
              <a href="#">Features</a>
              <a href="#">Fees</a>
              <a href="#">Docs</a>
            </div>
            <ConnectButton label="Connect Wallet" />
          </nav>
          <LandingHero />
        </>
      )}
    </div>
  );
}