// ============================================================
// SentinelLP — Onboarding Wizard
// ============================================================

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useEffect, useState } from "react";
import {
  SENTINEL_OPERATOR_ADDRESS,
  POSITION_MANAGER_ADDRESS,
  OPERATOR_ABI,
  POSITION_MANAGER_ABI,
} from "../config";

const TELEGRAM_BOT = "SentinelLP_bot";

const STEPS = [
  {
    number: 1,
    title: "Connect Wallet",
    description: "Connect your Ethereum wallet to get started.",
    detail: "Supports MetaMask, Coinbase, WalletConnect, and any EIP-1193 wallet.",
  },
  {
    number: 2,
    title: "Verify LP Position",
    description: "You need at least one Uniswap v3 position to protect.",
    detail: "Open a position on Uniswap, then come back and click Check Again.",
  },
  {
    number: 3,
    title: "Register Agent",
    description: "Register your wallet with SentinelLP. Free — no deposit required.",
    detail: "You only pay a small fee (0.05%) when we actually rebalance your position.",
  },
  {
    number: 4,
    title: "Approve Operator",
    description: "Grant SentinelLP permission to manage your Uniswap v3 positions.",
    detail: "Uses Uniswap's native operator system. Your tokens always return to YOUR wallet. Revoke anytime.",
  },
  {
    number: 5,
    title: "Connect Telegram",
    description: "Get notified when SentinelLP rebalances your position.",
    detail: "Optional but recommended. One tap to subscribe.",
  },
  {
    number: 6,
    title: "Agent Active",
    description: "You're protected. SentinelLP is now monitoring your positions 24/7.",
    detail: "The agent checks every 5 minutes. You'll hear from us when something happens.",
  },
];

interface OnboardingWizardProps {
  onComplete: () => void;
}

