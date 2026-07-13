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
  "0xdac17f958d2ee523a2206206994597c13d831ec7": "USDT",
  "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599": "WBTC",
  "0x6b175474e89094c44da98b954eedeac495271d0f": "DAI",
};

const TOKEN_LOGOS: Record<string, string> = {
  WETH: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png",
  USDC: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo.png",
  USDT: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo.png",
  DAI:  "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo.png",
  WBTC: "https://raw.githubusercontent.com/Uniswap/assets/master/blockchains/ethereum/assets/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo.png",
};

const TOKEN_DECIMALS: Record<string, number> = {
  WETH: 18, ETH: 18,
  USDC: 6, USDT: 6,
  DAI: 18, WBTC: 8,
};

function formatPrice(price: number): string {
  if (price >= 1000) return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  if (price >= 1) return `$${price.toFixed(2)}`;
  if (price >= 0.01) return `$${price.toFixed(4)}`;
  return `$${price.toExponential(2)}`;
}

function tickToPrice(tick: number, decimals0: number, decimals1: number): number {
  return Math.pow(1.0001, tick) * Math.pow(10, decimals0 - decimals1);
}

function getDisplayPrices(
  tickLower: number,
  tickUpper: number,
  sym0: string,
  sym1: string
): { lower: string; upper: string } {
  const dec0 = TOKEN_DECIMALS[sym0] ?? 18;
  const dec1 = TOKEN_DECIMALS[sym1] ?? 18;

  // price = token1 per token0 in human units
  const priceLower = tickToPrice(tickLower, dec0, dec1);
  const priceUpper = tickToPrice(tickUpper, dec0, dec1);

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
  const logo0 = TOKEN_LOGOS[sym0];
  const logo1 = TOKEN_LOGOS[sym1];

  const { lower: priceLower, upper: priceUpper } = getDisplayPrices(
    tickLower, tickUpper, sym0, sym1
  );

  const uniswapUrl = `https://app.uniswap.org/positions/v3/ethereum/${tokenId}`;

  return (
    <div className="position-card">
      <div className="position-header">
        <div className="position-pair">
          <div className="token-icons">
            <div className="token-icon" style={{ background: "#f1f5f9", overflow: "hidden", padding: 0 }}>
              {logo0
                ? <img src={logo0} alt={sym0} width={26} height={26} style={{ borderRadius: "50%", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <span style={{ fontSize: 11, fontWeight: 700 }}>{sym0.slice(0, 1)}</span>
              }
            </div>
            <div className="token-icon" style={{ background: "#f1f5f9", overflow: "hidden", padding: 0 }}>
              {logo1
                ? <img src={logo1} alt={sym1} width={26} height={26} style={{ borderRadius: "50%", display: "block" }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                : <span style={{ fontSize: 11, fontWeight: 700 }}>{sym1.slice(0, 1)}</span>
              }
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