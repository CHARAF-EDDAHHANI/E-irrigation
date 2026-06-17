import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Divider, Chip, Stack
} from "@mui/material";
import { ArrowBack, Download } from "@mui/icons-material";

const T = {
  text: "#0f172a", sub: "#072f68", muted: "#072856",
  border: "#e2e8f0", surface: "#ffffff", bg: "#f8fafc",
  green: "#16a34a", greenLt: "#f0fdf4", greenBd: "#bbf7d0",
  blue: "#2563eb", blueLt: "#eff6ff",
  amber: "#d97706", amberLt: "#fffbeb",
  purple: "#7c3aed", purpleLt: "#f3e8ff",
};

const fmt = (v, dec = 2) => {
  if (v === undefined || v === null) return "—";
  if (typeof v === "number") return v.toLocaleString("fr-FR", { maximumFractionDigits: dec });
  return v;
};

function SectionTable({ title, color, colorLt, rows }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
        <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: color }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: T.text }}>{title}</Typography>
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: `0.5px solid ${T.border}`, borderRadius: "10px", overflow: "hidden" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: colorLt }}>
              <TableCell sx={{ fontWeight: 600, color: T.text, fontSize: 12, py: 1.25, borderBottom: `0.5px solid ${T.border}` }}>Paramètre</TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: T.text, fontSize: 12, py: 1.25, borderBottom: `0.5px solid ${T.border}` }}>Valeur</TableCell>
              <TableCell sx={{ fontWeight: 600, color: T.text, fontSize: 12, py: 1.25, pl: 3, borderBottom: `0.5px solid ${T.border}` }}>Unité</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} sx={{ "&:hover": { bgcolor: T.bg }, "&:last-child td": { border: 0 } }}>
                <TableCell sx={{ color: T.sub, fontSize: 13, py: 1.25, borderBottom: `0.5px solid ${T.border}` }}>{row.label}</TableCell>
                <TableCell align="right" sx={{ color, fontWeight: 700, fontSize: 14, py: 1.25, borderBottom: `0.5px solid ${T.border}` }}>{fmt(row.value, row.dec ?? 2)}</TableCell>
                <TableCell sx={{ color: T.muted, fontSize: 12, py: 1.25, pl: 3, borderBottom: `0.5px solid ${T.border}` }}>{row.unit || ""}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

