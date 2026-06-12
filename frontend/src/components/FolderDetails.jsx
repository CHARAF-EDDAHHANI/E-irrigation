import { useEffect, useState } from "react";
import {
  Box, Typography, Chip, Paper, IconButton, Card, Tooltip,
  Divider, Grid, Stack, Avatar, Button, CircularProgress,
} from "@mui/material";
import {
  ArrowBack, FolderOutlined, AgricultureOutlined,
  PersonOutlined, CalendarTodayOutlined, AttachMoneyOutlined,
  BusinessOutlined, ArticleOutlined, BadgeOutlined,
  SquareFoot, Percent, AccountBalance,
  VisibilityOutlined, RocketLaunchOutlined,
  ChatBubbleOutlineRounded,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

import { checkConceptionByFolder } from "../Axios/conceptionAxios";
import ChatDrawer from "./ChatDrawer";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#f8fafc",
  surface: "#ffffff",
  border:  "#e2e8f0",
  green:   "#16a34a",
  greenDk: "#14532d",
  greenLt: "#f0fdf4",
  greenBd: "#bbf7d0",
  text:    "#0f172a",
  sub:     "#475569",
  muted:   "#94a3b8",
};

const PHASE = {
  prealable:  { bg: "#f3e8ff", color: "#7c3aed", label: "Préalable"  },
  validation: { bg: "#dbeafe", color: "#1d4ed8", label: "Validation" },
  execution:  { bg: "#fff7ed", color: "#c2410c", label: "Exécution"  },
  cloture:    { bg: "#dcfce7", color: "#15803d", label: "Clôture"    },
};

const getPhase  = (p) => PHASE[p?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b", label: p || "—" };
const fmt       = (v, suffix = "") => (v !== undefined && v !== null && v !== "" ? `${v}${suffix}` : "—");
const fmtDate   = (d) => { try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }); } catch { return "—"; } };

// ── INFO CARD ─────────────────────────────────────────────────────────────────
function InfoCard({ icon, label, value, accent }) {
  const col = accent || T.green;
  return (
    <Paper elevation={0} sx={{
      p: 2, borderRadius: "14px", height: "100%",
      border: `1px solid ${T.border}`, bgcolor: T.surface,
      transition: "box-shadow 0.15s",
      "&:hover": { boxShadow: `0 4px 18px ${alpha(col, 0.1)}`, borderColor: alpha(col, 0.3) },
    }}>
      <Stack direction="row" spacing={1.5} alignItems="center" mb={1.2}>
        <Avatar sx={{ width: 30, height: 30, bgcolor: alpha(col, 0.1), color: col, borderRadius: "8px" }}>
          {icon}
        </Avatar>
        <Typography sx={{ fontSize: 11, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.text, wordBreak: "break-word", lineHeight: 1.4 }}>
        {value || "—"}
      </Typography>
    </Paper>
  );
}

