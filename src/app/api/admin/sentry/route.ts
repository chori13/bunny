import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN;
const SENTRY_ORG = process.env.SENTRY_ORG;
const SENTRY_PROJECT = process.env.SENTRY_PROJECT;
const SENTRY_BASE_URL = process.env.SENTRY_BASE_URL || "https://us.sentry.io/api/0";

async function sentryFetch(path: string) {
  const res = await fetch(`${SENTRY_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${SENTRY_AUTH_TOKEN}`,
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[Sentry API] ${res.status} ${res.statusText} - URL: ${SENTRY_BASE_URL}${path} - Body: ${errorBody}`);
    throw new Error(`Sentry API error: ${res.status} ${res.statusText} - ${errorBody}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!SENTRY_AUTH_TOKEN || !SENTRY_ORG || !SENTRY_PROJECT) {
      return NextResponse.json(
        { error: "Sentry 환경변수가 설정되지 않았습니다. SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT를 .env에 추가하세요." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "issues";

    switch (type) {
      case "issues": {
        const query = searchParams.get("query") || "is:unresolved";
        const cursor = searchParams.get("cursor") || "";
        const sort = searchParams.get("sort") || "date";
        const path = `/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/issues/?query=${encodeURIComponent(query)}&sort=${sort}&limit=20${cursor ? `&cursor=${cursor}` : ""}`;
        const issues = await sentryFetch(path);
        return NextResponse.json({ issues });
      }

      case "events": {
        const path = `/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/events/?limit=20`;
        const events = await sentryFetch(path);
        return NextResponse.json({ events });
      }

      case "releases": {
        const path = `/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/releases/?per_page=10`;
        const releases = await sentryFetch(path);
        return NextResponse.json({ releases });
      }

      case "stats": {
        const stat = searchParams.get("stat") || "received";
        const path = `/projects/${SENTRY_ORG}/${SENTRY_PROJECT}/stats/?stat=${stat}&resolution=1d&since=${Math.floor(Date.now() / 1000) - 30 * 86400}`;
        const stats = await sentryFetch(path);
        return NextResponse.json({ stats });
      }

      case "issue-detail": {
        const issueId = searchParams.get("issueId");
        if (!issueId) {
          return NextResponse.json({ error: "issueId 필요" }, { status: 400 });
        }
        const issue = await sentryFetch(`/issues/${issueId}/`);
        const events = await sentryFetch(`/issues/${issueId}/events/?limit=5`);
        return NextResponse.json({ issue, events });
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("[Sentry API Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