function TronconTable({ title, troncons, color, colorLt }) {
  if (!troncons?.length) return null;
  const keys = Object.keys(troncons[0]).filter(k => k !== "n");
  const labels = { Lcum_m: "L cumulée (m)", Qtr_lh: "Débit (l/h)", DZ_m: "ΔZ (m)", Yls_mce: "Yls (mCE)", Peff_mce: "Peff (mCE)", V_ms: "V (m/s)", D_mm: "Ø (mm)" };
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.25 }}>
        <Box sx={{ width: 4, height: 20, borderRadius: 2, bgcolor: color }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: T.text }}>{title}</Typography>
        <Chip size="small" label={`${troncons.length} tronçons`} sx={{ bgcolor: colorLt, color, fontSize: 11, fontWeight: 500, height: 20 }} />
      </Box>
      <TableContainer component={Paper} elevation={0} sx={{ border: `0.5px solid ${T.border}`, borderRadius: "10px", overflow: "hidden", maxHeight: 320 }}>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, fontSize: 12, bgcolor: colorLt, borderBottom: `0.5px solid ${T.border}` }}>N°</TableCell>
              {keys.map(k => (
                <TableCell key={k} align="right" sx={{ fontWeight: 600, fontSize: 12, bgcolor: colorLt, borderBottom: `0.5px solid ${T.border}` }}>
                  {labels[k] || k}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {troncons.map((t, i) => (
              <TableRow key={i} sx={{ "&:hover": { bgcolor: T.bg }, "&:last-child td": { border: 0 } }}>
                <TableCell sx={{ fontSize: 12, color: T.muted, borderBottom: `0.5px solid ${T.border}` }}>{t.n}</TableCell>
                {keys.map(k => (
                  <TableCell key={k} align="right" sx={{ fontSize: 12, color: T.text, borderBottom: `0.5px solid ${T.border}` }}>{fmt(t[k], 4)}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default function ConceptionVisionTab({ conceptionData, folderId, setCurrentPage }) {

  if (!conceptionData) {
    return (
      <Box sx={{ p: 4, textAlign: "center", bgcolor: T.bg, minHeight: "100vh" }}>
        <Typography color="error" sx={{ fontWeight: 500 }}>Aucune donnée de conception disponible.</Typography>
        <Button variant="contained" onClick={() => setCurrentPage("dashboard")} sx={{ mt: 2, textTransform: "none", bgcolor: T.green }}>
          Retour
        </Button>
      </Box>
    );
  }

  // Parse JSON strings from DB
  const results = typeof conceptionData.results === "string"
    ? JSON.parse(conceptionData.results)
    : (conceptionData.results || {});

  const input = typeof conceptionData.input === "string"
    ? JSON.parse(conceptionData.input)
    : (conceptionData.input || {});

  const bassin       = results.bassin        || {};
  const besoins      = results.besoins       || [];
  const distributeurs= results.distributeurs || [];
  const pompeBassin  = results.pompe_bassin  || {};
  const pompeForage  = results.pompe_forage  || {};
  const postes       = results.postes        || {};
  const rampe        = results.rampe         || {};
  const porteRampe   = results.porte_rampe   || {};
  const conduites    = results.conduites     || [];

  const handlePrint = () => window.print();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, bgcolor: T.bg, minHeight: "100vh", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
      id="conception-print-area"
    >

      {/* HEADER */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Button variant="outlined" size="small" startIcon={<ArrowBack sx={{ fontSize: 14 }} />}
            onClick={() => setCurrentPage("dashboard")}
            sx={{ borderRadius: "8px", textTransform: "none", borderColor: T.border, color: T.sub, fontSize: 13, height: 34 }}
          >
            Retour
          </Button>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 500, color: T.text, lineHeight: 1 }}>
              Fiche de Dimensionnement Hydraulique
            </Typography>
            <Typography sx={{ fontSize: 12, color: T.muted, mt: "3px" }}>
              {input.dossier_name || ""} — Données calculées par les services techniques ORMVAM
            </Typography>
          </Box>
        </Stack>
        <Button variant="contained" size="small" startIcon={<Download sx={{ fontSize: 15 }} />}
          onClick={handlePrint}
          sx={{ bgcolor: T.green, borderRadius: "8px", textTransform: "none", fontWeight: 500, fontSize: 13, height: 34, boxShadow: "none", "&:hover": { bgcolor: "#15803d", boxShadow: "none" } }}
        >
          Télécharger PDF
        </Button>
      </Box>

      <Divider sx={{ mb: 3, borderColor: T.border }} />

      {/* 1 — BESOINS EN EAU */}
      {besoins.map((b, i) => (
        <SectionTable key={i}
          title={`Besoins en eau — ${b.culture}`}
          color={T.green} colorLt={T.greenLt}
          rows={[
            { label: "Culture", value: b.culture, unit: "" },
            { label: "ET0", value: b.ET0, unit: "mm/j" },
            { label: "Kc", value: b.Kc, unit: "" },
            { label: "Kr", value: b.Kr, unit: "" },
            { label: "Besoin brut (B_brute)", value: b.B_brute_mm, unit: "mm/j" },
            { label: "Besoin net (B_net)", value: b.B_net_mm, unit: "mm/j" },
          ]}
        />
      ))}

      {/* 2 — DISTRIBUTEURS */}
      {distributeurs.map((d, i) => (
        <SectionTable key={i}
          title={`Distributeurs — ${d.culture}`}
          color={T.blue} colorLt={T.blueLt}
          rows={[
            { label: "Débit goutteur",         value: d.debit_goutteur,  unit: "l/h" },
            { label: "Écartement rampes",       value: d.ecart_rampe,     unit: "m" },
            { label: "Écartement goutteurs",    value: d.ecart_goutteur,  unit: "m" },
            { label: "Surface goutteur (Sg)",   value: d.Sg,              unit: "m²" },
            { label: "Pression nominale (Pn)",  value: d.Pn,              unit: "mCE" },
            { label: "Perte de charge (Pf)",    value: d.Pf,              unit: "mCE" },
            { label: "ΔP admissible",           value: d.delta_P,         unit: "mCE" },
            { label: "Exposant x",              value: d.x,               unit: "" },
          ]}
        />
      ))}

      {/* 3 — POSTES D'IRRIGATION */}
      {postes.postes?.map((p, i) => (
        <SectionTable key={i}
          title={`Poste d'irrigation N°${p.poste_id}`}
          color={T.amber} colorLt={T.amberLt}
          rows={[
            { label: "Durée d'irrigation",     value: p.duree_h,              unit: "h" },
            { label: "Superficie totale",       value: p.total_superficie_m2,  unit: "m²" },
            { label: "Nombre de goutteurs",     value: p.total_goutteurs,      unit: "unités", dec: 0 },
            { label: "Débit total",             value: p.total_debit_m3h,      unit: "m³/h" },
            { label: "Variation débit",         value: p.variation_debit_pct,  unit: "%" },
          ]}
        />
      ))}

      {/* 4 — RAMPES */}
      {rampe.nb_troncons && (
        <>
          <SectionTable
            title="Rampes — Résumé"
            color={T.purple} colorLt={T.purpleLt}
            rows={[
              { label: "Longueur rampe (Lr)",         value: rampe.Lr,          unit: "m" },
              { label: "Écart goutteurs (Eg)",        value: rampe.Eg,          unit: "m" },
              { label: "Débit goutteur (qg)",         value: rampe.qg,          unit: "l/h" },
              { label: "Diamètre rampe (Dr)",         value: rampe.Dr,          unit: "mm" },
              { label: "Pente",                       value: rampe.pente,       unit: "%" },
              { label: "Nombre de tronçons",          value: rampe.nb_troncons, unit: "", dec: 0 },
              { label: "Pression max (Pmax)",         value: rampe.Pmax,        unit: "mCE", dec: 4 },
              { label: "Pression min (Pmin)",         value: rampe.Pmin,        unit: "mCE", dec: 4 },
            ]}
          />
          <TronconTable title="Rampes — Détail tronçons" troncons={rampe.troncons} color={T.purple} colorLt={T.purpleLt} />
        </>
      )}

      {/* 5 — PORTE-RAMPES */}
      {porteRampe.nb_troncons && (
        <>
          <SectionTable
            title="Porte-rampes — Résumé"
            color="#0891b2" colorLt="#e0f2fe"
            rows={[
              { label: "Longueur porte-rampe (Lpr)", value: porteRampe.Lpr,          unit: "m" },
              { label: "Diamètre",                   value: porteRampe.diameter_mm,  unit: "mm" },
              { label: "Nombre de tronçons",         value: porteRampe.nb_troncons,  unit: "", dec: 0 },
              { label: "Pression max",               value: porteRampe.Pmax,         unit: "mCE", dec: 3 },
              { label: "Pression min",               value: porteRampe.Pmin,         unit: "mCE", dec: 3 },
            ]}
          />
          <TronconTable title="Porte-rampes — Détail tronçons" troncons={porteRampe.troncons} color="#0891b2" colorLt="#e0f2fe" />
        </>
      )}

      {/* 6 — CONDUITES */}
      {conduites.length > 0 && (
        <SectionTable
          title="Conduites principales"
          color="#334155" colorLt="#f1f5f9"
          rows={conduites.map(c => ({
            label: `Tronçon ${c.troncon}`, value: c.vitesse_ms, unit: "m/s",
          })).concat(conduites.map(c => ({
            label: `Débit ${c.troncon}`, value: c.debit_m3h, unit: "m³/h",
          })))}
        />
      )}

      {/* 7 — POMPE BASSIN */}
      {pompeBassin.HMT_mce && (
        <SectionTable
          title="Pompe sur bassin"
          color={T.green} colorLt={T.greenLt}
          rows={[
            { label: "Débit (Q)",             value: pompeBassin.Q_m3h,        unit: "m³/h" },
            { label: "Pression aspiration",   value: pompeBassin.Pa_mce,       unit: "mCE" },
            { label: "PDC max",               value: pompeBassin.PDCmax_mce,   unit: "mCE" },
            { label: "Hauteur aspiration",    value: pompeBassin.Ha_m,         unit: "m" },
            { label: "NPSH",                  value: pompeBassin.NPSH_m,       unit: "m" },
            { label: "HMT",                   value: pompeBassin.HMT_mce,      unit: "mCE" },
            { label: "Rendement",             value: pompeBassin.rendement_pct, unit: "%" },
            { label: "Puissance nominale",    value: pompeBassin.puissance_kw, unit: "kW" },
          ]}
        />
      )}

      {/* 8 — POMPE FORAGE */}
      {pompeForage.HMT_mce && (
        <SectionTable
          title="Pompe sur forage"
          color={T.blue} colorLt={T.blueLt}
          rows={[
            { label: "Débit (Q)",             value: pompeForage.Q_m3h,        unit: "m³/h" },
            { label: "Profondeur forage",     value: pompeForage.Lfb_m,        unit: "m" },
            { label: "Diamètre intérieur",    value: pompeForage.diam_int_mm,   unit: "mm" },
            { label: "Niveau dynamique (Nd)", value: pompeForage.Nd_m,         unit: "m" },
            { label: "ΔZ",                    value: pompeForage.delta_z_m,    unit: "m" },
            { label: "ΔP conduite forage",    value: pompeForage.delta_pfb_mce, unit: "mCE" },
            { label: "ΔP conduites",          value: pompeForage.delta_pc_mce, unit: "mCE" },
            { label: "HMT",                   value: pompeForage.HMT_mce,      unit: "mCE" },
            { label: "Rendement",             value: pompeForage.rendement_pct, unit: "%" },
            { label: "Puissance nominale",    value: pompeForage.puissance_kw, unit: "kW" },
          ]}
        />
      )}

      {/* 9 — BASSIN DE STOCKAGE */}
      {bassin.volume_m3 && (
        <SectionTable
          title="Bassin de stockage"
          color={T.amber} colorLt={T.amberLt}
          rows={[
            { label: "Volume total",           value: bassin.volume_m3,          unit: "m³" },
            { label: "Surface radier",         value: bassin.S_radier_m2,        unit: "m²" },
            { label: "Surface parois long.",   value: bassin.S_parois_long_m2,   unit: "m²" },
            { label: "Surface parois larg.",   value: bassin.S_parois_larg_m2,   unit: "m²" },
            { label: "Surface périmètre",      value: bassin.S_perimetre_m2,     unit: "m²" },
            { label: "Surface totale",         value: bassin.S_totale_m2,        unit: "m²" },
            { label: "Surface interne",        value: bassin.S_interne_m2,       unit: "m²" },
            { label: "Autonomie",              value: bassin.autonomie_j,        unit: "jours" },
            { label: "Volume / ha",            value: bassin.vol_par_ha_m3,      unit: "m³/ha" },
          ]}
        />
        )}

        {/* 10 — RÉSUMÉ GÉNÉRAL */}
        <SectionTable
            title="Résumé général du dimensionnement"
            color="#072261"
            colorLt="#f8fafc"
            rows={[
              ...(besoins[0] ? [{
                label: "Besoin brut maximal",
                value: Math.max(...besoins.map(b => Number(b.B_brute_mm || 0))),
                unit: "mm/j"
              }] : []),

              ...(distributeurs[0] ? [{
                label: "Pression nominale distributeurs",
                value: distributeurs[0].Pn,
                unit: "mCE"
              }] : []),

              ...(postes.postes?.length ? [{
                label: "Nombre de postes",
                value: postes.postes.length,
                unit: ""
              }] : []),

              ...(rampe.nb_troncons ? [{
                label: "Pression rampe min/max",
                value: `${fmt(rampe.Pmin)} / ${fmt(rampe.Pmax)}`,
                unit: "mCE"
              }] : []),

              ...(porteRampe.nb_troncons ? [{
                label: "Pression porte-rampe min/max",
                value: `${fmt(porteRampe.Pmin)} / ${fmt(porteRampe.Pmax)}`,
                unit: "mCE"
              }] : []),

              ...(conduites.length ? [{
                label: "Nombre de conduites",
                value: conduites.length,
                unit: ""
              }] : []),

              ...(pompeBassin.HMT_mce ? [{
                label: "HMT pompe bassin",
                value: pompeBassin.HMT_mce,
                unit: "mCE"
              }] : []),

              ...(pompeForage.HMT_mce ? [{
                label: "HMT pompe forage",
                value: pompeForage.HMT_mce,
                unit: "mCE"
              }] : []),

              ...(bassin.volume_m3 ? [{
                label: "Volume bassin",
                value: bassin.volume_m3,
                unit: "m³"
              }] : []),
            ]}
        />

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #conception-print-area, #conception-print-area * { visibility: visible; }
          #conception-print-area { position: absolute; left: 0; top: 0; width: 100%; }
          button { display: none !important; }
        }
      `}</style>

    </Box>
  );
}
