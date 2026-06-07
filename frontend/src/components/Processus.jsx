import { useState } from "react";
import {
  Box, Typography, Stack, Chip, Divider,
  Grid, Paper, Avatar, Collapse, IconButton,
} from "@mui/material";
import {
  LoginOutlined, FolderOpenOutlined, EngineeringOutlined,
  BarChartOutlined, SaveOutlined, ChatBubbleOutlineRounded,
  CheckCircleOutlined, WaterOutlined, AgricultureOutlined,
  KeyboardArrowDown, KeyboardArrowUp, LightbulbOutlined,
  WarningAmberOutlined, TrendingUpOutlined, GroupsOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#f8fafc",
  surface: "#ffffff",
  border:  "#e2e8f0",
  green:   "#16a34a",
  greenDk: "#14532d",
  greenLt: "#f0fdf4",
  greenBd: "#bbf7d0",
  blue:    "#2563eb",
  blueLt:  "#eff6ff",
  amber:   "#d97706",
  amberLt: "#fffbeb",
  violet:  "#7c3aed",
  violetLt:"#f5f3ff",
  cyan:    "#0891b2",
  cyanLt:  "#ecfeff",
  text:    "#0f172a",
  sub:     "#475569",
  muted:   "#94a3b8",
};

// ── STEPS DATA ────────────────────────────────────────────────────────────────
const STEPS = [
  {
    number: "01",
    icon: <LoginOutlined />,
    color: T.blue,
    bg: T.blueLt,
    title: "Connexion sécurisée",
    subtitle: "Authentification par rôle",
    description:
      "L'accès à la plateforme est réservé aux agents et administrateurs ORMVAM. Chaque utilisateur se connecte avec ses identifiants personnels. Le système attribue automatiquement les droits selon le rôle : administrateur, agent ou gestionnaire.",
    details: [
      "Email + mot de passe chiffré bcrypt",
      "Session JWT valide 8 heures",
      "Déconnexion automatique à expiration",
      "Accès limité selon le rôle attribué",
    ],
  },
  {
    number: "02",
    icon: <FolderOpenOutlined />,
    color: T.green,
    bg: T.greenLt,
    title: "Création du dossier",
    subtitle: "Enregistrement du bénéficiaire",
    description:
      "L'agent saisit les informations du bénéficiaire : identité, superficie, culture, localisation CMV, données financières et phase administrative du dossier. Le nom du dossier est généré automatiquement pour éviter les doublons.",
    details: [
      "Nom automatique : DOS_{CIN}_{Année}",
      "Validation des champs obligatoires",
      "Calcul automatique du ratio investissement/ha",
      "Calcul automatique du pourcentage de subvention",
    ],
  },
  {
    number: "03",
    icon: <EngineeringOutlined />,
    color: T.amber,
    bg: T.amberLt,
    title: "Conception hydraulique",
    subtitle: "Calcul du système d'irrigation",
    description:
      "L'agent lance la conception depuis le dossier. Le moteur de calcul hydraulique détermine les besoins en eau, dimensionne les goutteurs, rampes, porte-rampes, conduites, groupe motopompe et bassin de stockage selon les données agronomiques saisies.",
    details: [
      "Besoins en eau : ET0 × Kc / Kr",
      "Dimensionnement des rampes (Darcy-Weisbach)",
      "Calcul HMT pompe bassin et forage",
      "Volume et autonomie du bassin de stockage",
    ],
  },
  {
    number: "04",
    icon: <BarChartOutlined />,
    color: T.violet,
    bg: T.violetLt,
    title: "Visualisation des résultats",
    subtitle: "Analyse graphique complète",
    description:
      "Les résultats de calcul s'affichent immédiatement sous forme de graphiques interactifs : profils de pression, débits, besoins par culture, financement, pompes et bassin. L'agent analyse chaque section avant validation.",
    details: [
      "7 onglets thématiques de visualisation",
      "Graphiques recharts interactifs",
      "Profil de pression le long des rampes",
      "Comparatif pompe bassin vs forage",
    ],
  },
  {
    number: "05",
    icon: <SaveOutlined />,
    color: T.cyan,
    bg: T.cyanLt,
    title: "Enregistrement automatique",
    subtitle: "Sauvegarde liée au dossier",
    description:
      "La conception est enregistrée automatiquement dans la base de données dès validation du calcul. Elle est rattachée au dossier par une clé étrangère (folder_id). L'agent peut revenir sur la conception à tout moment depuis le dossier.",
    details: [
      "Sauvegarde dans db/conceptions.json",
      "Lien folder_id → conception_id",
      "Horodatage created_at / updated_at",
      "Accès depuis bouton 'Visionner la Conception'",
    ],
  },
  {
    number: "06",
    icon: <ChatBubbleOutlineRounded />,
    color: T.green,
    bg: T.greenLt,
    title: "Messagerie par dossier",
    subtitle: "Communication interne d'équipe",
    description:
      "Chaque dossier dispose d'un fil de discussion interne. Les agents échangent des messages directement dans le contexte du dossier concerné. La messagerie est accessible depuis le détail du dossier ou depuis la vue globale Messagerie.",
    details: [
      "Un fil de discussion par dossier",
      "Identification de l'expéditeur par rôle",
      "Bulles de conversation en temps réel",
      "Vue globale de tous les fils dans Messagerie",
    ],
  },
];