// ── SECTION HEADING ────────────────────────────────────────────────────────────
function SectionTitle({ icon, title }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.2} mb={2.5}>
      <Box sx={{ width: 30, height: 30, borderRadius: "8px", bgcolor: T.greenLt, color: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.text }}>{title}</Typography>
    </Stack>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function FolderDetail({ folder, onBack, onLaunchConception, onViewConception, currentUser }) {
  if (!folder) return null;

  const phase = getPhase(folder.phase);

  const [hasConception, setHasConception] = useState(null);
  const [openChat,      setOpenChat]      = useState(false);

  // Check if conception exists for this folder
  useEffect(() => {
    if (!folder?.folder_id) return;
    checkConceptionByFolder(folder.folder_id)
      .then(exists => setHasConception(exists))
      .catch(() => setHasConception(false));
  }, [folder.folder_id]);

  return (
  <Box sx={{ p: { xs: 2, md: 3 }, minHeight: "100vh", bgcolor: T.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

    {/* TOP BAR */}
    <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
      <IconButton onClick={onBack} size="small" sx={{
        width: 34, height: 34,
        borderRadius: "8px",
        border: `0.5px solid ${T.border}`,
        bgcolor: T.surface,
        "&:hover": { bgcolor: T.bg },
      }}>
        <ArrowBack sx={{ fontSize: 18, color: T.sub }} />
      </IconButton>
      <Box>
        <Typography sx={{ fontSize: 18, fontWeight: 500, color: T.text, lineHeight: 1 }}>
          Détail du dossier
        </Typography>
        <Typography sx={{ fontSize: 12, color: T.muted, mt: "3px" }}>
          Fiche complète — informations et financement
        </Typography>
      </Box>
    </Stack>

    {/* HERO */}
    <Paper elevation={0} sx={{ mb: 2, borderRadius: "12px", overflow: "hidden", border: `0.5px solid ${T.border}` }}>
      <Box sx={{ height: 3, bgcolor: T.green }} />
      <Box sx={{ p: { xs: 2, md: 2.5 }, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>

        {/* LEFT */}
        <Stack direction="row" spacing={1.75} alignItems="center">
          <Box sx={{
            width: 44, height: 44, borderRadius: "10px", flexShrink: 0,
            bgcolor: T.greenLt,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <FolderOutlined sx={{ fontSize: 20, color: T.green }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 10, fontWeight: 500, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em", mb: "3px" }}>
              Identifiant dossier
            </Typography>
            <Typography sx={{ fontSize: 20, fontWeight: 500, color: T.text, lineHeight: 1 }}>
              {folder.folder_name}
            </Typography>
            <Typography sx={{ fontSize: 13, color: T.sub, mt: "4px" }}>
              {folder.beneficiary_name}
            </Typography>
          </Box>
        </Stack>

        {/* RIGHT */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
          <Chip
            label={phase.label}
            size="small"
            sx={{ bgcolor: phase.bg, color: phase.color, fontWeight: 500, fontSize: 12, border: `0.5px solid ${alpha(phase.color, 0.35)}`, height: 28 }}
          />
          {folder.deposit_year && (
            <Chip
              label={`Dépôt ${folder.deposit_year}`}
              size="small"
              sx={{ bgcolor: T.greenLt, color: T.green, fontWeight: 500, fontSize: 11, border: `0.5px solid ${T.greenBd}`, height: 28 }}
            />
          )}
          <Button
            size="small"
            variant="outlined"
            startIcon={<ChatBubbleOutlineRounded sx={{ fontSize: 14 }} />}
            onClick={() => setOpenChat(true)}
            sx={{
              borderRadius: "8px", textTransform: "none", fontWeight: 500,
              fontSize: 13, height: 34, px: 1.75,
              borderColor: T.border, color: T.sub, bgcolor: T.surface,
              "&:hover": { borderColor: T.green, color: T.green, bgcolor: T.greenLt },
              transition: "all 0.15s",
            }}
          >
            Messages
          </Button>

          {hasConception === null ? (
            <CircularProgress size={18} sx={{ color: T.green }} />
          ) : hasConception ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<VisibilityOutlined sx={{ fontSize: 15 }} />}
              onClick={() => onViewConception(folder.folder_id)}
              sx={{
                borderRadius: "8px", textTransform: "none", fontWeight: 500,
                fontSize: 13, height: 34, px: 1.75,
                bgcolor: "#185FA5", boxShadow: "none",
                "&:hover": { bgcolor: "#0C447C", boxShadow: "none" },
              }}
            >
              Voir la conception
            </Button>
          ) : (
            <Button
              size="small"
              variant="contained"
              startIcon={<RocketLaunchOutlined sx={{ fontSize: 15 }} />}
              onClick={() => onLaunchConception(folder.folder_id)}
              sx={{
                borderRadius: "8px", textTransform: "none", fontWeight: 500,
                fontSize: 13, height: 34, px: 1.75,
                bgcolor: T.green, boxShadow: "none",
                "&:hover": { bgcolor: T.greenDk, boxShadow: "none" },
              }}
            >
              Lancer la conception
            </Button>
          )}
        </Stack>
      </Box>
    </Paper>

    {/* GENERAL INFO */}
    <Paper elevation={0} sx={{ mb: 2, p: { xs: 2, md: 2.5 }, borderRadius: "12px", border: `0.5px solid ${T.border}`, bgcolor: T.surface }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2} pb={1.5} sx={{ borderBottom: `0.5px solid ${T.border}` }}>
        <PersonOutlined sx={{ fontSize: 16, color: T.muted }} />
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text }}>Informations générales</Typography>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {[
          { icon: <PersonOutlined sx={{ fontSize: 14 }} />,        label: "Bénéficiaire",     value: folder.beneficiary_name },
          { icon: <BadgeOutlined sx={{ fontSize: 14 }} />,         label: "CIN / CNE",        value: folder.national_id },
          { icon: <CalendarTodayOutlined sx={{ fontSize: 14 }} />, label: "Année de dépôt",   value: folder.deposit_year },
          { icon: <FolderOutlined sx={{ fontSize: 14 }} />,        label: "CMV",              value: folder.cvm },
          { icon: <AgricultureOutlined sx={{ fontSize: 14 }} />,   label: "Culture",          value: folder.crop },
          { icon: <BusinessOutlined sx={{ fontSize: 14 }} />,      label: "Société",          value: folder.company || "—" },
          { icon: <ArticleOutlined sx={{ fontSize: 14 }} />,       label: "Documents",        value: folder.documents },
          { icon: <PersonOutlined sx={{ fontSize: 14 }} />,        label: "Créé par",         value: folder.created_by_user_fullname },
          { icon: <CalendarTodayOutlined sx={{ fontSize: 14 }} />, label: "Date de création", value: fmtDate(folder.created_at) },
        ].map((item, i) => (
          <Box key={i} sx={{ bgcolor: T.bg, borderRadius: "8px", p: "12px 14px" }}>
            <Stack direction="row" alignItems="center" spacing={0.75} mb={0.75} sx={{ color: T.muted }}>
              {item.icon}
              <Typography sx={{ fontSize: 11, color: T.muted }}>{item.label}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text }}>{item.value || "—"}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>

    {/* FINANCIAL INFO */}
    <Paper elevation={0} sx={{ mb: 2, p: { xs: 2, md: 2.5 }, borderRadius: "12px", border: `0.5px solid ${T.border}`, bgcolor: T.surface }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2} pb={1.5} sx={{ borderBottom: `0.5px solid ${T.border}` }}>
        <AttachMoneyOutlined sx={{ fontSize: 16, color: T.muted }} />
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text }}>Informations financières</Typography>
      </Stack>
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
        {[
          { icon: <SquareFoot sx={{ fontSize: 14 }} />,          label: "Superficie",     value: fmt(folder.area, " ha"),                      accent: T.green },
          { icon: <AttachMoneyOutlined sx={{ fontSize: 14 }} />, label: "Investissement", value: fmt(folder.investment, " DH"),                 accent: "#185FA5" },
          { icon: <AttachMoneyOutlined sx={{ fontSize: 14 }} />, label: "Invest. / Ha",   value: fmt(folder.investment_per_hectare, " DH"),     accent: "#534AB7" },
          { icon: <AccountBalance sx={{ fontSize: 14 }} />,      label: "Invest. retenu", value: fmt(folder.reimbursed_investment, " DH"),      accent: "#0F6E56" },
          { icon: <AttachMoneyOutlined sx={{ fontSize: 14 }} />, label: "Subvention",     value: fmt(folder.subsidy, " DH"),                    accent: "#854F0B" },
          { label: "Pourcentage",    value: `${parseFloat(folder.percentage).toFixed(0)}%`,                   accent: "#A32D2D" },
        ].map((item, i) => (
          <Box key={i} sx={{ bgcolor: T.bg, borderRadius: "8px", p: "12px 14px", borderLeft: `2px solid ${item.accent}` }}>
            <Stack direction="row" alignItems="center" spacing={0.75} mb={0.75} sx={{ color: T.muted }}>
              {item.icon}
              <Typography sx={{ fontSize: 11, color: T.muted }}>{item.label}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 15, fontWeight: 500, color: T.text }}>{item.value || "—"}</Typography>
          </Box>
        ))}
      </Box>
    </Paper>

    {/* COMMENT */}
    <Paper elevation={0} sx={{ p: { xs: 2, md: 2.5 }, borderRadius: "12px", border: `0.5px solid ${T.border}`, bgcolor: T.surface }}>
      <Stack direction="row" alignItems="center" spacing={1} mb={2} pb={1.5} sx={{ borderBottom: `0.5px solid ${T.border}` }}>
        <ArticleOutlined sx={{ fontSize: 16, color: T.muted }} />
        <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text }}>Commentaire</Typography>
      </Stack>
      <Box sx={{ bgcolor: T.bg, borderRadius: "8px", p: "14px 16px" }}>
        <Typography sx={{
          fontSize: 13.5, lineHeight: 1.8,
          color: folder.comment ? T.sub : T.muted,
          fontStyle: folder.comment ? "normal" : "italic",
        }}>
          {folder.comment || "Aucun commentaire disponible."}
        </Typography>
      </Box>
    </Paper>

    {/* CHAT DRAWER */}
    <ChatDrawer
      open={openChat}
      onClose={() => setOpenChat(false)}
      folder={folder}
      currentUser={currentUser}
    />

  </Box>
);
}