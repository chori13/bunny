/* eslint-disable @typescript-eslint/no-explicit-any */
import yahooFinance from "yahoo-finance2";

export async function getYahooQuote(symbol: string) {
  try {
    const quote: any = await yahooFinance.quote(symbol);
    return {
      name: quote.shortName || quote.longName || symbol,
      exchange: quote.fullExchangeName || quote.exchange || "",
      currency: quote.currency || "USD",
      currentPrice: quote.regularMarketPrice ?? null,
      previousClose: quote.regularMarketPreviousClose ?? null,
      change: quote.regularMarketChange ?? null,
      changePercent: quote.regularMarketChangePercent ?? null,
      dayHigh: quote.regularMarketDayHigh ?? null,
      dayLow: quote.regularMarketDayLow ?? null,
      week52High: quote.fiftyTwoWeekHigh ?? null,
      week52Low: quote.fiftyTwoWeekLow ?? null,
      open: quote.regularMarketOpen ?? null,
      volume: quote.regularMarketVolume ?? null,
      avgVolume: quote.averageDailyVolume3Month ?? null,
      marketCap: quote.marketCap ?? null,
      per: quote.trailingPE ?? null,
      pbr: quote.priceToBook ?? null,
      eps: quote.epsTrailingTwelveMonths ?? null,
      beta: quote.beta ?? null,
    };
  } catch (error) {
    console.error("[Yahoo] Quote error:", error);
    return null;
  }
}

export async function getYahooProfile(symbol: string) {
  try {
    const result: any = await yahooFinance.quoteSummary(symbol, {
      modules: ["assetProfile", "financialData"],
    });
    const profile = result.assetProfile;
    const financial = result.financialData;
    return {
      sector: profile?.sector || null,
      industry: profile?.industry || null,
      description: profile?.longBusinessSummary || null,
      website: profile?.website || null,
      employees: profile?.fullTimeEmployees || null,
      roe: financial?.returnOnEquity ?? null,
    };
  } catch (error) {
    console.error("[Yahoo] Profile error:", error);
    return null;
  }
}

export async function getYahooFinancials(symbol: string) {
  try {
    const result: any = await yahooFinance.quoteSummary(symbol, {
      modules: ["incomeStatementHistory", "balanceSheetHistory"],
    });

    const income = result.incomeStatementHistory?.incomeStatementHistory || [];
    const balance = result.balanceSheetHistory?.balanceSheetHistory || [];

    const revenue = income.map((s: any) => ({
      year: new Date(s.endDate).getFullYear().toString(),
      value: Number(s.totalRevenue) || 0,
    })).reverse();

    const operatingIncome = income.map((s: any) => ({
      year: new Date(s.endDate).getFullYear().toString(),
      value: Number(s.operatingIncome) || 0,
    })).reverse();

    const netIncome = income.map((s: any) => ({
      year: new Date(s.endDate).getFullYear().toString(),
      value: Number(s.netIncome) || 0,
    })).reverse();

    const totalAssets = balance.map((s: any) => ({
      year: new Date(s.endDate).getFullYear().toString(),
      value: Number(s.totalAssets) || 0,
    })).reverse();

    return { revenue, operatingIncome, netIncome, totalAssets };
  } catch (error) {
    console.error("[Yahoo] Financials error:", error);
    return null;
  }
}

export async function getYahooHistorical(symbol: string, period: string = "1y") {
  try {
    const periodMap: Record<string, { period1: Date; interval: "1d" | "1wk" | "1mo" }> = {
      "1w": { period1: new Date(Date.now() - 7 * 86400000), interval: "1d" },
      "1m": { period1: new Date(Date.now() - 30 * 86400000), interval: "1d" },
      "3m": { period1: new Date(Date.now() - 90 * 86400000), interval: "1d" },
      "1y": { period1: new Date(Date.now() - 365 * 86400000), interval: "1d" },
      "5y": { period1: new Date(Date.now() - 5 * 365 * 86400000), interval: "1wk" },
    };

    const config = periodMap[period] || periodMap["1y"];
    const result: any = await yahooFinance.chart(symbol, {
      period1: config.period1,
      interval: config.interval,
    });

    return (result.quotes || []).map((q: any) => ({
      time: new Date(q.date).toISOString().split("T")[0],
      open: q.open ?? 0,
      high: q.high ?? 0,
      low: q.low ?? 0,
      close: q.close ?? 0,
      volume: q.volume ?? 0,
    }));
  } catch (error) {
    console.error("[Yahoo] Historical error:", error);
    return [];
  }
}

export async function searchYahoo(query: string) {
  try {
    const result: any = await yahooFinance.search(query);
    return (result.quotes || [])
      .filter((q: any) => q.quoteType === "EQUITY")
      .slice(0, 10)
      .map((q: any) => ({
        symbol: q.symbol,
        name: q.shortname || q.longname || q.symbol,
        exchange: q.exchange || "",
        type: q.quoteType || "EQUITY",
      }));
  } catch (error) {
    console.error("[Yahoo] Search error:", error);
    return [];
  }
}