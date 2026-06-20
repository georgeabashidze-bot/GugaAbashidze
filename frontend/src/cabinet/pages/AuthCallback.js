import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/cabinet/context/AuthContext";

export default function AuthCallback() {
  const { exchangeGoogleSession } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const hash = window.location.hash || "";
    const match = hash.match(/session_id=([^&]+)/);
    if (!match) {
      navigate("/cabinet/login", { replace: true });
      return;
    }
    const session_id = decodeURIComponent(match[1]);

    (async () => {
      const r = await exchangeGoogleSession(session_id);
      // Clean the hash regardless
      try { window.history.replaceState(null, "", window.location.pathname); } catch (_) {}
      if (r.ok) {
        navigate("/cabinet/dashboard", { replace: true, state: { user: r.user } });
      } else {
        setError(r.error || "Could not sign you in");
        setTimeout(() => navigate("/cabinet/login", { replace: true }), 1800);
      }
    })();
  }, [exchangeGoogleSession, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-cream" data-testid="auth-callback">
      <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--primary))]" />
      <div className="text-sm text-[hsl(var(--muted-foreground))]">{error || "Signing you in…"}</div>
    </div>
  );
}
