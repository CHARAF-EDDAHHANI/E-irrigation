import { useEffect, useState } from "react";
import {
  Box, Card, Typography, Chip, CircularProgress,
  Alert, Grid, InputAdornment, TextField, Stack,
} from "@mui/material";
import {
  ChevronRight, FolderOutlined, SearchOutlined,
  AgricultureOutlined, PersonOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { fetchAllFolders } from "../Axios/folderAxios";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const T = {
  bg:      "#f8fafc",
  surface: "#ffffff",
  border:  "#e2e8f0",
  green:   "#16a34a",
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

const getPhase = (p) => PHASE[p?.toLowerCase()] || { bg: "#f1f5f9", color: "#64748b", label: p || "—" };

export default function FoldersList({ onSelectFolder, onFoldersLoaded }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
  (async () => {
    try {
      const data = await fetchAllFolders();
      const cleanData = data || [];
      setFolders(cleanData);
      
      if (onFoldersLoaded) {
        onFoldersLoaded(cleanData);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  })();
}, [onFoldersLoaded]);


  const filtered = folders.filter(f =>
    !search ||
    f.folder_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.beneficiary_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.crop?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 2 }}>
      <CircularProgress size={32} sx={{ color: T.green }} />
      <Typography sx={{ fontSize: 13, color: T.muted }}>Chargement des dossiers...</Typography>
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error" sx={{ borderRadius: "12px" }}>{error}</Alert>
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: T.bg, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>

      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 2, mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: T.text, lineHeight: 1 }}>
            Tout les dossiers
          </Typography>
          <Typography sx={{ fontSize: 13, color: T.muted, mt: "4px" }}>
            {folders.length} dossier{folders.length !== 1 ? "s" : ""} au total
          </Typography>
        </Box>

        {/* SEARCH */}
        <TextField
          size="small"
          placeholder="Rechercher..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: <InputAdornment position="start"><SearchOutlined sx={{ fontSize: 17, color: T.muted }} /></InputAdornment>,
          }}
          sx={{
            width: { xs: "100%", sm: 240 },
            "& .MuiOutlinedInput-root": {
              borderRadius: "12px", fontSize: 13, bgcolor: T.surface,
              "& fieldset": { borderColor: T.border },
              "&:hover fieldset": { borderColor: "#94a3b8" },
              "&.Mui-focused fieldset": { borderColor: T.green },
            },
          }}
        />
      </Box>

      {/* PHASE SUMMARY PILLS */}
      <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 3, gap: "6px !important" }}>
        {Object.entries(PHASE).map(([key, val]) => {
          const count = folders.filter(f => f.phase?.toLowerCase() === key).length;
          return (
            <Chip key={key} size="small"
              label={`${val.label} · ${count}`}
              onClick={() => setSearch(key)}
              sx={{ bgcolor: val.bg, color: val.color, fontWeight: 600, fontSize: 11,
                border: `1px solid ${alpha(val.color, 0.2)}`, cursor: "pointer",
                "&:hover": { bgcolor: alpha(val.color, 0.18) } }}
            />
          );
        })}
        {search && (
          <Chip size="small" label="Tout afficher" onClick={() => setSearch("")}
            sx={{ fontSize: 11, fontWeight: 600, bgcolor: "#f1f5f9", color: T.sub,
              border: `1px solid ${T.border}`, cursor: "pointer" }} />
        )}
      </Stack>

      {/* EMPTY STATE */}
      {filtered.length === 0 && (
        <Box sx={{ textAlign: "center", py: 10 }}>
          <FolderOutlined sx={{ fontSize: 48, color: T.border, mb: 1.5 }} />
          <Typography sx={{ fontSize: 15, fontWeight: 600, color: T.sub }}>
            Aucun dossier trouvé
          </Typography>
          <Typography sx={{ fontSize: 13, color: T.muted, mt: 0.5 }}>
            {search ? "Essayez un autre terme de recherche" : "Créez votre premier dossier"}
          </Typography>
        </Box>
      )}

      {/* GRID */}
      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
  {filtered.map(fold => {
    const phase = getPhase(fold.phase);
    return (
      <Card
        key={fold.folder_id}
        onClick={() => onSelectFolder(fold.folder_id)}
        elevation={0}
        sx={{
          p: 0,
          borderRadius: "16px",
          border: `1px solid ${T.border}`,
          cursor: "pointer",
          bgcolor: T.surface,
          overflow: "hidden",
          transition: "all 0.18s ease",
          "&:hover": {
            transform: "translateY(-3px)",
            boxShadow: "0 12px 32px rgba(0,0,0,0.09)",
            borderColor: alpha(T.green, 0.35),
          },
        }}
      >
        {/* TOP COLOR BAR */}
        <Box sx={{ height: 3, bgcolor: phase.color, opacity: 0.7 }} />

        <Box sx={{ p: 2.5 }}>
          {/* HEADER ROW */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flex: 1, minWidth: 0 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: "9px", flexShrink: 0,
                bgcolor: alpha(T.green, 0.1),
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <FolderOutlined sx={{ fontSize: 16, color: T.green }} />
              </Box>
              <Typography sx={{
                fontSize: 13, fontWeight: 700, color: T.text,
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}>
                {fold.folder_name}
              </Typography>
            </Box>
            <Chip
              label={phase.label}
              size="small"
              sx={{
                ml: 1, flexShrink: 0,
                bgcolor: phase.bg, color: phase.color,
                fontWeight: 700, fontSize: 10,
                border: `1px solid ${alpha(phase.color, 0.2)}`,
                height: 22,
              }}
            />
          </Box>

          {/* BENEFICIARY */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1 }}>
            <PersonOutlined sx={{ fontSize: 14, color: T.muted }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: T.sub }}>
              {fold.beneficiary_name}
            </Typography>
          </Box>

          {/* META */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 2 }}>
            <AgricultureOutlined sx={{ fontSize: 14, color: T.muted }} />
            <Typography sx={{ fontSize: 12, color: T.muted }}>
              {fold.area ? `${fold.area} ha` : "—"}
              {fold.crop ? ` · ${fold.crop}` : ""}
            </Typography>
          </Box>

          {/* DIVIDER */}
          <Box sx={{ height: "1px", bgcolor: T.border, mx: -2.5, mb: 1.5 }} />

          {/* FOOTER */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography sx={{ fontSize: 11.5, color: T.muted, fontWeight: 500 }}>
              {fold.created_by_name || fold.created_by_user_fullname || "—"}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Typography sx={{ fontSize: 11.5, fontWeight: 600, color: T.green }}>
                Ouvrir
              </Typography>
              <ChevronRight sx={{ fontSize: 15, color: T.green }} />
            </Box>
          </Box>
        </Box>
      </Card>
    );
  })}
</Box>
    </Box>
  );
}