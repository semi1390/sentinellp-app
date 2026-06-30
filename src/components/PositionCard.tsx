import { useReadContract } from "wagmi";
import { POSITION_MANAGER_ADDRESS, POSITION_MANAGER_ABI } from "../config";

interface Props {
  index: number;
  owner: `0x${string}`;
  isProtected: boolean;
}

const FEE_LABELS: Record<number, string> = {
  500: "0.05% fee tier",
  3000: "0.3% fee tier",
  10000: "1% fee tier",
};

const TOKEN_SYMBOLS: Record<string, string> = {
  "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238": "USDC",
  "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": "WETH",
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
};

const TOKEN_EMOJIS: Record<string, string> = {
  USDC: "💵", WETH: "⟠", ETH: "⟠", WBTC: "₿", DAI: "◈",
};

export function PositionCard({ index, owner, isProtected }: Props) {
  const { data: tokenId } = useReadContract({
    address: POSITION_MANAGER_ADDRESS,
    abi: POSITION_MANAGER_ABI,
    functionName: "tokenOfOwnerByIndex",
    args: [owner, BigInt(index)],
  });

  const { data: position } = useReadContract({
    address: POSITION_MANAGER_ADDRESS,
    abi: POSITION_MANAGER_ABI,
    functionName: "positions",
    args: tokenId ? [tokenId] : undefined,
    query: { enabled: !!tokenId },
  });

  if (!tokenId || !position) {
    return (
      <div className="position-card loading">
        <div className="loading-pulse" />
      </div>
    );
  }

const [, , token0, token1, fee, tickLower, tickUpper, liquidity] = position as unknown as [
  bigint, string, string, string, number, number, number, bigint, ...unknown[]
];

  const hasLiquidity = liquidity > 0n;
  const feeLabel = FEE_LABELS[fee] ?? `${fee / 10000}% fee tier`;

  const sym0 = TOKEN_SYMBOLS[token0.toLowerCase()] ?? token0.slice(0, 6) + "...";
  const sym1 = TOKEN_SYMBOLS[token1.toLowerCase()] ?? token1.slice(0, 6) + "...";
  const emoji0 = TOKEN_EMOJIS[sym0] ?? "🪙";
  const emoji1 = TOKEN_EMOJIS[sym1] ?? "🪙";

  return (
    <div className="position-card">
      <div className="position-header">
        <div className="position-pair">
          <div className="token-icons">
            <div className="token-icon">{emoji0}</div>
            <div className="token-icon">{emoji1}</div>
          </div>
          <span className="pair-name">{sym0} / {sym1}</span>
          <span className="fee-pill">{feeLabel}</span>
        </div>
        <span className={`badge ${isProtected ? "protected" : "unprotected"}`}>
          {isProtected ? "Protected" : "Unprotected"}
        </span>
      </div>

      <div className="position-rows">
        <div className="position-row">
          <span className="position-row-label">Tick Range</span>
          <span className="position-row-value">{tickLower} to {tickUpper}</span>
        </div>
        <div className="position-row">
          <span className="position-row-label">Liquidity</span>
          <span className={`position-row-value ${hasLiquidity ? "green" : ""}`}>
            {hasLiquidity ? "Active" : "Empty"}
          </span>
        </div>
        <div className="position-row">
          <span className="position-row-label">Status</span>
          <span className={`position-row-value ${hasLiquidity ? "green" : "red"}`}>
            {hasLiquidity ? "In Range" : "Out of Range"}
          </span>
        </div>
        <div className="position-row">
          <span className="position-row-label">Token ID</span>
          <span className="position-row-value">#{tokenId.toString()}</span>
        </div>
      </div>

      <div className="position-footer">
        <a
          href={`https://app.uniswap.org/positions/v3/ethereum_sepolia/${tokenId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-view"
        >
          View Details →
        </a>
      </div>
    </div>
  );
}