import type { UnifiedStockData } from "@/types/stock";
import { getYahooQuote, getYahooProfile, getYahooFinancials, getYahooHistorical } from "./yahoo";
import { getKisQuote, getKisDaily, isKoreanStock } from "./kis";
import { getAVOverview, getAVTimeSeries, getAVNews } from "./alpha-vantage";

function pick<T>(primary: T | null | undefined, ...fallbacks: (T | null | undefined)[]): T | null {
  if (primary !== null && primary !== undefined) return primary;
  for (const fb of fallbacks) {
    if (fb !== null && fb !== undefined) return fb;
  }
  return null;
}

export async function fetchUnifiedStockData(
  symbol: string,
  period: string = "1y"
): Promise<UnifiedStockData> {
  const isKR = isKoreanStock(symbol);
  const yahooSymbol = isKR ? `${symbol}.KS` : symbol;

  // Fetch all sources in parallel
  const [yahooQuote, yahooProfile, yahooFinancials, yahooCandles, kisQuote, kisCandles, avOverview, avTimeSeries, avNews] =
    await Promise.all([
      getYahooQuote(yahooSymbol).catch(() => null),
      getYahooProfile(yahooSymbol).catch(() => null),
      getYahooFinancials(yahooSymbol).catch(() => null),
      getYahooHistorical(yahooSymbol, period).catch(() => []),
      isKR ? getKisQuote(symbol).catch(() => null) : Promise.resolve(null),
      isKR ? getKisDaily(symbol, period).catch(() => []) : Promise.resolve([]),
      getAVOverview(isKR ? symbol : symbol).catch(() => null),
      getAVTimeSeries(isKR ? symbol : symbol).catch(() => []),
      getAVNews(isKR ? symbol : symbol).catch(() => []),
    ]);

  const sources: string[] = [];
  if (yahooQuote) sources.push("yahoo");
  if (kisQuote) sources.push("kis");
  if (avOverview) sources.push("alphavantage");

  // Merge candles: prefer KIS for Korean stocks, Yahoo otherwise, AV as fallback
  let candles = yahooCandles || [];
  if (isKR && kisCandles && kisCandles.length > 0) {
    candles = kisCandles;
  } else if (candles.length === 0 && avTimeSeries && avTimeSeries.length > 0) {
    candles = avTimeSeries;
  }

  // Merge financials
  const financials = yahooFinancials || { revenue: [], operatingIncome: [], netIncome: [], totalAssets: [] };

  // For Korean stocks, KIS is primary price source; for global, Yahoo is primary
  const primaryQuote = isKR ? kisQuote : yahooQuote;
  const secondaryQuote = isKR ? yahooQuote : kisQuote;

  return {
    symbol,
    name: pick(primaryQuote?.name, secondaryQuote?.name, avOverview?.name) || symbol,
    exchange: pick(yahooQuote?.exchange, avOverview?.exchange) || (isKR ? "KRX" : ""),
    currency: pick(yahooQuote?.currency, avOverview?.currency) || (isKR ? "KRW" : "USD"),
    market: isKR ? "KR" : "US",

    currentPrice: pick(primaryQuote?.currentPrice, secondaryQuote?.currentPrice),
    previousClose: pick(primaryQuote?.previousClose, secondaryQuote?.previousClose),
    change: pick(primaryQuote?.change, secondaryQuote?.change),
    changePercent: pick(primaryQuote?.changePercent, secondaryQuote?.changePercent),
    dayHigh: pick(primaryQuote?.dayHigh, secondaryQuote?.dayHigh),
    dayLow: pick(primaryQuote?.dayLow, secondaryQuote?.dayLow),
    week52High: pick(primaryQuote?.week52High, secondaryQuote?.week52High, avOverview?.week52High),
    week52Low: pick(primaryQuote?.week52Low, secondaryQuote?.week52Low, avOverview?.week52Low),
    open: pick(primaryQuote?.open, secondaryQuote?.open),
    volume: pick(primaryQuote?.volume, secondaryQuote?.volume),
    avgVolume: pick(yahooQuote?.avgVolume),
    marketCap: pick(primaryQuote?.marketCap, secondaryQuote?.marketCap, avOverview?.marketCap),
    employees: pick(yahooProfile?.employees, avOverview?.employees),

    sector: pick(yahooProfile?.sector, avOverview?.sector),
    industry: pick(yahooProfile?.industry, avOverview?.industry),
    description: pick(yahooProfile?.description, avOverview?.description),
    website: pick(yahooProfile?.website),

    per: pick(primaryQuote?.per, secondaryQuote?.per, avOverview?.per),
    pbr: pick(primaryQuote?.pbr, secondaryQuote?.pbr, avOverview?.pbr),
    eps: pick(primaryQuote?.eps, secondaryQuote?.eps, avOverview?.eps),
    roe: pick(yahooProfile?.roe, avOverview?.roe),
    dividendYield: pick(avOverview?.dividendYield),
    beta: pick(yahooQuote?.beta, avOverview?.beta),

    financials,
    candles,
    news: avNews || [],

    sources,
    fetchedAt: new Date().toISOString(),
  };
}