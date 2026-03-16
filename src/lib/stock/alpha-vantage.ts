// Alpha Vantage API
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "";
const BASE_URL = "https://www.alphavantage.co/query";

async function avFetch(params: Record<string, string>) {
  if (!API_KEY) return null;

  const url = new URL(BASE_URL);
  url.searchParams.set("apikey", API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = await res.json();
    // Alpha Vantage returns error messages in response body
    if (data["Error Message"] || data["Note"]) {
      console.warn("[AlphaVantage] API limit or error:", data["Note"] || data["Error Message"]);
      return null;
    }
    return data;
  } catch (error) {
    console.error("[AlphaVantage] Fetch error:", error);
    return null;
  }
}

export async function getAVOverview(symbol: string) {
  const data = await avFetch({ function: "OVERVIEW", symbol });
  if (!data || !data.Symbol) return null;

  return {
    name: data.Name || null,
    description: data.Description || null,
    exchange: data.Exchange || null,
    currency: data.Currency || null,
    sector: data.Sector || null,
    industry: data.Industry || null,
    marketCap: Number(data.MarketCapitalization) || null,
    per: Number(data.PERatio) || null,
    pbr: Number(data.PriceToBookRatio) || null,
    eps: Number(data.EPS) || null,
    roe: data.ReturnOnEquityTTM ? Number(data.ReturnOnEquityTTM) : null,
    dividendYield: data.DividendYield ? Number(data.DividendYield) : null,
    beta: Number(data.Beta) || null,
    week52High: Number(data["52WeekHigh"]) || null,
    week52Low: Number(data["52WeekLow"]) || null,
    employees: Number(data.FullTimeEmployees) || null,

    // Financials from overview
    revenueTTM: Number(data.RevenueTTM) || null,
    grossProfitTTM: Number(data.GrossProfitTTM) || null,
    operatingMarginTTM: Number(data.OperatingMarginTTM) || null,
    profitMargin: Number(data.ProfitMargin) || null,
  };
}

export async function getAVTimeSeries(symbol: string) {
  const data = await avFetch({
    function: "TIME_SERIES_DAILY",
    symbol,
    outputsize: "compact", // last 100 data points
  });

  if (!data || !data["Time Series (Daily)"]) return [];

  const series = data["Time Series (Daily)"];
  return Object.entries(series)
    .map(([date, values]) => {
      const v = values as Record<string, string>;
      return {
        time: date,
        open: Number(v["1. open"]) || 0,
        high: Number(v["2. high"]) || 0,
        low: Number(v["3. low"]) || 0,
        close: Number(v["4. close"]) || 0,
        volume: Number(v["5. volume"]) || 0,
      };
    })
    .reverse();
}

export async function getAVNews(symbol: string) {
  const data = await avFetch({
    function: "NEWS_SENTIMENT",
    tickers: symbol,
    limit: "10",
  });

  if (!data || !data.feed) return [];

  return (data.feed as Record<string, unknown>[]).slice(0, 10).map((item) => ({
    title: (item.title as string) || "",
    url: (item.url as string) || "",
    source: (item.source as string) || "",
    publishedAt: (item.time_published as string) || "",
    sentiment: item.overall_sentiment_score ? Number(item.overall_sentiment_score) : undefined,
  }));
}