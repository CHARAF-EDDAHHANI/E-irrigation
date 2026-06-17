import { 
  Box, 
  Typography, 
  Button, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Divider
} from "@mui/material";
import { ArrowBack, Download } from "@mui/icons-material";

// ── BRANDING COLOR THEME DESIGN TOKENS ──────────────────────────────────────────
const T = {
  text: "#0f172a",    // Dark slate text
  sub: "#475569",     // Muted gray text
  muted: "#94a3b8",   // Light gray placeholder text
  border: "#e2e8f0",  // Clean layout divider line border
  surface: "#ffffff", // Pure white box backgrounds
  bg: "#f8fafc",      // Soft dashboard main background
  green: "#16a34a"    // Accent technical valuation color
};

export default function ConceptionVisionTab({ conceptionData, folderId, setCurrentPage }) {
  
  // 1. Fallback UI overlay placeholder state if network records return empty
  if (!conceptionData) {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: T.bg, minHeight: "100vh" }}>
        <Typography color="error" sx={{ fontWeight: 500 }}>
          Aucune donnée de conception technique n'est disponible pour ce dossier.
        </Typography>
        <Button 
          variant="contained" 
          onClick={() => setCurrentPage("dashboard")} 
          sx={{ mt: 2, textTransform: "none", bgcolor: T.green }}
        >
          Retour au tableau de bord
        </Button>
      </Box>
    );
  }

  // 2. Structuring Supabase database response keys into French table dataset records
  const technicalRows = [
    { label: "Besoins en eau bruts (EBrute)", value: conceptionData.e_brute, unit: "m³/jour" },
    { label: "Besoins en eau nets (ENet)", value: conceptionData.e_net, unit: "m³/jour" },
    { label: "Débit nominal de la pompe requis", value: conceptionData.pump_flow, unit: "m³/heure" },
    { label: "Pression de fonctionnement du réseau", value: conceptionData.pressure, unit: "bar" },
    { label: "Diamètre de la conduite principale (Saba)", value: conceptionData.main_pipe_diameter, unit: "mm" },
    { label: "Écartement recommandé des goutteurs", value: conceptionData.emitter_spacing, unit: "mètre" },
    { label: "Nombre total de goutteurs requis", value: conceptionData.total_emitters, unit: "goutteurs" },
    { label: "Volume total d'arrosage annuel estimé", value: conceptionData.annual_volume, unit: "m³" },
    { label: "Date de validation des calculs", value: conceptionData.created_at ? new Date(conceptionData.created_at).toLocaleDateString("fr-FR") : "Non définie", unit: "" },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: T.bg, minHeight: "100vh" }}>
      
      {/* SECTION TOP NAV BAR CONTROLLER */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4, gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => setCurrentPage("dashboard")}
          sx={{ borderRadius: "8px", textTransform: "none", borderColor: T.border, color: T.sub, bgcolor: T.surface, "&:hover": { bgcolor: T.bg } }}
        >
          Retour au dossier
        </Button>
        
        <Box sx={{ flex: 1, ml: 2 }}>
          <Typography sx={{ fontSize: 20, fontWeight: 700, color: T.text, lineHeight: 1.2 }}>
            Fiche de Dimensionnement Hydraulique
          </Typography>
          <Typography sx={{ fontSize: 13, color: T.muted, mt: "4px" }}>
            Données officielles calculées par les services techniques de l'ORMVAM
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Download />}
          sx={{ bgcolor: T.green, borderRadius: "8px", textTransform: "none", fontWeight: 600, boxShadow: "none", "&:hover": { bgcolor: "#15803d", boxShadow: "none" } }}
        >
          Exporter la Fiche
        </Button>
      </Box>

      <Divider sx={{ mb: 4, borderColor: T.border }} />

      {/* CORE READABLE TECHNICAL DATA RESULTS DATA TABLE */}
      <TableContainer 
        component={Paper} 
        sx={{ 
          borderRadius: "12px", 
          border: `1px solid ${T.border}`, 
          boxShadow: "0 1px 3px rgba(0,0,0,0.02)", 
          overflow: "hidden",
          bgcolor: T.surface
        }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="hydraulics evaluation table">
          
          {/* TECHNICAL MATRIX TABLE HEADINGS */}
          <TableHead sx={{ bgcolor: "#f1f5f9" }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: T.text, fontSize: 14, py: 2 }}>
                Indicateurs Fondamentaux
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: T.text, fontSize: 14, py: 2 }}>
                Données Quantitatives
              </TableCell>
              <TableCell align="left" sx={{ fontWeight: 600, color: T.text, fontSize: 14, py: 2, pl: 6 }}>
                Unités Métriques
              </TableCell>
            </TableRow>
          </TableHead>

          {/* RENDERING DYNAMIC DATABASE DRIVEN DATA FIELDS */}
          <TableBody>
            {technicalRows.map((row, index) => (
              <TableRow 
                key={index}
                sx={{ 
                  '&:last-child td, &:last-child th': { border: 0 }, 
                  '&:hover': { bgcolor: "#f8fafc" },
                  transition: "background-color 0.15s ease"
                }}
              >
                {/* 1. Technical indicator parameter designation statement */}
                <TableCell component="th" scope="row" sx={{ color: T.text, fontWeight: 500, fontSize: 13.5, py: 2.25 }}>
                  {row.label}
                </TableCell>
                
                {/* 2. Numerical processed calculation value rendering field */}
                <TableCell align="right" sx={{ color: T.green, fontWeight: 700, fontSize: 15, py: 2.25 }}>
                  {row.value !== undefined && row.value !== null ? row.value.toLocaleString("fr-FR") : "—"}
                </TableCell>
                
                {/* 3. Metric unit specification metric display column */}
                <TableCell align="left" sx={{ color: T.sub, fontSize: 13, py: 2.25, pl: 6, fontWeight: 500 }}>
                  {row.unit}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </TableContainer>

    </Box>
  );
}
