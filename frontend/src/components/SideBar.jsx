import { Box, Typography } from "@mui/material";
import {
  PeopleOutlined,
  DashboardOutlined,
  FolderOutlined,
  CreateNewFolderOutlined,
  EngineeringOutlined,
  MailOutlined,
  AccountTreeOutlined,
  MenuBookOutlined,
  HeadsetMicOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  bg:       "#f0fdf4",
  surface:  "#ffffff",
  border:   "#dcfce7",
  green:    "#16a34a",
  greenDk:  "#14532d",
  text:     "#0f172a",
  sub:      "#475569",
  muted:    "#94a3b8",
  active:   "#f0fdf4",
};

// ── NAV ITEMS ─────────────────────────────────────────────────────────────────
const ITEMS = [
  { label: "Tableau de bord",   page: "dashboard",          icon: <DashboardOutlined         fontSize="small" />, accent: "#2563eb" },
  { label: "Dossiers",          page: "dashboard",          icon: <FolderOutlined             fontSize="small" />, accent: "#16a34a" },
  { label: "Nouveau Dossier",   page: "create-folder",      icon: <CreateNewFolderOutlined    fontSize="small" />, accent: "#16a34a" },
  { label: "Conception",        page: "conception-insert",  icon: <EngineeringOutlined        fontSize="small" />, accent: "#d97706" },
  { label: "Comptes",           page: "comptes",            icon: <PeopleOutlined             fontSize="small" />, accent: "#7c3aed" },
  { label: "Messagerie",        page: "messagerie",         icon: <MailOutlined               fontSize="small" />, accent: "#0891b2" },
  { label: "Processus",         page: "processus",          icon: <AccountTreeOutlined        fontSize="small" />, accent: "#d97706" },
];

// ── COMPONENT ─────────────────────────────────────────────────────────────────
export default function SideBar({ setCurrentPage, currentPage }) {
  return (
    <Box sx={{
      width: { xs: "100%", sm: 200 },
      minHeight: "100vh",
      bgcolor: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      pt: 3, pb: 3,
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    }}>

      {/* LOGO */}
      <Box sx={{ px: 2.5, mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: "9px",
          background: `linear-gradient(135deg, ${T.greenDk}, ${T.green})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0,
          boxShadow: `0 3px 10px ${alpha(T.green, 0.3)}`,
        }}>
          <Box sx={{ width: 12, height: 12, border: "2px solid white", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Box sx={{ width: 4, height: 4, bgcolor: "white", borderRadius: "50%" }} />
          </Box>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: T.text, lineHeight: 1 }}>ORMVAM</Typography>
          <Typography sx={{ fontSize: 9.5, color: T.muted, letterSpacing: "0.08em", textTransform: "uppercase", mt: "1px" }}>
            Irrigation
          </Typography>
        </Box>
      </Box>

      {/* SECTION LABEL */}
      <Typography sx={{
        px: 2.5, mb: 1, fontSize: 10, fontWeight: 700,
        color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em",
      }}>
        Navigation
      </Typography>

      {/* NAV ITEMS */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, px: 1.5 }}>
        {ITEMS.map(item => {
          const isActive = currentPage === item.page;
          return (
            <Box
              key={item.page + item.label}
              onClick={() => setCurrentPage(item.page)}
              sx={{
                display: "flex", alignItems: "center", gap: 1.5,
                px: 1.5, py: 1,
                borderRadius: "10px",
                cursor: "pointer",
                bgcolor: isActive ? alpha(item.accent, 0.09) : "transparent",
                border: `1px solid ${isActive ? alpha(item.accent, 0.18) : "transparent"}`,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: alpha(item.accent, 0.07),
                  border: `1px solid ${alpha(item.accent, 0.14)}`,
                },
              }}
            >
              {/* Icon */}
              <Box sx={{
                color: isActive ? item.accent : T.muted,
                display: "flex", alignItems: "center",
                transition: "color 0.15s",
              }}>
                {item.icon}
              </Box>

              {/* Label */}
              <Typography sx={{
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? item.accent : T.sub,
                transition: "all 0.15s",
                lineHeight: 1,
              }}>
                {item.label}
              </Typography>

              {/* Active dot */}
              {isActive && (
                <Box sx={{
                  ml: "auto", width: 5, height: 5,
                  borderRadius: "50%", bgcolor: item.accent,
                  flexShrink: 0,
                }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* SPACER */}
      <Box sx={{ flex: 1 }} />

      {/* FOOTER */}
      <Box sx={{
        mx: 1.5, px: 2, py: 1.5,
        borderRadius: "10px",
        bgcolor: T.bg,
        border: `1px solid ${T.border}`,
      }}>
        <Typography sx={{ fontSize: 10.5, fontWeight: 600, color: T.green, lineHeight: 1 }}>
          Système E-Irrigation
        </Typography>
        <Typography sx={{ fontSize: 9.5, color: T.muted, mt: "2px" }}>
          v1.0 · ORMVAM 2025
        </Typography>
      </Box>
    </Box>
  );
}