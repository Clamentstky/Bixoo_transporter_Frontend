import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import api from "../services/api";
import { useLocation } from "react-router-dom";
import { clearAccountCache, clearSession, errorMessage, storeTokens } from "../services/session";

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const { pathname } = useLocation();
  const publicPage = pathname === "/" || pathname === "/login" || pathname === "/onboarding";
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionNotice, setSessionNotice] = useState("");
  const sessionVersion = useRef(0);
  const restoreSession = useCallback(async () => {
    const version = ++sessionVersion.current;
    setLoading(true);
    setError("");
    try {
      if (!localStorage.getItem("access_token") && !localStorage.getItem("refresh_token")) {
        clearAccountCache(); setUser(null); return;
      }
      const response = await api.get("/auth/me");
      if (version !== sessionVersion.current) return;
      if (response.data.role !== "TRANSPORTER") { clearSession(); setUser(null); return; }
      setUser(response.data);
    } catch (err) {
      if (version !== sessionVersion.current) return;
      setUser(null);
      if ([401, 403].includes(err.response?.status)) {
        clearSession();
        setSessionNotice("Your previous session is no longer valid. Please sign in with your registered account.");
      }
      else setError(errorMessage(err));
    } finally { if (version === sessionVersion.current) setLoading(false); }
  }, []);
  useEffect(() => {
    // A public form must never try to revive credentials left by an old account.
    if (publicPage) { setLoading(false); return; }
    restoreSession();
  }, [publicPage, restoreSession]);
  useEffect(() => {
    const expire = () => {
      setUser(null); setError("");
      setSessionNotice("Your previous session is no longer valid. Please sign in with your registered account.");
    };
    const sync = event => { if (!publicPage && (event.key === "access_token" || event.key === null)) restoreSession(); };
    window.addEventListener("auth:expired", expire);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener("auth:expired", expire); window.removeEventListener("storage", sync); };
  }, [publicPage, restoreSession]);
  const login = async (email, password) => {
    ++sessionVersion.current;
    const response = await api.post("/auth/login", { email: email.trim(), password }, { skipAuth: true });
    if (!response.success || response.data.user.role !== "TRANSPORTER") throw new Error("A transporter account is required.");
    clearAccountCache(); storeTokens(response.data);
    try {
      const current = await api.get("/auth/me");
      setUser(current.data); setError(""); setSessionNotice(""); setLoading(false);
    } catch (err) { clearSession(); throw err; }
  };
  const logout = async () => {
    ++sessionVersion.current;
    const token = localStorage.getItem("refresh_token");
    clearSession(); setUser(null); setError(""); setSessionNotice(""); setLoading(false);
    try {
      if (token) await api.post("/auth/logout", { refresh_token: token }, { skipAuth: true });
      return "You have signed out.";
    } catch { return "Signed out on this device. The server could not be reached to revoke the session."; }
  };
  return <AuthContext.Provider value={{ user, loading, error, sessionNotice, login, logout, restoreSession }}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
