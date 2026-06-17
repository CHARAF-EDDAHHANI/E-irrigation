import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./components/Login";
import { Auth } from "./Axios/userAxios";
import { Box, Typography, GlobalStyles} from "@mui/material";
import { keyframes } from "@mui/system";

// ── BRANDING DESIGN TOKENS ────────────────────────────────────────────────────
const G = {
  dark:    "#14532d",
  mid:     "#16a34a",
  light:   "#4ade80",
  bg:      "#f0fdf4",
  text:    "#0f172a",
  muted:   "#6982a6",
};

// ── CUSTOM LUXURY MICRO-ANIMATIONS ──────────────────────────────────────────
const pulseGlow = keyframes`
  0% { transform: scale(0.96); opacity: 0.8; box-shadow: 0 4px 15px rgba(22,163,74,0.3); }
  50% { transform: scale(1.04); opacity: 1; box-shadow: 0 12px 35px rgba(22,163,74,0.6); }
  100% { transform: scale(0.96); opacity: 0.8; box-shadow: 0 4px 15px rgba(22,163,74,0.3); }
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
        
        {/* FIXED: Official Application Logo with Premium Pulsing Green Glow Animation */}
        <Box 
          component="img"
          src="/logonv.png"
          alt="ORMVAM Logo"
          sx={{
            width: 120,
            height: 120,
            objectFit: "contain",
            borderRadius: "20px",
            animation: `${pulseGlow} 2s infinite ease-in-out`,
            mb: 2
          }}
        />

        {/* Minimalist System Status Indicators */}
        <Box sx={{ textAlign: "center", animation: `${textFade} 2s infinite ease-in-out` }}>
          <Typography sx={{ fontSize: 16, fontWeight: 900, color: G.text, letterSpacing: "0.02em", lineHeight: 1 }}>
            Office Régional de Mise en Valeur Agricole de la Moulouya
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
      <>
      <GlobalStyles styles={{ body: { margin: 0, padding: 0, boxSizing: "border-box" } }} />

      <Login onSuccess={(loggedUser) => {
        setUser(loggedUser);
      }} />
      </>
    );
  }

  // ── LOGGED IN -> OPEN DASHBOARD ──
  return <Dashboard user={user} />;
} 
