// src/auth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { me as apiMe, logout as apiLogout, User } from "./api/auth";
import { tokenStore } from "./api/http";

type AuthState = {
  user: User | null;
  loading: boolean;

  // ✅ 추가 노출
  accessToken: string | null;
  isAuthenticated: boolean;

  setUser: (u: User | null) => void;
  refreshMe: () => Promise<void>;
  // ✅ 토큰을 이미 저장(예: 소셜콜백)해둔 뒤 컨텍스트 동기화할 때 호출
  loginFromTokens: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    tokenStore.getAccess() || null
  );
  const [loading, setLoading] = useState(true);

  const syncAccessToken = () => {
    setAccessToken(tokenStore.getAccess() || null);
  };

  const refreshMe = async () => {
    try {
      const u = await apiMe();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      // 토큰이 갱신/만료됐을 수 있으므로 매번 동기화
      syncAccessToken();
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      // 최초 마운트 시 토큰 존재 여부 확인
      const hasToken = !!(tokenStore.getAccess() || tokenStore.getRefresh());
      syncAccessToken();
      if (hasToken) {
        try {
          await refreshMe();
        } catch {
          /* 무시 */
        }
      }
      setLoading(false);
    })();

    // 탭 전환/스토리지 변경 시 토큰 동기화
    const onStorage = () => syncAccessToken();
    const onFocus = () => syncAccessToken();
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 1회만

  const loginFromTokens = async () => {
    // 소셜/일반 로그인에서 tokenStore에 토큰 저장 후 호출
    setLoading(true);
    try {
      await refreshMe();
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiLogout(); // 내부에서 tokenStore 정리한다고 가정
    } finally {
      setUser(null);
      syncAccessToken(); // 혹시 모를 잔여 토큰 동기화
    }
  };

  const isAuthenticated = !!accessToken; // 토큰 존재 기준

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accessToken,
        isAuthenticated,
        setUser,
        refreshMe,
        loginFromTokens,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
