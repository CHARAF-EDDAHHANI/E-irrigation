import { useState, useEffect } from "react";
import {
  Box, Typography, Stack, Avatar, Chip, CircularProgress,
  Alert, InputAdornment, TextField, Badge,
} from "@mui/material";
import {
  ChatBubbleOutlineRounded, SearchOutlined,
  FolderOutlined, AccessTimeOutlined, PersonOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

import { fetchbacklogboxs } from "../Axios/backLogAxios";
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
  blue:    "#2563eb",
  blueLt:  "#eff6ff",
  text:    "#0f172a",
  sub:     "#475569",
  muted:   "#94a3b8",
  hover:   "#f1f5f9",
};

// ── TIME FORMAT ───────────────────────────────────────────────────────────────
const fmtTime = (iso) => {
  if (!iso) return "";
  try {
    const d    = new Date(iso);
    const now  = new Date();
    const diff = (now - d) / 1000;
    if (diff < 60)    return "à l'instant";
    if (diff < 3600)  return `${Math.floor(diff / 60)}min`;
    if (diff < 86400) return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    if (diff < 604800) return d.toLocaleDateString("fr-FR", { weekday: "short" });
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
  } catch { return ""; }
};

// ── AVATAR COLOR from string ──────────────────────────────────────────────────
const AVATAR_COLORS = ["#2563eb","#16a34a","#d97706","#7c3aed","#0891b2","#dc2626"];
const avatarColor = (str = "") =>
  AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length];

// ── BACKLOG ITEM ROW ──────────────────────────────────────────────────────────
function BacklogRow({ box, folders = [], isActive, onClick }) {

  // 1. CE LOG VA TOUT AFFICHER DANS L'INSPECTEUR (CONSOLE)
  console.log("=== INSPECTEUR BACKLOGROW ===");
  console.log("Ma boîte actuelle (box) :", box);
  console.log("Liste de tous les dossiers (folders) reçus :", folders);

  const currentFolder = folders.find(f => f.folder_id === box.folder_id);
  
  const folderName = currentFolder?.folder_name || box.folder_name || box.folder_id || "Dossier Inconnu";

  const lastMsg   = box.messages?.[box.messages.length - 1];
  const unread    = box.unread_count || 0;
  
  const initial   = folderName[0].toUpperCase();
  const col       = avatarColor(box.folder_id || "");

  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex", alignItems: "center", gap: 1.5,
        px: 2, py: 1.5,
        cursor: "pointer",
        bgcolor: isActive ? alpha(T.green, 0.06) : "transparent",
        borderLeft: `3px solid ${isActive ? T.green : "transparent"}`,
        borderBottom: `1px solid ${T.border}`,
        transition: "all 0.12s",
        "&:hover": {
          bgcolor: isActive ? alpha(T.green, 0.08) : T.hover,
          borderLeftColor: isActive ? T.green : alpha(T.green, 0.4),
        },
      }}
    >
      {/* Avatar */}
      <Badge
        badgeContent={unread}
        color="error"
        max={9}
        invisible={unread === 0}
        sx={{ "& .MuiBadge-badge": { fontSize: 10, minWidth: 18, height: 18 } }}
      >
        <Avatar sx={{
          width: 42, height: 42, borderRadius: "12px", flexShrink: 0,
          bgcolor: alpha(col, 0.15), color: col,
          fontSize: 15, fontWeight: 800,
          border: isActive ? `2px solid ${T.green}` : `2px solid transparent`,
          transition: "border 0.12s",
        }}>
          {initial}
        </Avatar>
      </Badge>

     {/* Content */}
