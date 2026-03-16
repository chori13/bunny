// 한국투자증권 OpenAPI
const KIS_BASE_URL = process.env.KIS_BASE_URL || "https://openapi.koreainvestment.com:9443";
const KIS_APP_KEY = process.env.KIS_APP_KEY || "";
const KIS_APP_SECRET = process.env.KIS_APP_SECRET || "";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getToken(): Promise<string | null> {
  if (!KIS_APP_KEY || !KIS_APP_SECRET) return null;

  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  try {
    const res = await fetch(`${KIS_BASE_URL}/oauth2/tokenP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: KIS_APP_KEY,
        appsecret: KIS_APP_SECRET,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + 23 * 60 * 60 * 1000, // 23 hours
    };
    return cachedToken.token;
  } catch (error) {
    console.error("[KIS] Token error:", error);
    return null;
  }
}

function kisHeaders(token: string, trId: string) {
  return {
    "Content-Type": "application/json; charset=utf-8",
    authorization: `Bearer ${token}`,
    appkey: KIS_APP_KEY,
    appsecret: KIS_APP_SECRET,
    tr_id: trId,
  };
}

export async function getKisQuote(stockCode: string) {
  const token = await getToken();
  if (!token) return null;

  try {
    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: stockCode,
    });

    const res = await fetch(
      `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?${params}`,
      { headers: kisHeaders(token, "FHKST01010100") }
    );

    if (!res.ok) return null;
    const data = await res.json();
    const o = data.output;

    return {
      name: o.hts_kor_isnm || null,
      currentPrice: Number(o.stck_prpr) || null,
      previousClose: Number(o.stck_sdpr) || null,
      change: Number(o.prdy_vrss) || null,
      changePercent: Number(o.prdy_ctrt) || null,
      dayHigh: Number(o.stck_hgpr) || null,
      dayLow: Number(o.stck_lwpr) || null,
      week52High: Number(o.w52_hgpr) || null,
      week52Low: Number(o.w52_lwpr) || null,
      open: Number(o.stck_oprc) || null,
      volume: Number(o.acml_vol) || null,
      marketCap: Number(o.hts_avls) ? Number(o.hts_avls) * 100000000 : null,
      per: Number(o.per) || null,
      pbr: Number(o.pbr) || null,
      eps: Number(o.eps) || null,
    };
  } catch (error) {
    console.error("[KIS] Quote error:", error);
    return null;
  }
}

export async function getKisDaily(stockCode: string, period: string = "1y") {
  const token = await getToken();
  if (!token) return [];

  try {
    const now = new Date();
    const periodDays: Record<string, number> = {
      "1w": 7, "1m": 30, "3m": 90, "1y": 365, "5y": 1825,
    };
    const days = periodDays[period] || 365;
    const startDate = new Date(now.getTime() - days * 86400000);

    const fmt = (d: Date) =>
      `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;

    const params = new URLSearchParams({
      FID_COND_MRKT_DIV_CODE: "J",
      FID_INPUT_ISCD: stockCode,
      FID_INPUT_DATE_1: fmt(startDate),
      FID_INPUT_DATE_2: fmt(now),
      FID_PERIOD_DIV_CODE: "D",
      FID_ORG_ADJ_PRC: "0",
    });

    const res = await fetch(
      `${KIS_BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-daily-itemchartprice?${params}`,
      { headers: kisHeaders(token, "FHKST03010100") }
    );

    if (!res.ok) return [];
    const data = await res.json();

    return (data.output2 || [])
      .filter((d: Record<string, string>) => d.stck_bsop_date)
      .map((d: Record<string, string>) => {
        const dateStr = d.stck_bsop_date;
        return {
          time: `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`,
          open: Number(d.stck_oprc) || 0,
          high: Number(d.stck_hgpr) || 0,
          low: Number(d.stck_lwpr) || 0,
          close: Number(d.stck_clpr) || 0,
          volume: Number(d.acml_vol) || 0,
        };
      })
      .reverse();
  } catch (error) {
    console.error("[KIS] Daily error:", error);
    return [];
  }
}

export function isKoreanStock(symbol: string): boolean {
  return /^\d{6}$/.test(symbol);
}