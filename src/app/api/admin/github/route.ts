import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER;
const GITHUB_REPO = process.env.GITHUB_REPO;
const GITHUB_API = "https://api.github.com";

async function githubFetch(path: string) {
  const res = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3+json",
    },
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const errorBody = await res.text();
    console.error(`[GitHub API] ${res.status} - ${path} - ${errorBody}`);
    throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  }

  return res.json();
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!GITHUB_TOKEN || !GITHUB_OWNER || !GITHUB_REPO) {
      return NextResponse.json(
        { error: "GitHub 환경변수가 설정되지 않았습니다. GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO를 .env에 추가하세요." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "repo";

    switch (type) {
      case "repo": {
        const repo = await githubFetch(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}`);
        const languages = await githubFetch(`/repos/${GITHUB_OWNER}/${GITHUB_REPO}/languages`);
        return NextResponse.json({ repo, languages });
      }

      case "commits": {
        const page = searchParams.get("page") || "1";
        const commits = await githubFetch(
          `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/commits?per_page=15&page=${page}`
        );
        return NextResponse.json({ commits });
      }

      case "issues": {
        const state = searchParams.get("state") || "all";
        const page = searchParams.get("page") || "1";
        const issues = await githubFetch(
          `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?state=${state}&per_page=15&page=${page}&sort=updated`
        );
        return NextResponse.json({ issues });
      }

      case "pulls": {
        const state = searchParams.get("state") || "all";
        const page = searchParams.get("page") || "1";
        const pulls = await githubFetch(
          `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/pulls?state=${state}&per_page=15&page=${page}&sort=updated`
        );
        return NextResponse.json({ pulls });
      }

      case "branches": {
        const branches = await githubFetch(
          `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/branches?per_page=30`
        );
        return NextResponse.json({ branches });
      }

      case "actions": {
        const runs = await githubFetch(
          `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=15`
        );
        return NextResponse.json({ runs: runs.workflow_runs || [] });
      }

      case "contributors": {
        const contributors = await githubFetch(
          `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contributors?per_page=20`
        );
        return NextResponse.json({ contributors });
      }

      default:
        return NextResponse.json({ error: "Invalid type" }, { status: 400 });
    }
  } catch (error) {
    console.error("[GitHub API Error]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
