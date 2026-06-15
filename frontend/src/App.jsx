import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import { Auth } from "./Axios/userAxios";
import { Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";

// ── BRANDING DESIGN TOKENS ────────────────────────────────────────────────────
const G = {
  dark:    "#14532d",
  mid:     "#16a34a",
  light:   "#4ade80",
  bg:      "#f0fdf4",
  text:    "#0f172a",
  muted:   "#94a3b8",
};

// ── CUSTOM LUXURY MICRO-ANIMATIONS ──────────────────────────────────────────
const pulseGlow = keyframes`
  0% { transform: scale(0.96); opacity: 0.8; box-shadow: 0 4px 10px rgba(22,163,74,0.2); }
  50% { transform: scale(1.04); opacity: 1; box-shadow: 0 12px 30px rgba(22,163,74,0.4); }
  100% { transform: scale(0.96); opacity: 0.8; box-shadow: 0 4px 10px rgba(22,163,74,0.2); }
`;

const textFade = keyframes`
  0% { opacity: 0.5; transform: translateY(2px); }
  50% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0.5; transform: translateY(2px); }
`;

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on app start
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await Auth();
        console.log(data);
        setUser(data);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // ── SMART PREMIUM SPLASH SCREEN ──
  if (loading) {
    return (
      <Box sx={{
        minHeight: "100vh",
        bgcolor: G.bg,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      }}>
        
        {/* Animated Brand Geometric Node */}
        <Box sx={{
          width: 72,
          height: 72,
          borderRadius: "22px",
          background: `linear-gradient(135deg, ${G.dark}, ${G.mid})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: `${pulseGlow} 2s infinite ease-in-out`,
          mb: 3
        }}>
          <Box component="span" sx={{
            width: 32,
            height: 32,
            border: "3.5px solid white",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <Box sx={{ width: 10, height: 10, bgcolor: "white", borderRadius: "50%" }} />
          </Box>
        </Box>

        {/* Minimalist System Status Indicators */}
        <Box sx={{ textAlign: "center", animation: `${textFade} 2s infinite ease-in-out` }}>
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: G.text, letterSpacing: "0.02em", lineHeight: 1 }}>
            ORMVAM
          </Typography>
          <Typography sx={{ fontSize: 11, color: G.muted, letterSpacing: "0.12em", textTransform: "uppercase", mt: 0.8, fontWeight: 600 }}>
            Initialisation sécurisée...
          </Typography>
        </Box>

      </Box>
    );
  }

  // ── IF NOT LOGGED IN ──
  if (!user) {
    return (
      <Login onSuccess={(loggedUser) => {
        setUser(loggedUser);
      }} />
    );
  }

  // ── LOGGED IN -> OPEN DASHBOARD ──
  return <Dashboard user={user} />;
}