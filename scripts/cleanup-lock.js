const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const devDir = path.join(__dirname, "..", ".next", "dev");
const lockFile = path.join(devDir, "lock");

if (!fs.existsSync(lockFile)) {
  process.exit(0);
}

// 1차: 단순 삭제 시도
try {
  fs.unlinkSync(lockFile);
  console.log("[cleanup] lock 삭제 완료");
  process.exit(0);
} catch {
  console.log("[cleanup] lock이 잠겨 있음 - 이전 Next.js 프로세스 정리");
}

// 2차: wmic으로 next+bunny node.exe 프로세스 PID 조회 후 taskkill
try {
  const wmic = execSync(
    'wmic process where "name=\'node.exe\'" get processid,commandline /format:csv',
    { encoding: "utf-8", shell: "cmd.exe", stdio: ["pipe", "pipe", "pipe"] }
  );
  const lines = wmic.split(/\r?\n/).filter((l) => l.includes("next") && l.includes("bunny") && !l.includes("cleanup-lock"));
  for (const line of lines) {
    const match = line.match(/(\d+)\s*$/);
    if (match) {
      const pid = match[1];
      try {
        execSync(`taskkill /F /PID ${pid}`, { shell: "cmd.exe", stdio: "ignore" });
        console.log(`[cleanup] PID ${pid} 종료`);
      } catch {}
    }
  }
  if (lines.length > 0) {
    // 핸들 해제 대기
    execSync("ping -n 3 127.0.0.1 >nul", { shell: "cmd.exe", stdio: "ignore" });
  }
} catch (e) {
  console.warn("[cleanup] 프로세스 조회 실패:", e instanceof Error ? e.message : e);
}

// 3차: .next/dev 삭제
try {
  fs.rmSync(devDir, { recursive: true, force: true });
  console.log("[cleanup] .next/dev 삭제 완료");
} catch {
  console.warn("[cleanup] .next/dev 삭제 실패 - 무시하고 진행");
}
