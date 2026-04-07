"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const roleOptions = [
  { value: "journalist", label: "기자" },
  { value: "editor", label: "편집자" },
  { value: "manager", label: "부장" },
  { value: "developer", label: "개발자" },
  { value: "intern", label: "인턴" },
];

export default function ManageUserPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // Create user form
  const [createUsername, setCreateUsername] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createPasswordConfirm, setCreatePasswordConfirm] = useState("");
  const [createRealName, setCreateRealName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createRole, setCreateRole] = useState("journalist");

  // Edit user form
  const [editUsername, setEditUsername] = useState("");
  const [editCurrentPassword, setEditCurrentPassword] = useState("");
  const [editNewPassword, setEditNewPassword] = useState("");
  const [editNewPasswordConfirm, setEditNewPasswordConfirm] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRealName, setEditRealName] = useState("");

  // Error states
  const [createErrors, setCreateErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  // Prevent copy-paste on password inputs
  const handlePasswordPaste = (e) => {
    e.preventDefault();
  };

  // Validation functions
  const validateUsername = (username) => {
    if (!username || username.length <= 6) {
      return "사용자명은 7자 이상이어야 합니다.";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "비밀번호는 필수입니다.";
    if (password.length <= 8 || password.length > 20) {
      return "비밀번호는 9자 이상 20자 이하여야 합니다.";
    }
    if (!/\d/.test(password)) {
      return "비밀번호는 최소 1개의 숫자를 포함해야 합니다.";
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return "비밀번호는 최소 1개의 특수문자를 포함해야 합니다.";
    }
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return ""; // Optional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "올바른 이메일 형식을 입력하세요.";
    }
    return "";
  };

  const validateRealName = (name) => {
    if (!name) return ""; // Optional
    if (name.length > 30) {
      return "이름은 30자 이하여야 합니다.";
    }
    return "";
  };

  const validatePasswordMatch = (password, confirm) => {
    if (password && confirm && password !== confirm) {
      return "비밀번호가 일치하지 않습니다.";
    }
    return "";
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (!res.ok) {
          router.replace("/login?next=/manageUser");
          return;
        }
        const data = await res.json();
        setCurrentUser(data);

        // Fetch profile for non-admin users
        if (data.role !== "admin") {
          const profileRes = await fetch(`/api/auth/profile?username=${data.user}`);
          if (profileRes.ok) {
            const profile = await profileRes.json();
            setUserProfile(profile);
            setEditUsername(profile.username);
            setEditEmail(profile.email || "");
            setEditRealName(profile.real_name || "");
          }
        }
      } catch (error) {
        console.error(error);
        setMessage("오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate all fields
    const errors = {};
    errors.username = validateUsername(createUsername);
    errors.password = validatePassword(createPassword);
    errors.passwordConfirm = validatePasswordMatch(createPassword, createPasswordConfirm);
    errors.email = validateEmail(createEmail);
    errors.realName = validateRealName(createRealName);

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value)
    );

    setCreateErrors(filteredErrors);

    if (Object.keys(filteredErrors).length > 0) {
      setMessage("입력 정보를 확인하세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/createUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: createUsername,
          password: createPassword,
          email: createEmail,
          role: createRole,
          real_name: createRealName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "사용자 생성에 실패했습니다.");
        return;
      }

      setMessage("사용자가 생성되었습니다.");
      // Reset form
      setCreateUsername("");
      setCreatePassword("");
      setCreatePasswordConfirm("");
      setCreateRealName("");
      setCreateEmail("");
      setCreateRole("journalist");
      setCreateErrors({});
    } catch (error) {
      setMessage("사용자 생성 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setMessage("");

    // Validate fields
    const errors = {};
    errors.username = validateUsername(editUsername);
    if (editNewPassword) {
      errors.newPassword = validatePassword(editNewPassword);
      errors.newPasswordConfirm = validatePasswordMatch(editNewPassword, editNewPasswordConfirm);
    }
    errors.email = validateEmail(editEmail);
    errors.realName = validateRealName(editRealName);

    // Filter out empty errors
    const filteredErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value)
    );

    setEditErrors(filteredErrors);

    if (Object.keys(filteredErrors).length > 0) {
      setMessage("입력 정보를 확인하세요.");
      return;
    }

    try {
      const res = await fetch("/api/auth/updateUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: currentUser.user,
          current_password: editNewPassword ? editCurrentPassword : undefined,
          new_username: editUsername !== userProfile.username ? editUsername : undefined,
          new_password: editNewPassword || undefined,
          email: editEmail,
          real_name: editRealName,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessage(data?.message || "프로필 업데이트에 실패했습니다.");
        return;
      }

      setMessage("프로필이 업데이트되었습니다.");
      // Refresh profile
      const profileRes = await fetch(`/api/auth/profile?username=${editUsername}`);
      if (profileRes.ok) {
        const profile = await profileRes.json();
        setUserProfile(profile);
      }
      setEditCurrentPassword("");
      setEditNewPassword("");
      setEditNewPasswordConfirm("");
      setEditErrors({});
    } catch (error) {
      setMessage("프로필 업데이트 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p>로딩 중...</p>
      </main>
    );
  }

  if (!currentUser) return null;

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 16,
        background: "linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)",
      }}
    >
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ margin: 0, fontSize: 24, color: "#111827" }}>사용자 관리</h1>
          <button
            onClick={() => router.push("/chart")}
            style={{
              height: 40,
              padding: "0 16px",
              border: "1px solid #d1d5db",
              borderRadius: 8,
              background: "#fff",
              color: "#374151",
              fontWeight: 500,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            대시보드로 돌아가기
          </button>
        </div>

        {currentUser.role === "admin" && (
          <div
            style={{
              marginTop: 20,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>새 사용자 생성</h2>
            <form onSubmit={handleCreateUser} style={{ display: "grid", gap: 10 }}>
              <div>
                <input
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="사용자명 (필수, 7자 이상)"
                  required
                  style={{
                    height: 40,
                    border: createErrors.username ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {createErrors.username && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {createErrors.username}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="비밀번호 (필수, 9-20자, 숫자+특수문자 포함)"
                  required
                  onPaste={handlePasswordPaste}
                  style={{
                    height: 40,
                    border: createErrors.password ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {createErrors.password && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {createErrors.password}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  value={createPasswordConfirm}
                  onChange={(e) => setCreatePasswordConfirm(e.target.value)}
                  placeholder="비밀번호 확인 (필수)"
                  required
                  onPaste={handlePasswordPaste}
                  style={{
                    height: 40,
                    border: createErrors.passwordConfirm ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {createErrors.passwordConfirm && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {createErrors.passwordConfirm}
                  </p>
                )}
              </div>
              <div>
                <input
                  value={createRealName}
                  onChange={(e) => setCreateRealName(e.target.value)}
                  placeholder="실명 (선택)"
                  style={{
                    height: 40,
                    border: createErrors.realName ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {createErrors.realName && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {createErrors.realName}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="이메일 (선택)"
                  style={{
                    height: 40,
                    border: createErrors.email ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {createErrors.email && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {createErrors.email}
                  </p>
                )}
              </div>
              <select
                value={createRole}
                onChange={(e) => setCreateRole(e.target.value)}
                style={{
                  height: 40,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  padding: "0 12px",
                  fontSize: 14,
                }}
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                style={{
                  height: 42,
                  border: 0,
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                사용자 생성
              </button>
            </form>
          </div>
        )}

        {currentUser.role !== "admin" && (
          <div
            style={{
              marginTop: 20,
              background: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
            }}
          >
            <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>내 프로필 수정</h2>
            <form onSubmit={handleUpdateUser} style={{ display: "grid", gap: 10 }}>
              <div>
                <input
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="사용자명 (필수, 7자 이상)"
                  required
                  style={{
                    height: 40,
                    border: editErrors.username ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {editErrors.username && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {editErrors.username}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  value={editCurrentPassword}
                  onChange={(e) => setEditCurrentPassword(e.target.value)}
                  placeholder="현재 비밀번호 (비밀번호 변경 시 필수)"
                  onPaste={handlePasswordPaste}
                  style={{
                    height: 40,
                    border: "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <input
                  type="password"
                  value={editNewPassword}
                  onChange={(e) => setEditNewPassword(e.target.value)}
                  placeholder="새 비밀번호 (선택, 9-20자, 숫자+특수문자 포함)"
                  onPaste={handlePasswordPaste}
                  style={{
                    height: 40,
                    border: editErrors.newPassword ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {editErrors.newPassword && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {editErrors.newPassword}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  value={editNewPasswordConfirm}
                  onChange={(e) => setEditNewPasswordConfirm(e.target.value)}
                  placeholder="새 비밀번호 확인 (선택)"
                  onPaste={handlePasswordPaste}
                  style={{
                    height: 40,
                    border: editErrors.newPasswordConfirm ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {editErrors.newPasswordConfirm && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {editErrors.newPasswordConfirm}
                  </p>
                )}
              </div>
              <div>
                <input
                  value={editRealName}
                  onChange={(e) => setEditRealName(e.target.value)}
                  placeholder="실명 (선택)"
                  style={{
                    height: 40,
                    border: editErrors.realName ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {editErrors.realName && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {editErrors.realName}
                  </p>
                )}
              </div>
              <div>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="이메일 (선택)"
                  style={{
                    height: 40,
                    border: editErrors.email ? "1px solid #dc2626" : "1px solid #d1d5db",
                    borderRadius: 8,
                    padding: "0 12px",
                    fontSize: 14,
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                />
                {editErrors.email && (
                  <p style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                    {editErrors.email}
                  </p>
                )}
              </div>
              <button
                type="submit"
                style={{
                  height: 42,
                  border: 0,
                  borderRadius: 8,
                  background: "#2563eb",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                프로필 업데이트
              </button>
            </form>
          </div>
        )}

        {message && (
          <p style={{ margin: "20px 0 0", fontSize: 14, color: message.includes("되었습니다") ? "#059669" : "#dc2626" }}>
            {message}
          </p>
        )}
      </div>
    </main>
  );
}