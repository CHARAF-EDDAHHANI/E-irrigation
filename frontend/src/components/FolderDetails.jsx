import { useEffect, useState } from "react";
import {
  Box, Typography, Chip, Paper, IconButton,
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

      {/* ── TOP BAR ── */}
      <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
        <IconButton onClick={onBack} size="small" sx={{
          bgcolor: T.surface, border: `1px solid ${T.border}`,
          borderRadius: "10px", width: 36, height: 36,
          "&:hover": { bgcolor: T.greenLt, borderColor: T.greenBd },
        }}>
          <ArrowBack sx={{ fontSize: 18, color: T.sub }} />
        </IconButton>
        <Box>
          <Typography sx={{ fontSize: 18, fontWeight: 800, color: T.text, lineHeight: 1 }}>
            Détail du dossier
          </Typography>
          <Typography sx={{ fontSize: 12, color: T.muted, mt: "2px" }}>
            Fiche complète — informations et financement
          </Typography>
        </Box>
      </Stack>

      {/* ── HERO ── */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: "20px", overflow: "hidden", border: `1px solid ${T.border}` }}>
        {/* Accent bar */}
        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${T.greenDk}, ${T.green}, #4ade80)` }} />

        <Box sx={{ p: { xs: 2.5, md: 3 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={2}
          >
            {/* LEFT — folder identity */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{
                width: 48, height: 48, borderRadius: "14px", flexShrink: 0,
                background: `linear-gradient(135deg, ${T.greenDk}, ${T.green})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 4px 14px ${alpha(T.green, 0.3)}`,
              }}>
                <FolderOutlined sx={{ fontSize: 22, color: "white" }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", mb: "2px" }}>
                  Identifiant dossier
                </Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 900, color: T.text, lineHeight: 1 }}>
                  {folder.folder_name}
                </Typography>
                <Typography sx={{ fontSize: 13, color: T.sub, mt: "3px" }}>
                  {folder.beneficiary_name}
                </Typography>
              </Box>
            </Stack>

            {/* RIGHT — actions row */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.5}
              alignItems={{ xs: "flex-start", sm: "center" }}
              flexWrap="wrap"
            >
              {/* Phase + year chips */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip
                  label={phase.label}
                  sx={{ bgcolor: phase.bg, color: phase.color, fontWeight: 800, fontSize: 12, border: `1px solid ${alpha(phase.color, 0.25)}`, height: 30, px: 0.5 }}
                />
                {folder.deposit_year && (
                  <Chip
                    label={`Dépôt ${folder.deposit_year}`}
                    size="small"
                    sx={{ bgcolor: T.greenLt, color: T.green, fontWeight: 600, fontSize: 11, border: `1px solid ${T.greenBd}` }}
                  />
                )}
              </Stack>

              {/* MESSAGERIE BUTTON */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<ChatBubbleOutlineRounded sx={{ fontSize: 15 }} />}
                onClick={() => setOpenChat(true)}
                sx={{
                  borderRadius: "10px", textTransform: "none",
                  fontWeight: 700, fontSize: 13, height: 36, px: 2,
                  borderColor: "#e2e8f0", color: T.sub,
                  bgcolor: T.surface,
                  "&:hover": {
                    borderColor: T.green, color: T.green,
                    bgcolor: T.greenLt,
                    boxShadow: `0 2px 8px ${alpha(T.green, 0.15)}`,
                  },
                  transition: "all 0.15s",
                }}
              >
                Messages
              </Button>

              {/* CONCEPTION BUTTON */}
              {hasConception === null ? (
                <CircularProgress size={20} sx={{ color: T.green }} />
              ) : hasConception ? (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<VisibilityOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => onViewConception(folder.folder_id)}
                  sx={{
                    borderRadius: "10px", textTransform: "none",
                    fontWeight: 700, fontSize: 13, height: 36, px: 2,
                    bgcolor: "#2563eb",
                    boxShadow: `0 3px 10px ${alpha("#2563eb", 0.3)}`,
                    "&:hover": { bgcolor: "#1d4ed8", boxShadow: `0 5px 16px ${alpha("#2563eb", 0.4)}` },
                  }}
                >
                  voir la Conception
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<RocketLaunchOutlined sx={{ fontSize: 16 }} />}
                  onClick={() => onLaunchConception(folder.folder_id)}
                  sx={{
                    borderRadius: "10px", textTransform: "none",
                    fontWeight: 700, fontSize: 13, height: 36, px: 2,
                    bgcolor: T.green,
                    boxShadow: `0 3px 10px ${alpha(T.green, 0.3)}`,
                    "&:hover": { bgcolor: T.greenDk, boxShadow: `0 5px 16px ${alpha(T.green, 0.4)}` },
                  }}
                >
                  Lancer la Conception
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Paper>

      {/* ── GENERAL INFO ── */}
      <Paper elevation={0} sx={{ mb: 3, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <SectionTitle icon={<PersonOutlined sx={{ fontSize: 16 }} />} title="Informations générales" />
        <Grid container spacing={2}>
          {[
            { icon: <PersonOutlined sx={{ fontSize: 16 }} />,        label: "Bénéficiaire",     value: folder.beneficiary_name },
            { icon: <BadgeOutlined sx={{ fontSize: 16 }} />,         label: "CIN / CNE",        value: folder.national_id },
            { icon: <CalendarTodayOutlined sx={{ fontSize: 16 }} />, label: "Année de dépôt",   value: folder.deposit_year },
            { icon: <FolderOutlined sx={{ fontSize: 16 }} />,        label: "CMV",              value: folder.cvm },
            { icon: <AgricultureOutlined sx={{ fontSize: 16 }} />,   label: "Culture",          value: folder.crop },
            { icon: <BusinessOutlined sx={{ fontSize: 16 }} />,      label: "Société",          value: folder.company || "—" },
            { icon: <ArticleOutlined sx={{ fontSize: 16 }} />,       label: "Documents",        value: folder.documents },
            { icon: <PersonOutlined sx={{ fontSize: 16 }} />,        label: "Créé par",         value: folder.created_by_name || folder.creator_fullname || folder.created_by_user_fullname },
            { icon: <CalendarTodayOutlined sx={{ fontSize: 16 }} />, label: "Date de création", value: fmtDate(folder.created_at) },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <InfoCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── FINANCIAL INFO ── */}
      <Paper elevation={0} sx={{ mb: 3, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <SectionTitle icon={<AttachMoneyOutlined sx={{ fontSize: 16 }} />} title="Informations financières" />
        <Grid container spacing={2}>
          {[
            { icon: <SquareFoot sx={{ fontSize: 16 }} />,             label: "Superficie",       value: fmt(folder.area, " ha"),                       accent: T.green },
            { icon: <AttachMoneyOutlined sx={{ fontSize: 16 }} />,    label: "Investissement",   value: fmt(folder.investment, " DH"),                  accent: "#2563eb" },
            { icon: <AttachMoneyOutlined sx={{ fontSize: 16 }} />,    label: "Invest. / Ha",     value: fmt(folder.investment_per_hectare, " DH"),      accent: "#7c3aed" },
            { icon: <AccountBalance sx={{ fontSize: 16 }} />,         label: "Invest. retenu",   value: fmt(folder.reimbursed_investment, " DH"),       accent: "#0891b2" },
            { icon: <AttachMoneyOutlined sx={{ fontSize: 16 }} />,    label: "Subvention",       value: fmt(folder.subsidy, " DH"),                     accent: "#d97706" },
            { icon: <Percent sx={{ fontSize: 16 }} />,                label: "Pourcentage",      value: fmt(folder.percentage, "%"),                    accent: "#c2410c" },
          ].map((item, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <InfoCard {...item} />
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* ── COMMENT ── */}
      <Paper elevation={0} sx={{ p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
        <SectionTitle icon={<ArticleOutlined sx={{ fontSize: 16 }} />} title="Commentaire" />
        <Divider sx={{ mb: 2, borderColor: T.border }} />
        <Box sx={{ p: 2, bgcolor: T.bg, borderRadius: "12px", border: `1px solid ${T.border}` }}>
          <Typography sx={{
            fontSize: 13.5, lineHeight: 1.8,
            color: folder.comment ? T.sub : T.muted,
            fontStyle: folder.comment ? "normal" : "italic",
          }}>
            {folder.comment || "Aucun commentaire disponible."}
          </Typography>
        </Box>
      </Paper>

      {/* ── CHAT DRAWER ── */}
      <ChatDrawer
        open={openChat}
        onClose={() => setOpenChat(false)}
        folder={folder}
        currentUser={currentUser}
      />
    </Box>
  );
}