// ── PROBLEMS & SOLUTIONS ──────────────────────────────────────────────────────
const PROBLEMS = [
  {
    problem: "Calculs hydrauliques manuels sur Excel",
    solution: "Moteur de calcul automatisé, résultats en quelques secondes",
    icon: <EngineeringOutlined sx={{ fontSize: 18 }} />,
  },
  {
    problem: "Dossiers papier dispersés et difficiles à retrouver",
    solution: "Base de données centralisée, recherche instantanée",
    icon: <FolderOpenOutlined sx={{ fontSize: 18 }} />,
  },
  {
    problem: "Aucune traçabilité sur les modifications",
    solution: "Historique horodaté sur chaque dossier et conception",
    icon: <WarningAmberOutlined sx={{ fontSize: 18 }} />,
  },
  {
    problem: "Communication par téléphone ou email non tracée",
    solution: "Messagerie intégrée par dossier, échanges conservés",
    icon: <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} />,
  },
  {
    problem: "Erreurs de saisie dans les calculs financiers",
    solution: "Calcul automatique invest./ha et pourcentage subvention",
    icon: <TrendingUpOutlined sx={{ fontSize: 18 }} />,
  },
  {
    problem: "Accès non contrôlé aux données sensibles",
    solution: "Authentification JWT + contrôle d'accès par rôle",
    icon: <GroupsOutlined sx={{ fontSize: 18 }} />,
  },
];

