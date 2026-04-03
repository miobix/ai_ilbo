"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getNextPath = () => {
    if (typeof window === "undefined") return "/chart";
    const params = new URLSearchParams(window.location.search);
    const next = params.get("next") || "/chart";

    // 내부 시스템 경로/비정상 경로는 로그인 후 이동 대상에서 제외
    if (!next.startsWith("/")) return "/chart";
    if (
      next.startsWith("/_next") ||
      next.startsWith("/api/") ||
      next.startsWith("/.well-known")
    ) {
      return "/chart";
    }

    return next;
  };

  useEffect(() => {
    // idle 세션 만료 안내
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("reason") === "idle") {
        setMessage("30분간 활동이 없어 자동 로그아웃되었습니다.");
      }
    }
    const check = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) router.replace("/chart");
      } catch {
        // ignore
      }
    };
    check();
  }, [router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const next = getNextPath();
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, pw }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMessage(data?.message || "로그인에 실패했습니다.");
        return;
      }
      router.replace(next);
    } catch {
      setMessage("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <h1 style={{ margin: 0, fontSize: 20, color: "#111827" }}>관리자 로그인</h1>
        <p style={{ margin: "6px 0 16px", fontSize: 12, color: "#6b7280" }}>
          로그인 후 1시간 동안 세션이 유지됩니다.
        </p>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
            autoComplete="username"
            style={{
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "0 12px",
              fontSize: 14,
            }}
          />
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="비밀번호"
            autoComplete="current-password"
            style={{
              height: 40,
              border: "1px solid #d1d5db",
              borderRadius: 8,
              padding: "0 12px",
              fontSize: 14,
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              height: 42,
              border: 0,
              borderRadius: 8,
              background: loading ? "#93c5fd" : "#2563eb",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "default" : "pointer",
            }}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        {message ? (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "#dc2626" }}>{message}</p>
        ) : null}
      </div>
    </main>
  );
}
