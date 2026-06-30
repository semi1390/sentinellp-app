import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useEffect } from "react";
import {
  SENTINEL_OPERATOR_ADDRESS,
  POSITION_MANAGER_ADDRESS,
  OPERATOR_ABI,
  POSITION_MANAGER_ABI,
} from "../config";
import { PositionCard } from "./PositionCard";

export function Dashboard() {
  const { address } = useAccount();

  const { data: isRegistered, refetch: refetchRegistered } = useReadContract({
    address: SENTINEL_OPERATOR_ADDRESS,
    abi: OPERATOR_ABI,
    functionName: "registered",
    args: [address!],
  });

  const { data: deposit, refetch: refetchDeposit } = useReadContract({
    address: SENTINEL_OPERATOR_ADDRESS,
    abi: OPERATOR_ABI,
    functionName: "getUserDeposit",
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

  const { writeContract: register, data: registerHash } = useWriteContract();
  const { isSuccess: registerSuccess } = useWaitForTransactionReceipt({ hash: registerHash });

  const { writeContract: approveOperator, data: approveHash } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: deregister, data: deregisterHash } = useWriteContract();
  const { isSuccess: deregisterSuccess } = useWaitForTransactionReceipt({ hash: deregisterHash });

  useEffect(() => {
    if (registerSuccess || approveSuccess || deregisterSuccess) {
      refetchRegistered();
      refetchDeposit();
      refetchApproved();
    }
  }, [registerSuccess, approveSuccess, deregisterSuccess]);

  const handleRegister = () => {
    register({
      address: SENTINEL_OPERATOR_ADDRESS,
      abi: OPERATOR_ABI,
      functionName: "register",
      value: parseEther("0.005"),
    });
  };

  const handleApprove = () => {
    approveOperator({
      address: POSITION_MANAGER_ADDRESS,
      abi: POSITION_MANAGER_ABI,
      functionName: "setApprovalForAll",
      args: [SENTINEL_OPERATOR_ADDRESS, true],
    });
  };

  const handleDeregister = () => {
    deregister({
      address: SENTINEL_OPERATOR_ADDRESS,
      abi: OPERATOR_ABI,
      functionName: "deregister",
    });
  };

  const depositETH = deposit ? formatEther(deposit as bigint) : "0";
  const isFullyActive = isRegistered && isApproved;

  return (
    <div className="dashboard">

      {/* Status Banner */}
      <div className={`status-banner ${isFullyActive ? "active" : "inactive"}`}>
        <div className="status-left">
          <div className="status-dot">{isFullyActive ? "✅" : "⚠️"}</div>
          <div>
            <div className="status-title">
              {isFullyActive
                ? "Agent is actively monitoring"
                : "Complete setup to start protecting your positions"}
            </div>
            <div className="status-subtitle">
              {isFullyActive
                ? "SentinelLP is keeping your positions in range and optimizing fees."
                : "Register and approve SentinelLP to begin autonomous management."}
            </div>
          </div>
        </div>
        {isFullyActive && (
          <a className="status-action">View Activity →</a>
        )}
      </div>

      {/* Setup Steps */}
      <div className="setup-section">
        <h2>Setup Steps</h2>
        <div className="setup-grid">

          {/* Step 1 */}
          <div className={`setup-step-card ${isRegistered ? "done" : ""}`}>
            <div className="setup-step-header">
              <div className="step-number">1</div>
              <div>
                <div className="setup-step-title">Register & Deposit</div>
                <div className="setup-step-desc">
                  Register your vault and deposit ETH to start managing positions.
                </div>
              </div>
            </div>
            <div className="setup-step-footer">
              {isRegistered ? (
                <div className="status-pill completed">✅ Completed</div>
              ) : (
                <div className="status-pill pending">⏳ Pending</div>
              )}
              {isRegistered ? (
                <button className="btn-primary">View Details</button>
              ) : (
                <button className="btn-primary" onClick={handleRegister}>
                  Register (0.005 ETH)
                </button>
              )}
            </div>
          </div>

          {/* Step 2 */}
          <div className={`setup-step-card ${isApproved ? "done" : ""}`}>
            <div className="setup-step-header">
              <div className="step-number">2</div>
              <div>
                <div className="setup-step-title">Approve Operator</div>
                <div className="setup-step-desc">
                  Approve SentinelLP as operator to automate rebalances on your behalf.
                </div>
              </div>
            </div>
            <div className="setup-step-footer">
              {isApproved ? (
                <div className="status-pill completed">✅ Approved</div>
              ) : isRegistered ? (
                <div className="status-pill pending">⏳ Pending</div>
              ) : (
                <div className="status-pill locked">🔒 Locked</div>
              )}
              {isApproved ? (
                <button className="btn-primary">Manage Approval</button>
              ) : isRegistered ? (
                <button className="btn-primary" onClick={handleApprove}>
                  Approve Operator
                </button>
              ) : (
                <button className="btn-primary" style={{ opacity: 0.4 }} disabled>
                  Complete Step 1
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">LP Positions</div>
            <div className="stat-card-icon">🔷</div>
          </div>
          <div className="stat-card-value">{positionCount?.toString() ?? "0"}</div>
          <div className="stat-card-sub">Active positions</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">Total Rebalances</div>
            <div className="stat-card-icon">📈</div>
          </div>
          <div className="stat-card-value">{rebalanceCount?.toString() ?? "0"}</div>
          <div className="stat-card-sub">All time</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">ETH Deposit</div>
            <div className="stat-card-icon">⟠</div>
          </div>
          <div className="stat-card-value">{parseFloat(depositETH).toFixed(3)}</div>
          <div className="stat-card-sub">Available balance</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <div className="stat-card-label">Agent Status</div>
            <div className="stat-card-icon">{isFullyActive ? "✅" : "⚪"}</div>
          </div>
          <div className={`stat-card-value ${isFullyActive ? "green" : ""}`}>
            {isFullyActive ? "Active" : "Inactive"}
          </div>
          <div className="stat-card-sub">{isFullyActive ? "Monitoring 24/7" : "Setup required"}</div>
        </div>
      </div>

      {/* Positions */}
      <div className="positions-header">
        <h2>Your LP Positions</h2>
        <a
          href="https://app.uniswap.org/positions"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-add"
        >
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
              isProtected={isFullyActive ?? false}
            />
          ))}
        </div>
      ) : (
        <div className="no-positions">
          <p>No Uniswap v3 positions found on this wallet.</p>
          <a
            href="https://app.uniswap.org/positions"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
          >
            Open a Position on Uniswap →
          </a>
        </div>
      )}

      {/* Danger Zone */}
      {isRegistered && (
        <div className="danger-zone">
          <div className="danger-zone-text">
            <h3>Danger Zone</h3>
            <p>Deregistering will stop all automations and need to be done before withdrawing all funds.</p>
          </div>
          <button className="btn-danger" onClick={handleDeregister}>
            Deregister & Stop Agent
          </button>
        </div>
      )}

      <div className="contract-info">
        Contract:{" "}
        <a
          href={`https://sepolia.etherscan.io/address/${SENTINEL_OPERATOR_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {SENTINEL_OPERATOR_ADDRESS.slice(0, 6)}...{SENTINEL_OPERATOR_ADDRESS.slice(-4)}
        </a>
      </div>
    </div>
  );
}