// ── STEP CARD ─────────────────────────────────────────────────────────────────
function StepCard({ step, index }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        border: `1px solid ${T.border}`,
        borderRadius: "18px",
        overflow: "hidden",
        bgcolor: T.surface,
        transition: "box-shadow 0.18s",
        "&:hover": { boxShadow: `0 6px 24px ${alpha(step.color, 0.1)}` },
      }}
    >
      {/* Step color bar */}
      <Box sx={{ height: 3, bgcolor: step.color, opacity: 0.8 }} />

      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">

          {/* Icon */}
          <Box sx={{
            width: 44, height: 44, borderRadius: "12px", flexShrink: 0,
            bgcolor: alpha(step.color, 0.12), color: step.color,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {step.icon}
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Number + title */}
            <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: step.color, fontFamily: "monospace", letterSpacing: "0.08em" }}>
                {step.number}
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: T.border }} />
              <Typography sx={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>
                {step.subtitle}
              </Typography>
            </Stack>

            <Typography sx={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.2, mb: 1 }}>
              {step.title}
            </Typography>

            <Typography sx={{ fontSize: 13, color: T.sub, lineHeight: 1.7 }}>
              {step.description}
            </Typography>

            {/* Expand toggle */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={0.5}
              onClick={() => setExpanded(e => !e)}
              sx={{ mt: 1.5, cursor: "pointer", width: "fit-content",
                color: step.color, "&:hover": { opacity: 0.75 } }}
            >
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>
                {expanded ? "Voir moins" : "Détails techniques"}
              </Typography>
              {expanded
                ? <KeyboardArrowUp sx={{ fontSize: 16 }} />
                : <KeyboardArrowDown sx={{ fontSize: 16 }} />}
            </Stack>
          </Box>
        </Stack>

        {/* Expandable details */}
        <Collapse in={expanded}>
          <Box sx={{ mt: 2, pt: 2, borderTop: `1px solid ${T.border}` }}>
            <Stack spacing={1}>
              {step.details.map((d, i) => (
                <Stack key={i} direction="row" spacing={1} alignItems="flex-start">
                  <CheckCircleOutlined sx={{ fontSize: 15, color: step.color, mt: "1px", flexShrink: 0 }} />
                  <Typography sx={{ fontSize: 12.5, color: T.sub, lineHeight: 1.5 }}>{d}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Collapse>
      </Box>
    </Paper>
  );
}

// ── PROBLEM ROW ───────────────────────────────────────────────────────────────
function ProblemRow({ item, index }) {
  return (
    <Box sx={{
      display: "grid",
      gridTemplateColumns: "1fr 40px 1fr",
      gap: 1.5,
      alignItems: "center",
      py: 1.5,
      borderBottom: `1px solid ${T.border}`,
      "&:last-child": { borderBottom: "none" },
    }}>
      {/* Problem */}
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Avatar sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: alpha("#dc2626", 0.1), color: "#dc2626", flexShrink: 0 }}>
          <WarningAmberOutlined sx={{ fontSize: 15 }} />
        </Avatar>
        <Typography sx={{ fontSize: 13, color: T.sub, lineHeight: 1.5, pt: "3px" }}>
          {item.problem}
        </Typography>
      </Stack>

      {/* Arrow */}
      <Typography sx={{ fontSize: 18, color: T.muted, textAlign: "center" }}>→</Typography>

      {/* Solution */}
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Avatar sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: alpha(T.green, 0.1), color: T.green, flexShrink: 0 }}>
          <CheckCircleOutlined sx={{ fontSize: 15 }} />
        </Avatar>
        <Typography sx={{ fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.5, pt: "3px" }}>
          {item.solution}
        </Typography>
      </Stack>
    </Box>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function Processus() {
  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: T.bg,
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      p: { xs: 2, md: 3 },
    }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>

        {/* ── HERO HEADER ── */}
        <Paper elevation={0} sx={{
          mb: 4, borderRadius: "24px", overflow: "hidden",
          border: `1px solid ${T.border}`,
        }}>
          <Box sx={{ height: 5, background: `linear-gradient(90deg, ${T.greenDk}, ${T.green}, #4ade80, ${T.blue})` }} />
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>

              <Box sx={{
                width: 64, height: 64, borderRadius: "18px", flexShrink: 0,
                background: `linear-gradient(135deg, ${T.greenDk}, ${T.green})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 6px 20px ${alpha(T.green, 0.35)}`,
              }}>
                <WaterOutlined sx={{ fontSize: 32, color: "white" }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                  <Chip label="ORMVAM" size="small" sx={{ bgcolor: T.greenLt, color: T.green, fontWeight: 700, fontSize: 10, border: `1px solid ${T.greenBd}` }} />
                  <Chip label="E-Irrigation" size="small" sx={{ bgcolor: T.blueLt, color: T.blue, fontWeight: 700, fontSize: 10, border: `1px solid ${alpha(T.blue, 0.2)}` }} />
                  <Chip label="v1.0" size="small" sx={{ bgcolor: T.bg, color: T.muted, fontWeight: 600, fontSize: 10, border: `1px solid ${T.border}` }} />
                </Stack>
                <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, color: T.text, lineHeight: 1.1, mb: 1 }}>
                  Guide d'utilisation
                </Typography>
                <Typography sx={{ fontSize: 14, color: T.sub, lineHeight: 1.7, maxWidth: 620 }}>
                  Plateforme numérique de gestion des dossiers d'irrigation et de conception hydraulique 
                  au sein de l'Office Régional de Mise en Valeur Agricole de la Moulouya.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* ── MISSION STATEMENT ── */}
        <Paper elevation={0} sx={{
          mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px",
          border: `1px solid ${T.greenBd}`, bgcolor: T.greenLt,
        }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: alpha(T.green, 0.15), color: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: "2px" }}>
              <LightbulbOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: T.greenDk, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>
                Mission de la plateforme
              </Typography>
              <Typography sx={{ fontSize: 14, color: T.sub, lineHeight: 1.8 }}>
                <strong style={{ color: T.text }}>E-Irrigation</strong> centralise la gestion des dossiers d'aménagement 
                hydro-agricole, automatise les calculs hydrauliques de conception des systèmes d'irrigation 
                goutte-à-goutte, et facilite la collaboration entre les agents de terrain et les responsables 
                de l'ORMVAM. L'objectif est de réduire les délais de traitement, éliminer les erreurs de 
                calcul manuels et garantir une traçabilité complète de chaque dossier bénéficiaire.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ── STEP BY STEP ── */}
        <Box mb={4}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
            <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: T.greenLt, color: T.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AgricultureOutlined sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1 }}>
                Processus d'utilisation
              </Typography>
              <Typography sx={{ fontSize: 12, color: T.muted, mt: "2px" }}>
                6 étapes de la connexion à la validation finale
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2.5}>
            {STEPS.map((step, i) => (
              <Grid item xs={12} md={6} key={i}>
                <StepCard step={step} index={i} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* ── FLOW DIAGRAM ── */}
        <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.text, mb: 2.5 }}>
            Flux de navigation
          </Typography>

          <Box sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            overflowX: "auto",
            pb: 1,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: T.border, borderRadius: 2 },
          }}>
            {[
              { label: "Connexion", color: T.blue },
              { label: "Tableau de bord", color: T.green },
              { label: "Liste dossiers", color: T.green },
              { label: "Détail dossier", color: T.amber },
              { label: "Conception", color: T.violet },
              { label: "Résultats", color: T.cyan },
            ].map((node, i, arr) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Box sx={{
                  px: 1.8, py: 0.9,
                  borderRadius: "10px",
                  bgcolor: alpha(node.color, 0.1),
                  border: `1px solid ${alpha(node.color, 0.25)}`,
                  color: node.color,
                }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
                    {node.label}
                  </Typography>
                </Box>
                {i < arr.length - 1 && (
                  <Typography sx={{ fontSize: 16, color: T.muted }}>→</Typography>
                )}
              </Stack>
            ))}
          </Box>

          <Divider sx={{ my: 2, borderColor: T.border }} />

          {/* Branch logic */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="flex-start">
            <Box sx={{ flex: 1, p: 2, borderRadius: "12px", bgcolor: T.greenLt, border: `1px solid ${T.greenBd}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                Conception existante
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: T.sub }}>
                Bouton <strong>"Visionner la Conception"</strong> → affiche les résultats enregistrés
              </Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, borderRadius: "12px", bgcolor: T.amberLt, border: `1px solid ${alpha(T.amber, 0.3)}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.amber, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>
                Pas de conception
              </Typography>
              <Typography sx={{ fontSize: 12.5, color: T.sub }}>
                Bouton <strong>"Lancer la Conception"</strong> → formulaire de calcul hydraulique
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* ── PROBLEMS & SOLUTIONS ── */}
        <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: T.amberLt, color: T.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUpOutlined sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1 }}>
                Problèmes résolus
              </Typography>
              <Typography sx={{ fontSize: 12, color: T.muted, mt: "2px" }}>
                Avant vs après E-Irrigation
              </Typography>
            </Box>
          </Stack>

          {PROBLEMS.map((item, i) => (
            <ProblemRow key={i} item={item} index={i} />
          ))}
        </Paper>

        {/* ── FOOTER NOTE ── */}
        <Box sx={{ textAlign: "center", py: 3 }}>
          <Typography sx={{ fontSize: 12, color: T.muted, lineHeight: 1.8 }}>
            ORMVAM · Office Régional de Mise en Valeur Agricole de la Moulouya<br />
            Système E-Irrigation v1.0 · Gestion numérique des dossiers d'irrigation
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}