export interface UnifiedStockData {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
  market: "KR" | "US" | "OTHER";

  // Price
  currentPrice: number | null;
  previousClose: number | null;
  change: number | null;
  changePercent: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  week52High: number | null;
  week52Low: number | null;
  open: number | null;
  volume: number | null;
  avgVolume: number | null;

  // Company Overview
  sector: string | null;
  industry: string | null;
  description: string | null;
  website: string | null;
  marketCap: number | null;
  employees: number | null;

  // Investment Metrics
  per: number | null;
  pbr: number | null;
  eps: number | null;
  roe: number | null;
  dividendYield: number | null;
  beta: number | null;

  // Financial Statements
  financials: {
    revenue: { year: string; value: number }[];
    operatingIncome: { year: string; value: number }[];
    netIncome: { year: string; value: number }[];
    totalAssets: { year: string; value: number }[];
  };

  // Chart Data (OHLCV)
  candles: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];

  // News
  news: {
    title: string;
    url: string;
    source: string;
    publishedAt: string;
    sentiment?: number;
  }[];

  // Data source metadata
  sources: string[];
  fetchedAt: string;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}