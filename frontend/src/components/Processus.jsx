import { useState } from "react";
import {
  Box, Typography, Stack, Chip, Divider,
  Grid, Paper, Avatar, Collapse,
} from "@mui/material";
import {
  LoginOutlined, FolderOpenOutlined, EngineeringOutlined,
  BarChartOutlined, SaveOutlined, ChatBubbleOutlineRounded,
  CheckCircleOutlined, WaterOutlined, AgricultureOutlined,
  KeyboardArrowDown, KeyboardArrowUp, LightbulbOutlined,
  WarningAmberOutlined, TrendingUpOutlined, GroupsOutlined,
  UploadFileOutlined, ManageAccountsOutlined, DeleteOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

const T = {
  bg: "#f8fafc", surface: "#ffffff", border: "#e2e8f0",
  green: "#16a34a", greenDk: "#14532d", greenLt: "#f0fdf4", greenBd: "#bbf7d0",
  blue: "#2563eb", blueLt: "#eff6ff",
  amber: "#d97706", amberLt: "#fffbeb",
  violet: "#7c3aed", violetLt: "#f5f3ff",
  cyan: "#0891b2", cyanLt: "#ecfeff",
  text: "#0f172a", sub: "#475569", muted: "#94a3b8",
};

const STEPS = [
  {
    number: "01", icon: <LoginOutlined />, color: T.blue, bg: T.blueLt,
    title: "Connexion sécurisée", subtitle: "Authentification par rôle",
    description: "L'accès est réservé aux agents, administrateurs, sociétés partenaires et agriculteurs. Chaque utilisateur se connecte avec ses identifiants. Le système attribue automatiquement les droits selon le rôle.",
    details: [
      "Email + mot de passe chiffré bcrypt",
      "Session JWT valide 8 heures, déconnexion automatique",
      "4 rôles : admin, agent, company, farmer",
      "Permissions distinctes par rôle (RBAC)",
    ],
  },
  {
    number: "02", icon: <FolderOpenOutlined />, color: T.green, bg: T.greenLt,
    title: "Création du dossier", subtitle: "Enregistrement du bénéficiaire",
    description: "L'agent ou l'admin saisit les informations du bénéficiaire : identité, superficie, culture, CMV, données financières, téléphone société et phase administrative. Le nom est généré automatiquement.",
    details: [
      "Nom automatique : DOS_{CIN}_{Année}",
      "Validation des champs obligatoires",
      "Calcul auto invest./ha et % subvention",
      "Téléphone société lié à la messagerie du dossier",
      "Upload PDF vers Supabase Storage",
      "Données persistées en Supabase PostgreSQL",
    ],
  },
  {
    number: "03", icon: <UploadFileOutlined />, color: T.cyan, bg: T.cyanLt,
    title: "Documents & mise à jour", subtitle: "Gestion des pièces jointes",
    description: "Les dossiers peuvent être modifiés à tout moment. Les documents PDF existants restent accessibles. De nouveaux fichiers peuvent être ajoutés lors de la modification. Chaque fichier est stocké avec son URL publique.",
    details: [
      "Modification de tous les champs du dossier",
      "Documents existants affichés avec lien direct",
      "Ajout de nouveaux PDF lors de la modification",
      "Stockage Supabase Storage avec noms sanitisés",
      "Support des noms de fichiers en arabe et caractères spéciaux",
    ],
  },
  {
    number: "04", icon: <EngineeringOutlined />, color: T.amber, bg: T.amberLt,
    title: "Conception hydraulique", subtitle: "Calcul du système d'irrigation",
    description: "L'agent, l'admin ou la société lance la conception depuis le dossier. Le moteur calcule les besoins en eau, dimensionne les goutteurs, rampes, porte-rampes, conduites, pompes et bassin de stockage.",
    details: [
      "Besoins en eau : ET0 × Kc / Kr",
      "Dimensionnement des rampes (Darcy-Weisbach)",
      "Calcul HMT pompe bassin et forage",
      "Volume et autonomie du bassin de stockage",
      "Sauvegarde automatique liée au dossier (folder_id)",
      "1 dossier = 1 conception (règle métier)",
    ],
  },
  {
    number: "05", icon: <BarChartOutlined />, color: T.violet, bg: T.violetLt,
    title: "Visualisation des résultats", subtitle: "Fiche technique + graphiques",
    description: "Les résultats s'affichent en deux modes : fiche technique par section (besoins, distributeurs, rampes, pompes, bassin) et vue graphiques avec diagrammes interactifs. Export PDF intégré via le navigateur.",
    details: [
      "Vue Tableau — 9 sections structurées",
      "Vue Graphiques — diagrammes recharts interactifs",
      "Profil de pression le long des rampes et porte-rampes",
      "Export PDF via impression navigateur",
      "Suppression conception par admin, agent et société",
    ],
  },
  {
    number: "06", icon: <ChatBubbleOutlineRounded />, color: T.green, bg: T.greenLt,
    title: "Messagerie par dossier", subtitle: "Communication agent ↔ société",
    description: "Chaque dossier dispose d'un fil de discussion privé entre l'équipe ORMVAM et la société partenaire identifiée par son numéro de téléphone. Les messages peuvent contenir des pièces jointes PDF.",
    details: [
      "Un BacklogBox unique par dossier",
      "Société identifiée par numéro de téléphone",
      "Envoi de texte et fichiers PDF dans les messages",
      "Admin et agents voient tous les fils de discussion",
      "Société voit uniquement ses propres conversations",
      "Bulles alignées par rôle expéditeur",
    ],
  },
  {
    number: "07", icon: <ManageAccountsOutlined />, color: T.blue, bg: T.blueLt,
    title: "Gestion des comptes", subtitle: "Administration des utilisateurs",
    description: "L'administrateur crée les comptes utilisateurs depuis le portail d'administration. Chaque compte est assigné à un rôle précis. Les sociétés utilisent leur numéro de téléphone comme identifiant unique.",
    details: [
      "Création de comptes : admin, agent, company, farmer",
      "Société : user_id = numéro de téléphone",
      "Champs conditionnels selon le rôle (CIN, téléphone)",
      "Accès RBAC appliqué dès la création",
    ],
  },
  {
    number: "08", icon: <DeleteOutlined />, color: "#dc2626", bg: "#fef2f2",
    title: "Suppression en cascade", subtitle: "Intégrité des données garantie",
    description: "La suppression d'un dossier entraîne automatiquement la suppression de tous ses éléments liés : documents PDF (Supabase Storage + DB), conception hydraulique et fil de messagerie.",
    details: [
      "Suppression réservée aux administrateurs",
      "Cascade : documents + conception + backlog",
      "Fichiers supprimés du Supabase Storage",
      "Confirmation obligatoire avant suppression",
      "Irréversible — aucun retour en arrière possible",
    ],
  },
];

const PROBLEMS = [
  { problem: "Calculs hydrauliques manuels sur Excel",              solution: "Moteur de calcul automatisé, résultats en secondes",                         icon: <EngineeringOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Dossiers papier dispersés et introuvables",           solution: "Base Supabase PostgreSQL centralisée, recherche instantanée",                icon: <FolderOpenOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Documents PDF perdus ou non archivés",                solution: "Upload automatique Supabase Storage avec URL publique persistante",          icon: <UploadFileOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Communication par téléphone non tracée",              solution: "Messagerie intégrée par dossier avec pièces jointes conservées",             icon: <ChatBubbleOutlineRounded sx={{ fontSize: 18 }} /> },
  { problem: "Aucune traçabilité sur les modifications",            solution: "Historique horodaté sur dossiers, conceptions et messages",                  icon: <WarningAmberOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Accès non contrôlé aux données sensibles",            solution: "JWT + RBAC : 4 rôles avec permissions strictement distinctes",               icon: <GroupsOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Société sans visibilité sur ses dossiers",            solution: "Espace société : accès uniquement aux dossiers liés à son téléphone",        icon: <TrendingUpOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Suppression accidentelle de données liées",           solution: "Suppression cascade sécurisée : documents + conception + messagerie",        icon: <DeleteOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Noms de fichiers arabes causant des erreurs",         solution: "Sanitisation automatique des noms avant upload Supabase",                    icon: <UploadFileOutlined sx={{ fontSize: 18 }} /> },
  { problem: "Données perdues à chaque redémarrage du serveur",     solution: "Migration JSON → Supabase PostgreSQL + Storage, données persistantes",      icon: <SaveOutlined sx={{ fontSize: 18 }} /> },
];

function StepCard({ step }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${T.border}`, borderRadius: "18px", overflow: "hidden", bgcolor: T.surface, transition: "box-shadow 0.18s", "&:hover": { boxShadow: `0 6px 24px ${alpha(step.color, 0.1)}` } }}>
      <Box sx={{ height: 3, bgcolor: step.color, opacity: 0.8 }} />
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ width: 44, height: 44, borderRadius: "12px", flexShrink: 0, bgcolor: alpha(step.color, 0.12), color: step.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {step.icon}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={0.3}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, color: step.color, fontFamily: "monospace", letterSpacing: "0.08em" }}>{step.number}</Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: "50%", bgcolor: T.border }} />
              <Typography sx={{ fontSize: 12, color: T.muted, fontWeight: 600 }}>{step.subtitle}</Typography>
            </Stack>
            <Typography sx={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1.2, mb: 1 }}>{step.title}</Typography>
            <Typography sx={{ fontSize: 13, color: T.sub, lineHeight: 1.7 }}>{step.description}</Typography>
            <Stack direction="row" alignItems="center" spacing={0.5} onClick={() => setExpanded(e => !e)}
              sx={{ mt: 1.5, cursor: "pointer", width: "fit-content", color: step.color, "&:hover": { opacity: 0.75 } }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700 }}>{expanded ? "Voir moins" : "Détails techniques"}</Typography>
              {expanded ? <KeyboardArrowUp sx={{ fontSize: 16 }} /> : <KeyboardArrowDown sx={{ fontSize: 16 }} />}
            </Stack>
          </Box>
        </Stack>
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

function ProblemRow({ item }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 1.5, alignItems: "center", py: 1.5, borderBottom: `1px solid ${T.border}`, "&:last-child": { borderBottom: "none" } }}>
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Avatar sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: alpha("#dc2626", 0.1), color: "#dc2626", flexShrink: 0 }}>
          <WarningAmberOutlined sx={{ fontSize: 15 }} />
        </Avatar>
        <Typography sx={{ fontSize: 13, color: T.sub, lineHeight: 1.5, pt: "3px" }}>{item.problem}</Typography>
      </Stack>
      <Typography sx={{ fontSize: 18, color: T.muted, textAlign: "center" }}>→</Typography>
      <Stack direction="row" spacing={1.2} alignItems="flex-start">
        <Avatar sx={{ width: 28, height: 28, borderRadius: "8px", bgcolor: alpha(T.green, 0.1), color: T.green, flexShrink: 0 }}>
          <CheckCircleOutlined sx={{ fontSize: 15 }} />
        </Avatar>
        <Typography sx={{ fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.5, pt: "3px" }}>{item.solution}</Typography>
      </Stack>
    </Box>
  );
}

export default function Processus() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", p: { xs: 2, md: 3 } }}>
      <Box sx={{ maxWidth: 1100, mx: "auto" }}>

        {/* HERO */}
        <Paper elevation={0} sx={{ mb: 4, borderRadius: "24px", overflow: "hidden", border: `1px solid ${T.border}` }}>
          <Box sx={{ height: 5, background: `linear-gradient(90deg, ${T.greenDk}, ${T.green}, #4ade80, ${T.blue})` }} />
          <Box sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }}>
              <Box sx={{ width: 64, height: 64, borderRadius: "18px", flexShrink: 0, background: `linear-gradient(135deg, ${T.greenDk}, ${T.green})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 6px 20px ${alpha(T.green, 0.35)}` }}>
                <WaterOutlined sx={{ fontSize: 32, color: "white" }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" spacing={1} mb={1} flexWrap="wrap">
                  <Chip label="ORMVAM" size="small" sx={{ bgcolor: T.greenLt, color: T.green, fontWeight: 700, fontSize: 10, border: `1px solid ${T.greenBd}` }} />
                  <Chip label="E-Irrigation" size="small" sx={{ bgcolor: T.blueLt, color: T.blue, fontWeight: 700, fontSize: 10, border: `1px solid ${alpha(T.blue, 0.2)}` }} />
                  <Chip label="v1.0" size="small" sx={{ bgcolor: T.bg, color: T.muted, fontWeight: 600, fontSize: 10, border: `1px solid ${T.border}` }} />
                </Stack>
                <Typography sx={{ fontSize: { xs: 22, md: 28 }, fontWeight: 900, color: T.text, lineHeight: 1.1, mb: 1 }}>Guide d'utilisation</Typography>
                <Typography sx={{ fontSize: 14, color: T.sub, lineHeight: 1.7, maxWidth: 620 }}>
                  Plateforme numérique de gestion des dossiers d'irrigation et de conception hydraulique au sein de l'Office Régional de Mise en Valeur Agricole de la Moulouya.
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Paper>

        {/* MISSION */}
        <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.greenBd}`, bgcolor: T.greenLt }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start">
            <Box sx={{ width: 36, height: 36, borderRadius: "10px", bgcolor: alpha(T.green, 0.15), color: T.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, mt: "2px" }}>
              <LightbulbOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 800, color: T.greenDk, textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>Mission de la plateforme</Typography>
              <Typography sx={{ fontSize: 14, color: T.sub, lineHeight: 1.8 }}>
                <strong style={{ color: T.text }}>E-Irrigation</strong> centralise la gestion des dossiers d'aménagement hydro-agricole, automatise les calculs hydrauliques de conception des systèmes d'irrigation goutte-à-goutte, facilite la communication entre agents et sociétés partenaires, et garantit une traçabilité complète de chaque dossier. Toutes les données sont stockées sur <strong style={{ color: T.text }}>Supabase PostgreSQL</strong> avec les fichiers PDF sur <strong style={{ color: T.text }}>Supabase Storage</strong>.
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* STEPS */}
        <Box mb={4}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
            <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: T.greenLt, color: T.green, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AgricultureOutlined sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1 }}>Processus d'utilisation</Typography>
              <Typography sx={{ fontSize: 12, color: T.muted, mt: "2px" }}>8 étapes de la connexion à la suppression sécurisée</Typography>
            </Box>
          </Stack>
          <Grid container spacing={2.5}>
            {STEPS.map((step, i) => (
              <Grid item xs={12} md={6} key={i}>
                <StepCard step={step} />
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* FLOW */}
        <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.text, mb: 2.5 }}>Flux de navigation</Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflowX: "auto", pb: 1, "&::-webkit-scrollbar": { height: 4 }, "&::-webkit-scrollbar-thumb": { bgcolor: T.border, borderRadius: 2 } }}>
            {[
              { label: "Connexion",       color: T.blue   },
              { label: "Tableau de bord", color: T.green  },
              { label: "Liste dossiers",  color: T.green  },
              { label: "Détail dossier",  color: T.amber  },
              { label: "Modifier",        color: T.cyan   },
              { label: "Conception",      color: T.violet },
              { label: "Résultats",       color: T.violet },
              { label: "Messagerie",      color: T.green  },
            ].map((node, i, arr) => (
              <Stack key={i} direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Box sx={{ px: 1.8, py: 0.9, borderRadius: "10px", bgcolor: alpha(node.color, 0.1), border: `1px solid ${alpha(node.color, 0.25)}`, color: node.color }}>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{node.label}</Typography>
                </Box>
                {i < arr.length - 1 && <Typography sx={{ fontSize: 16, color: T.muted }}>→</Typography>}
              </Stack>
            ))}
          </Box>

          <Divider sx={{ my: 2, borderColor: T.border }} />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Box sx={{ flex: 1, p: 2, borderRadius: "12px", bgcolor: T.greenLt, border: `1px solid ${T.greenBd}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.green, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>Conception existante</Typography>
              <Typography sx={{ fontSize: 12.5, color: T.sub }}>Bouton <strong>"Conception"</strong> → Vue Tableau ou Vue Graphiques + Supprimer</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, borderRadius: "12px", bgcolor: T.amberLt, border: `1px solid ${alpha(T.amber, 0.3)}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.amber, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>Pas de conception</Typography>
              <Typography sx={{ fontSize: 12.5, color: T.sub }}>Bouton <strong>"Conception"</strong> → formulaire de calcul hydraulique</Typography>
            </Box>
            <Box sx={{ flex: 1, p: 2, borderRadius: "12px", bgcolor: "#eff6ff", border: `1px solid ${alpha(T.blue, 0.25)}` }}>
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: T.blue, textTransform: "uppercase", letterSpacing: "0.07em", mb: 0.5 }}>Messagerie</Typography>
              <Typography sx={{ fontSize: 12.5, color: T.sub }}>Bouton <strong>"Messages"</strong> → fil de discussion agent ↔ société</Typography>
            </Box>
          </Stack>
        </Paper>

        {/* PROBLEMS */}
        <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
          <Stack direction="row" alignItems="center" spacing={1.5} mb={2.5}>
            <Box sx={{ width: 32, height: 32, borderRadius: "9px", bgcolor: T.amberLt, color: T.amber, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <TrendingUpOutlined sx={{ fontSize: 17 }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.text, lineHeight: 1 }}>Problèmes résolus</Typography>
              <Typography sx={{ fontSize: 12, color: T.muted, mt: "2px" }}>Avant vs après E-Irrigation</Typography>
            </Box>
          </Stack>
          {PROBLEMS.map((item, i) => <ProblemRow key={i} item={item} />)}
        </Paper>

        {/* STACK TECHNIQUE */}
        <Paper elevation={0} sx={{ mb: 4, p: { xs: 2.5, md: 3 }, borderRadius: "20px", border: `1px solid ${T.border}`, bgcolor: T.surface }}>
          <Typography sx={{ fontSize: 14, fontWeight: 800, color: T.text, mb: 2 }}>Stack technique</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
            {[
              { label: "Frontend",  value: "React + MUI",          color: T.blue   },
              { label: "Backend",   value: "Python Flask",          color: T.amber  },
              { label: "Base de données", value: "Supabase PostgreSQL", color: T.green  },
              { label: "Stockage fichiers", value: "Supabase Storage", color: T.cyan   },
              { label: "Auth",      value: "JWT + bcrypt",          color: T.violet },
              { label: "Déploiement", value: "Netlify + Render",    color: T.green  },
            ].map((item, i) => (
              <Box key={i} sx={{ bgcolor: T.bg, borderRadius: "8px", p: "12px 14px", borderLeft: `2px solid ${item.color}` }}>
                <Typography sx={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: "4px" }}>{item.label}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: T.text }}>{item.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* FOOTER */}
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