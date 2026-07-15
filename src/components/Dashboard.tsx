import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useEffect, useState, useCallback } from "react";
import {
  SENTINEL_OPERATOR_ADDRESS,
  POSITION_MANAGER_ADDRESS,
  OPERATOR_ABI,
  POSITION_MANAGER_ABI,
} from "../config";
import { PositionCard } from "./PositionCard";
import { OnboardingWizard } from "./OnboardingWizard";

export function Dashboard() {
  const { address } = useAccount();
  const [wizardDismissed, setWizardDismissed] = useState(false);
  const [activePositionCount, setActivePositionCount] = useState(0);

  const { data: isRegistered, refetch: refetchRegistered } = useReadContract({
    address: SENTINEL_OPERATOR_ADDRESS,
    abi: OPERATOR_ABI,
    functionName: "registered",
    args: [address!],
  });

  const { data: isApproved, refetch: refetchApproved } = useReadContract({
    address: POSITION_MANAGER_ADDRESS,
    abi: POSITION_MANAGER_ABI,
    functionName: "isApprovedForAll",
    args: [address!, SENTINEL_OPERATOR_ADDRESS],
  });

  const { data: rebalanceCount } = useReadContract({
    address: SENTINEL_OPERATOR_ADDRESS,
    abi: OPERATOR_ABI,
    functionName: "getRebalanceCount",
  });

  const { data: positionCount } = useReadContract({
    address: POSITION_MANAGER_ADDRESS,
    abi: POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: [address!],
  });

  const { writeContract: deregister, data: deregisterHash } = useWriteContract();
  const { isSuccess: deregisterSuccess } = useWaitForTransactionReceipt({ hash: deregisterHash });

  useEffect(() => {
    if (deregisterSuccess) {
      refetchRegistered();
      refetchApproved();
    }
  }, [deregisterSuccess]);

  // Reset count when positionCount changes (e.g. new position opened)
  useEffect(() => {
    setActivePositionCount(0);
  }, [positionCount]);

  const handleActivePosition = useCallback(() => {
    setActivePositionCount(c => c + 1);
  }, []);

  const isFullyActive = !!isRegistered && !!isApproved;
  const showWizard = !isFullyActive && !wizardDismissed;

  const handleDeregister = () => {
    deregister({
      address: SENTINEL_OPERATOR_ADDRESS,
      abi: OPERATOR_ABI,
      functionName: "deregister",
    });
  };

  if (showWizard) {
    return (
      <div className="dashboard">
        <div className="wizard-page-header">
          <div>
            <h1 className="wizard-page-title">Get Started</h1>
            <p className="wizard-page-sub">Complete setup to start protecting your Uniswap v3 positions.</p>
          </div>
          <button className="btn-wizard-skip" onClick={() => setWizardDismissed(true)}>
            Skip setup →
          </button>
        </div>
        <OnboardingWizard onComplete={() => setWizardDismissed(true)} />
      </div>
    );
  }

  return (
    <div className="dashboard">

      {/* Status Banner */}
      <div className={`status-banner ${isFullyActive ? "active" : "inactive"}`}>
        <div className="status-left">
          <div className="status-dot">
            {isFullyActive ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div>
            <div className="status-title">
              {isFullyActive
                ? "Agent is actively monitoring your positions"
                : "Setup incomplete — complete onboarding to start protection"}
            </div>
            <div className="status-subtitle">
              {isFullyActive
                ? "SentinelLP checks every 5 minutes. You'll be notified on rebalance."
                : "Your positions are not yet protected."}
            </div>
          </div>
        </div>
        {!isFullyActive && (
          <button className="btn-wizard-primary" onClick={() => setWizardDismissed(false)} style={{ whiteSpace: "nowrap" }}>
            Complete Setup →
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">LP Positions</div>
          </div>
          <div className="stat-card-value">{activePositionCount}</div>
          <div className="stat-card-sub">Active positions</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">Total Rebalances</div>
          </div>
          <div className="stat-card-value">{rebalanceCount?.toString() ?? "0"}</div>
          <div className="stat-card-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">Fee Per Rebalance</div>
          </div>
          <div className="stat-card-value">0.05%</div>
          <div className="stat-card-sub">Charged at execution</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">Agent Status</div>
          </div>
          <div className={`stat-card-value ${isFullyActive ? "green" : ""}`}>
            {isFullyActive ? "Active" : "Inactive"}
          </div>
          <div className="stat-card-sub">
            {isFullyActive ? "Monitoring 24/7" : "Setup required"}
          </div>
        </div>
      </div>

      {/* Positions */}
      <div className="positions-header">
        <h2>Your LP Positions</h2>
        <a href="https://app.uniswap.org/positions" target="_blank" rel="noopener noreferrer" className="btn-add">
          + Add Position
        </a>
      </div>

      {positionCount && positionCount > 0n ? (
        <div className="positions-grid">
          {Array.from({ length: Number(positionCount) }, (_, i) => (
            <PositionCard
              key={i}
              index={i}
              owner={address!}
              isProtected={isFullyActive}
              onActive={handleActivePosition}
            />
          ))}
        </div>
      ) : (
        <div className="no-positions">
          <p>No Uniswap v3 positions found on this wallet.</p>
          <a href="https://app.uniswap.org/positions" target="_blank" rel="noopener noreferrer" className="btn-secondary">
            Open a Position on Uniswap →
          </a>
        </div>
      )}

      {/* Danger Zone */}
      {isRegistered && (
        <div className="danger-zone">
          <div className="danger-zone-text">
            <h3>Danger Zone</h3>
            <p>Deregistering will stop monitoring your positions immediately.</p>
          </div>
          <button className="btn-danger" onClick={handleDeregister}>
            Deregister & Stop Agent
          </button>
        </div>
      )}

      <div className="contract-info">
        Contract:{" "}
        <a href={`https://etherscan.io/address/${SENTINEL_OPERATOR_ADDRESS}`} target="_blank" rel="noopener noreferrer">
          {SENTINEL_OPERATOR_ADDRESS.slice(0, 6)}...{SENTINEL_OPERATOR_ADDRESS.slice(-4)}
        </a>
      </div>
    </div>
  );
}