<Box sx={{ flex: 1, minWidth: 0 }}>
  {/* Ligne 1 : Le nom du dossier */}
  <Typography sx={{
    fontSize: 13, 
    fontWeight: unread > 0 ? 800 : 600,
    color: T.text, 
    overflow: "hidden", 
    textOverflow: "ellipsis", 
    whiteSpace: "nowrap",
    mb: "2px" // Un petit espace sous le nom
  }}>
    {folderName}
  </Typography>

  {/* Ligne 2 : Le dernier message et le rôle */}
  <Typography sx={{
    fontSize: 12, 
    color: unread > 0 ? T.sub : T.muted,
    fontWeight: unread > 0 ? 600 : 400,
    overflow: "hidden", 
    textOverflow: "ellipsis", 
    whiteSpace: "nowrap",
    mb: "4px" // Un petit espace sous le message
  }}>
    {lastMsg ? (
      (() => {
        if (lastMsg.sender_name) return `${lastMsg.sender_name}: ${lastMsg.content}`;
        const roleLabels = {
          admin: "Admin",
          agent: "Agent",
          company: "Société",
          farmer: "Agriculteur"
        };
        
        const role = roleLabels[lastMsg.sender_type] || "Utilisateur";
        return `${role}: ${lastMsg.content}`;
      })()
    ) : (
      "Aucun message"
    )}
  </Typography>

  {/* Ligne 3 : L'heure du message */}
  <Typography sx={{ fontSize: 10.5, color: T.muted, display: "block" }}>
    {fmtTime(lastMsg?.created_at || box.created_at)}
  </Typography>
</Box>

    </Box>
  );
}


// ── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, gap: 1.5, opacity: 0.75 }}>
      <Box sx={{
        width: 56, height: 56, borderRadius: "16px",
        bgcolor: T.greenLt, border: `1px solid ${T.greenBd}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ChatBubbleOutlineRounded sx={{ fontSize: 26, color: T.green }} />
      </Box>
      <Typography sx={{ fontSize: 14, fontWeight: 700, color: T.sub }}>
        {search ? "Aucun résultat" : "Aucune discussion"}
      </Typography>
      <Typography sx={{ fontSize: 12, color: T.muted, textAlign: "center", lineHeight: 1.5 }}>
        {search
          ? "Essayez un autre terme de recherche"
          : "Les discussions apparaîtront ici lorsque vous ouvrirez la messagerie d'un dossier."}
      </Typography>
    </Stack>
  );
}

// ── CHAT PLACEHOLDER ──────────────────────────────────────────────────────────
function SelectPrompt() {
  return (
    <Stack alignItems="center" justifyContent="center" sx={{ flex: 1, gap: 2, opacity: 0.6 }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: "20px",
        bgcolor: T.greenLt, border: `1px solid ${T.greenBd}`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <ChatBubbleOutlineRounded sx={{ fontSize: 34, color: T.green }} />
      </Box>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.sub }}>
          Sélectionnez une discussion
        </Typography>
        <Typography sx={{ fontSize: 13, color: T.muted, mt: 0.5 }}>
          Cliquez sur un dossier pour lire et envoyer des messages
        </Typography>
      </Box>
    </Stack>
  );
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
export default function AllBacklogboxs({ currentUser, folders = [] }) {
  const [backlogs,    setBacklogs]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [search,      setSearch]      = useState("");
  const [activeBox,   setActiveBox]   = useState(null);  
  const [drawerOpen,  setDrawerOpen]  = useState(false);
    console.log("Liste 44444 de tous les dossiers (folders) reçus :", folders);


  useEffect(() => {
    fetchbacklogboxs()
      .then(data => setBacklogs(Array.isArray(data) ? data : []))
      .catch(err  => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = backlogs.filter(b =>
    !search ||
    b.folder_name?.toLowerCase().includes(search.toLowerCase()) ||
    b.folder_id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalUnread = backlogs.reduce((sum, b) => sum + (b.unread_count || 0), 0);

  const handleSelect = (box) => {
    setActiveBox(box.backlogbox_id);
    setDrawerOpen(true);
  };

  return (
    <Box sx={{
      display: "flex",
      height: "100vh",
      bgcolor: T.bg,
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      overflow: "hidden",
    }}>

      {/* ── LEFT PANEL — inbox list ── */}
      <Box sx={{
        width: { xs: "100%", md: 340 },
        flexShrink: 0,
        bgcolor: T.surface,
        borderRight: `1px solid ${T.border}`,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}>

        {/* Header */}
        <Box sx={{ px: 2.5, pt: 2.5, pb: 2, borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: `linear-gradient(135deg, ${T.greenDk}, ${T.green})`,
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: `0 3px 10px ${alpha(T.green, 0.3)}`,
              }}>
                <ChatBubbleOutlineRounded sx={{ fontSize: 17, color: "white" }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: T.text, lineHeight: 1 }}>
                  Messagerie
                </Typography>
                <Typography sx={{ fontSize: 11, color: T.muted, mt: "1px" }}>
                  {backlogs.length} fil{backlogs.length !== 1 ? "s" : ""}
                </Typography>
              </Box>
            </Stack>

            {totalUnread > 0 && (
              <Chip
                label={`${totalUnread} non lu${totalUnread > 1 ? "s" : ""}`}
                size="small"
                sx={{ bgcolor: alpha("#dc2626", 0.1), color: "#dc2626", fontWeight: 700, fontSize: 11, border: `1px solid ${alpha("#dc2626", 0.2)}` }}
              />
            )}
          </Stack>

          {/* Search */}
          <TextField
            fullWidth
            size="small"
            placeholder="Rechercher un dossier…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 16, color: T.muted }} /></InputAdornment>,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px", fontSize: 13, bgcolor: T.bg,
                "& fieldset": { borderColor: T.border },
                "&:hover fieldset": { borderColor: "#94a3b8" },
                "&.Mui-focused fieldset": { borderColor: T.green },
              },
            }}
          />
        </Box>

        {/* List body */}
        <Box sx={{ flex: 1, overflowY: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": { bgcolor: T.border, borderRadius: 2 },
        }}>

          {loading && (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8, gap: 1.5 }}>
              <CircularProgress size={28} sx={{ color: T.green }} />
              <Typography sx={{ fontSize: 12, color: T.muted }}>Chargement...</Typography>
            </Stack>
          )}

          {!loading && error && (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ borderRadius: "12px", fontSize: 12 }}>{error}</Alert>
            </Box>
          )}

          {!loading && !error && filtered.length === 0 && (
            <Box sx={{ display: "flex", height: 300 }}>
              <EmptyState search={search} />
            </Box>
          )}

          {!loading && !error && filtered.map(box => (
            <BacklogRow
              key={box.backlog_id || box.folder_id}
              box={box}
              folders={folders} 
              isActive={activeBox === box.backlogbox_id}
              onClick={() => handleSelect(box)}
            />
          ))}
        </Box>

        {/* Footer — current user */}
        {currentUser && (
          <Box sx={{
            px: 2, py: 1.5, borderTop: `1px solid ${T.border}`, flexShrink: 0,
            bgcolor: T.bg, display: "flex", alignItems: "center", gap: 1.2,
          }}>
            <Avatar sx={{
              width: 28, height: 28, borderRadius: "8px", fontSize: 11, fontWeight: 700,
              bgcolor: alpha(T.green, 0.15), color: T.green,
            }}>
              {(currentUser.fullName || "?")[0].toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.fullName || "Utilisateur"}
              </Typography>
              <Typography sx={{ fontSize: 10, color: T.muted }}>{currentUser.role}</Typography>
            </Box>
            <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: T.green, flexShrink: 0 }} />
          </Box>
        )}
      </Box>

      {/* ── RIGHT PANEL — placeholder when no chat open on desktop ── */}
      <Box sx={{
        flex: 1,
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: T.bg,
      }}>
        {activeBox ? (
          // Show folder info while drawer is open
          <Stack alignItems="center" gap={2} sx={{ opacity: 0.5 }}>
            <FolderOutlined sx={{ fontSize: 48, color: T.muted }} />
            <Typography sx={{ fontSize: 14, color: T.muted }}>
              {activeBox.folder_name || activeBox.folder_id}
            </Typography>
          </Stack>
        ) : (
          <SelectPrompt />
        )}
      </Box>
      {/* ── CHAT DRAWER ── */}
        <ChatDrawer 
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          currentUser={currentUser}
          folder={folders.find(f => f.folder_id === backlogs.find(b => b.backlogbox_id === activeBox)?.folder_id)}
        />
    </Box>
  );
}