export function OnboardingWizard({ onComplete }: OnboardingWizardProps) {
  const { address } = useAccount();
  const [telegramClicked, setTelegramClicked] = useState(false);
  const [positionVerified, setPositionVerified] = useState(false);
  const [registeredLocally, setRegisteredLocally] = useState(false);
  const [approvedLocally, setApprovedLocally] = useState(false);

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

  const { data: positionCount, refetch: refetchPositions } = useReadContract({
    address: POSITION_MANAGER_ADDRESS,
    abi: POSITION_MANAGER_ABI,
    functionName: "balanceOf",
    args: [address!],
  });

  const { writeContract: register, data: registerHash, isPending: registerPending } = useWriteContract();
  const { isSuccess: registerSuccess, isLoading: registerWaiting } = useWaitForTransactionReceipt({ hash: registerHash });

  const { writeContract: approveOperator, data: approveHash, isPending: approvePending } = useWriteContract();
  const { isSuccess: approveSuccess, isLoading: approveWaiting } = useWaitForTransactionReceipt({ hash: approveHash });

  useEffect(() => {
    if (registerSuccess) {
      refetchRegistered();
      setRegisteredLocally(true);
    }
  }, [registerSuccess]);

  useEffect(() => {
    if (approveSuccess) {
      refetchApproved();
      setApprovedLocally(true);
    }
  }, [approveSuccess]);

  const hasWallet = !!address;
  const hasPosition = positionVerified || (positionCount !== undefined && positionCount > 0n);
  const registered = registeredLocally || !!isRegistered;
  const approved = approvedLocally || !!isApproved;

  // Auto-advance if contract already shows registered/approved
  useEffect(() => {
    if (isRegistered && !registeredLocally) setRegisteredLocally(true);
  }, [isRegistered, registeredLocally]);

  useEffect(() => {
    if (isApproved && !approvedLocally) setApprovedLocally(true);
  }, [isApproved, approvedLocally]);

  const currentStep = !hasWallet ? 1
    : !hasPosition ? 2
    : !registered ? 3
    : !approved ? 4
    : !telegramClicked ? 5
    : 6;

  const handleCheckPosition = () => {
    setPositionVerified(true);
    refetchPositions(); // fire in background, don't wait
  };

  const handleRegister = () => {
    register({
      address: SENTINEL_OPERATOR_ADDRESS,
      abi: OPERATOR_ABI,
      functionName: "register",
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

  const handleTelegram = () => {
    window.open(`https://t.me/${TELEGRAM_BOT}?start=${address}`, "_blank");
    setTimeout(() => setTelegramClicked(true), 1000);
  };

  return (
    <div className="wizard">
      <div className="wizard-header">
        <div className="wizard-progress-track">
          <div
            className="wizard-progress-fill"
            style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
          />
        </div>
        <div className="wizard-step-label">Step {Math.min(currentStep, 6)} of 6</div>
      </div>

      <div className="wizard-steps">
        {STEPS.map((step) => {
          const isDone = currentStep > step.number;
          const isActive = currentStep === step.number;
          const isLocked = currentStep < step.number;

          return (
            <div
              key={step.number}
              className={`wizard-step ${isDone ? "done" : ""} ${isActive ? "active" : ""} ${isLocked ? "locked" : ""}`}
            >
              <div className="wizard-step-left">
                <div className="wizard-step-circle">
                  {isDone ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M5 13l4 4L19 7" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                {step.number < 6 && <div className="wizard-step-line" />}
              </div>

              <div className="wizard-step-content">
                <div className="wizard-step-title">{step.title}</div>

                {(isActive || isDone) && (
                  <>
                    <div className="wizard-step-desc">{step.description}</div>
                    <div className="wizard-step-detail">{step.detail}</div>
                  </>
                )}

                {isActive && (
                  <div className="wizard-step-action">
                    {step.number === 2 && (
                      <div className="wizard-step-2-actions">
                        <a
                          href="https://app.uniswap.org/positions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-wizard-primary"
                        >
                          Open a Position on Uniswap →
                        </a>
                        <button
                          className="btn-wizard-secondary"
                          onClick={handleCheckPosition}
                        >
                          I've opened one — Check Again
                        </button>
                      </div>
                    )}

                    {step.number === 3 && (
                      <button
                        className="btn-wizard-primary"
                        onClick={handleRegister}
                        disabled={(registerPending || registerWaiting) && !registerSuccess}
                      >
                        {registerPending ? "Confirm in wallet..." :
                         registerWaiting && !registerSuccess ? "Registering..." :
                         "Register for Free"}
                      </button>
                    )}

                    {step.number === 4 && (
                      <button
                        className="btn-wizard-primary"
                        onClick={handleApprove}
                        disabled={approvePending || approveWaiting}
                      >
                        {approvePending ? "Confirm in wallet..." :
                         approveWaiting ? "Approving..." :
                         "Approve Operator"}
                      </button>
                    )}

                    {step.number === 5 && (
                      <div className="wizard-telegram">
                        <button className="btn-wizard-primary" onClick={handleTelegram}>
                          Open Telegram →
                        </button>
                        <button className="btn-wizard-skip" onClick={() => setTelegramClicked(true)}>
                          Skip for now
                        </button>
                      </div>
                    )}

                    {step.number === 6 && (
                      <button className="btn-wizard-primary" onClick={onComplete}>
                        View Dashboard →
                      </button>
                    )}
                  </div>
                )}

                {isDone && step.number !== 6 && (
                  <div className="wizard-step-done-label">Completed</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentStep === 6 && (
        <div className="wizard-timeline">
          <div className="wizard-timeline-title">What happens next</div>
          <div className="wizard-timeline-items">
            {[
              { time: "Now", label: "Monitoring starts", sub: "Agent checks your positions every 5 minutes" },
              { time: "If out of range", label: "AI evaluates", sub: "Compares daily fee loss vs gas cost" },
              { time: "When worth it", label: "KeeperHub executes", sub: "5-step rebalance, gas sponsored" },
              { time: "Right after", label: "You're notified", sub: "Telegram message with tx hash" },
            ].map((item, i) => (
              <div key={i} className="wizard-timeline-item">
                <div className="wizard-timeline-time">{item.time}</div>
                <div className="wizard-timeline-dot" />
                <div className="wizard-timeline-text">
                  <div className="wizard-timeline-label">{item.label}</div>
                  <div className="wizard-timeline-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}