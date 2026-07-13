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
  // Sepolia
  "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238": "USDC",
  "0xfff9976782d46cc05630d1f6ebab18b2324d6b14": "WETH",
  // Mainnet
  "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2": "WETH",
  "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48": "USDC",
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
};

const TOKEN_COLORS: Record<string, string> = {
  USDC: "#2775CA",
  USDT: "#26A17B",
  WETH: "#627EEA",
  ETH:  "#627EEA",
  WBTC: "#F7931A",
  DAI:  "#F5AC37",
};

/**
 * Convert a Uniswap v3 tick to a price, with decimal adjustment.
 * Uniswap stores price as token1/token0 in raw token units.
 * For WETH(18 decimals)/USDT(6 decimals): adjust by 10^(18-6) = 10^12
 */
function tickToPrice(tick: number, decimals0: number, decimals1: number): number {
  const rawPrice = Math.pow(1.0001, tick);
  return rawPrice * Math.pow(10, decimals0 - decimals1);
}

const TOKEN_DECIMALS: Record<string, number> = {
  WETH: 18, ETH: 18,
  USDC: 6, USDT: 6,
  DAI: 18, WBTC: 8,
};

/**
 * Get display prices for the tick range.
 */
function getDisplayPrices(
  tickLower: number,
  tickUpper: number,
  sym0: string,
  sym1: string
): { lower: string; upper: string } {
  const dec0 = TOKEN_DECIMALS[sym0] ?? 18;
  const dec1 = TOKEN_DECIMALS[sym1] ?? 18;

  const isEthPair =
    (sym0 === "WETH" && (sym1 === "USDC" || sym1 === "USDT" || sym1 === "DAI")) ||
    (sym1 === "WETH" && (sym0 === "USDC" || sym0 === "USDT" || sym0 === "DAI"));

  const priceLower = tickToPrice(tickLower, dec0, dec1);
  const priceUpper = tickToPrice(tickUpper, dec0, dec1);

  if (isEthPair && sym0 === "WETH") {
    // Invert to get USD per ETH
    return {
      lower: formatPrice(1 / priceUpper),
      upper: formatPrice(1 / priceLower),
    };
  }

  if (isEthPair && sym1 === "WETH") {
    return {
      lower: formatPrice(priceLower),
      upper: formatPrice(priceUpper),
    };
  }

  return {
    lower: formatPrice(priceLower),
    upper: formatPrice(priceUpper),
  };
}

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
  const color0 = TOKEN_COLORS[sym0] ?? "#6366f1";
  const color1 = TOKEN_COLORS[sym1] ?? "#6366f1";

  const { lower: priceLower, upper: priceUpper } = getDisplayPrices(
    tickLower, tickUpper, sym0, sym1
  );

  // Uniswap v3 position URL
  const uniswapUrl = `https://app.uniswap.org/positions/v3/ethereum/${tokenId}`;

  return (
    <div className="position-card">
      <div className="position-header">
        <div className="position-pair">
          <div className="token-icons">
            <div className="token-icon" style={{ background: color0 + "22", color: color0, fontWeight: 700, fontSize: 11 }}>
              {sym0.slice(0, 1)}
            </div>
            <div className="token-icon" style={{ background: color1 + "22", color: color1, fontWeight: 700, fontSize: 11 }}>
              {sym1.slice(0, 1)}
            </div>
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
          <span className="position-row-label">Price Range</span>
          <span className="position-row-value">{priceLower} — {priceUpper}</span>
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
          href={uniswapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-view"
        >
          View on Uniswap →
        </a>
      </div>
    </div>
  );
}