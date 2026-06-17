import { useState } from "react";
import { Box, Button, Paper, Chip, CircularProgress, InputAdornment, LinearProgress, MenuItem, Snackbar, Alert, Stack, TextField, Typography } from "@mui/material";
import { Agriculture, Article, AttachMoney, CheckCircle, FolderOpen, Person, Save, UploadFile, Phone, FileDownloadOutlined } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { CreateFolderAxios, UpdateFolderAxios, uploadFolderDocument } from "../Axios/folderAxios";

const T = {
  green: "#16803c", greenBg: "#f0fdf4", greenBorder: "#86efac", greenLt: "#f0fdf4", greenBd: "#86efac", greenDk: "#14532d",
  blue: "#2563eb", blueBg: "#eff6ff",
  amber: "#d97706", amberBg: "#fffbeb", amberDk: "#b45309",
  bg: "#f8fafc", surface: "#ffffff", border: "#e2e8f0",
  text: "#0f172a", textSub: "#475569", sub: "#475569", muted: "#0f4085",
  error: "#dc2626", errorBg: "#fef2f2"
};

const INIT = {
  beneficiary_name: "", national_id: "", deposit_year: "", company_phone: "",
  investment: "", reimbursed_investment: "", subsidy: "",
  phase: "", company: "", crop: "", comment: "",
  serial_number_saba: "", ct_cda_cmv: "",
  adress: "", adress_corr: "", area_brut: "", area_net: ""
};

const SECTIONS = [
  {
    title: "Informations Générales", color: T.green, bg: T.greenBg, icon: <FolderOpen fontSize="small" />, fields: [
      { label: "Exploitant",            name: "beneficiary_name",   md: 6,  required: true, icon: <Person sx={{ fontSize: 16 }} /> },
      { label: "CIN / CNIE",            name: "national_id",        md: 6,  required: true, icon: <Article sx={{ fontSize: 16 }} /> },
      { label: "Année dépôt",           name: "deposit_year",       md: 6,  type: "number", required: true },
      { label: "Phase",                 name: "phase",              md: 6,  type: "select", required: true, options: [
        { value: "observation", label: "Observation" },
        { value: "validation",  label: "Validation"  },
        { value: "execution",   label: "Exécution"   },
        { value: "cloture",     label: "Clôture"     },
      ]},
      { label: "N° Série SABA",         name: "serial_number_saba", md: 6 },
      { label: "CT/CDA/CMV",            name: "ct_cda_cmv",         md: 6 },
      { label: "Adresse",               name: "adress",             md: 12 },
      { label: "Adresse correspondance",name: "adress_corr",        md: 12 },
    ]
  },
  {
    title: "Culture & Exploitation", color: T.blue, bg: T.blueBg, icon: <Agriculture fontSize="small" />, fields: [
      { label: "Société",               name: "company",       md: 6 },
      { label: "Téléphone Société",     name: "company_phone", md: 6, required: true, icon: <Phone sx={{ fontSize: 16 }} /> },
      { label: "Culture",               name: "crop",          md: 6, icon: <Agriculture sx={{ fontSize: 16 }} /> },
      { label: "Superficie brut en Ha", name: "area_brut",     md: 6, type: "number", adornment: "ha" },
      { label: "Superficie net en Ha",  name: "area_net",      md: 6, type: "number", adornment: "ha" },
    ]
  },
  {
    title: "Financement", color: T.amber, bg: T.amberBg, icon: <AttachMoney fontSize="small" />, fields: [
      { label: "Investissement en Dh",  name: "investment",           md: 6, type: "number", adornment: "DH" },
      { label: "Invest. retenu en Dh",  name: "reimbursed_investment",md: 6, type: "number", adornment: "DH" },
      { label: "Subvention en Dh",      name: "subsidy",              md: 6, type: "number", adornment: "DH" },
    ]
  },
  {
    title: "Commentaire", color: "#334155", bg: T.bg, icon: <Article fontSize="small" />, fields: [
      { label: "Commentaire", name: "comment", md: 12, multiline: true, rows: 4 },
    ]
  },
];

const validate = (f) => {
  const e = {};
  ["beneficiary_name", "national_id", "deposit_year", "company_phone"].forEach(k => {
    if (!f[k]) e[k] = "Champ obligatoire";
  });
  return e;
};

const pct = (f) => Math.round((Object.values(f).filter(v => v !== "").length / Object.keys(f).length) * 100);

const fmtDate = (d) => { try { return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }); } catch { return ""; } };

export default function CreateFolder({ onCreate, editFolder = null, onCancel }) {
  const isEdit = !!editFolder;

  const [form, setForm] = useState(isEdit ? {
    beneficiary_name:      editFolder.beneficiary_name      || "",
    national_id:           editFolder.national_id           || "",
    deposit_year:          editFolder.deposit_year          || "",
    investment:            editFolder.investment            || "",
    reimbursed_investment: editFolder.reimbursed_investment || "",
    subsidy:               editFolder.subsidy               || "",
    phase:                 editFolder.phase                 || "",
    company:               editFolder.company               || "",
    company_phone:         editFolder.company_phone         || "",
    crop:                  editFolder.crop                  || "",
    comment:               editFolder.comment               || "",
    serial_number_saba:    editFolder.serial_number_saba    || "",
    ct_cda_cmv:            editFolder.ct_cda_cvm            || "",
    adress:                editFolder.adress                || "",
    adress_corr:           editFolder.adress_corr           || "",
    area_brut:             editFolder.area_brut             || "",
    area_net:              editFolder.area_net              || "",
  } : INIT);

  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [snack,   setSnack]   = useState({ open: false, message: "", severity: "success" });
  const [files,   setFiles]   = useState([]);

  // existing docs from editFolder
  const existingDocs = isEdit && Array.isArray(editFolder.documents) ? editFolder.documents : [];

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files).filter(f => f.type === "application/pdf");
    setFiles(prev => [...prev, ...selected]);
  };

  const removeFile = (index) => setFiles(prev => prev.filter((_, i) => i !== index));

  const handleChange = ({ target: { name, value } }) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) {
      setErrors(errs);
      setSnack({ open: true, message: "Champs obligatoires manquants.", severity: "error" });
      return;
    }
    try {
      setLoading(true);

      if (isEdit) {
        // 1 — Update fields via JSON
        await UpdateFolderAxios(editFolder.folder_id, form);

        // 2 — Upload new files if any
        if (files.length > 0) {
          await uploadFolderDocument(editFolder.folder_id, files);
        }
        
        setSnack({ open: true, message: "Dossier mis à jour avec succès.", severity: "success" });
        setFiles([]);
        onCreate?.({ ...form, folder_id: editFolder.folder_id });

      } else {
        // Create — FormData with fields + files
        const body = new FormData();
        console.log("Updating folder:", body, folder_id, data);/////
        Object.entries(form).forEach(([key, val]) => body.append(key, val));
        files.forEach(file => body.append("files", file));
        const created = await CreateFolderAxios(body);
        onCreate?.(created);
        setSnack({ open: true, message: "Dossier créé avec succès.", severity: "success" });
        setForm(INIT);
        setFiles([]);
      }

      setErrors({});
    } catch (err) {
      setSnack({ open: true, message: err.message || "Erreur serveur.", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const completion = pct(form);
  const hasErrors  = Object.keys(errors).length > 0;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: T.bg, p: { xs: 2, md: 3 }, fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>

        {/* HEADER */}
        <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 18, fontWeight: 500, color: T.text, lineHeight: 1 }}>
              {isEdit ? `Modifier — ${editFolder.folder_name}` : "Nouveau dossier"}
            </Typography>
            <Typography sx={{ fontSize: 12, color: T.muted, mt: "3px" }}>
              {isEdit ? "Mise à jour des informations du dossier" : "Gestion des projets d'irrigation"}
            </Typography>
          </Box>
          <Box sx={{ minWidth: 200 }}>
            <Stack direction="row" justifyContent="space-between" mb={0.75}>
              <Typography sx={{ fontSize: 12, color: T.muted }}>Complétion</Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: T.text }}>{completion}%</Typography>
            </Stack>
            <LinearProgress variant="determinate" value={completion} sx={{ height: 4, borderRadius: 999, bgcolor: T.border, "& .MuiLinearProgress-bar": { bgcolor: T.green, borderRadius: 999 } }} />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 320px" }, gap: "20px" }}>

          {/* FORM */}
          <Stack spacing={2}>

            {SECTIONS.map(sec => (
              <Paper key={sec.title} elevation={0} sx={{ borderRadius: "12px", border: `0.5px solid ${T.border}`, overflow: "hidden", bgcolor: T.surface }}>
                <Box sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.25, borderBottom: `0.5px solid ${T.border}` }}>
                  <Box sx={{ width: 30, height: 30, borderRadius: "8px", flexShrink: 0, bgcolor: alpha(sec.color, 0.1), display: "flex", alignItems: "center", justifyContent: "center", color: sec.color }}>
                    {sec.icon}
                  </Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text }}>{sec.title}</Typography>
                </Box>
                <Box sx={{ p: 2.5 }}>
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "12px" }}>
                    {sec.fields.map(f => (
                      <Box key={f.name} sx={{ gridColumn: `span ${f.md || 6}` }}>
                        <Typography sx={{ fontSize: 11, fontWeight: 500, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: "6px" }}>
                          {f.label}{f.required ? " *" : ""}
                        </Typography>
                        <TextField
                          fullWidth size="small"
                          name={f.name} value={form[f.name]} onChange={handleChange}
                          type={f.type || "text"} select={f.type === "select"}
                          multiline={f.multiline} rows={f.rows}
                          error={!!errors[f.name]} helperText={errors[f.name]}
                          InputProps={{
                            startAdornment: f.icon && <InputAdornment position="start">{f.icon}</InputAdornment>,
                            endAdornment: f.adornment && <InputAdornment position="end"><Typography sx={{ fontSize: 12, color: T.muted }}>{f.adornment}</Typography></InputAdornment>,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: 13, bgcolor: T.bg, "& fieldset": { borderColor: T.border, borderWidth: "0.5px" }, "&:hover fieldset": { borderColor: T.sub }, "&.Mui-focused fieldset": { borderColor: T.green, borderWidth: "1px" } },
                            "& .MuiFormHelperText-root": { fontSize: 11, mt: "4px" },
                          }}
                        >
                          {f.type === "select" && f.options.map(o => (
                            <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
                          ))}
                        </TextField>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Paper>
            ))}

            {/* FILE UPLOAD */}
            <Paper elevation={0} sx={{ borderRadius: "12px", border: `0.5px solid ${T.border}`, overflow: "hidden", bgcolor: T.surface }}>
              <Box sx={{ px: 2.5, py: 1.5, display: "flex", alignItems: "center", gap: 1.25, borderBottom: `0.5px solid ${T.border}` }}>
                <Box sx={{ width: 30, height: 30, borderRadius: "8px", flexShrink: 0, bgcolor: alpha("#334155", 0.08), display: "flex", alignItems: "center", justifyContent: "center", color: "#334155" }}>
                  <UploadFile fontSize="small" />
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text }}>
                  {isEdit ? "Ajouter des pièces jointes" : "Pièces jointes"}
                </Typography>
                {files.length > 0 && (
                  <Chip size="small" label={`${files.length} nouveau${files.length > 1 ? "x" : ""}`} sx={{ ml: "auto", bgcolor: T.greenBg, color: T.green, fontWeight: 500, fontSize: 11, border: `0.5px solid ${T.greenBd}`, height: 22 }} />
                )}
              </Box>
              <Box sx={{ p: 2.5 }}>

                {/* EXISTING DOCS — edit mode only */}
                {isEdit && existingDocs.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 500, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: 1 }}>
                      Documents existants ({existingDocs.length})
                    </Typography>
                    <Stack spacing={1}>
                      {existingDocs.map((doc) => (
                        <Box key={doc.doc_id} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px 14px", borderRadius: "8px", bgcolor: T.bg, border: `0.5px solid ${T.border}` }}>
                          <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Article sx={{ fontSize: 16, color: T.muted }} />
                            <Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text }}>{doc.file_name}</Typography>
                              <Typography sx={{ fontSize: 11, color: T.muted }}>{fmtDate(doc.uploaded_at)}</Typography>
                            </Box>
                          </Stack>
                          <Button
                            size="small"
                            component="a"
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            startIcon={<FileDownloadOutlined sx={{ fontSize: 13 }} />}
                            sx={{ borderRadius: "6px", textTransform: "none", fontSize: 11, color: T.green, border: `0.5px solid ${T.greenBd}`, px: 1.25, height: 28, "&:hover": { bgcolor: T.greenBg } }}
                          >
                            Ouvrir
                          </Button>
                        </Box>
                      ))}
                    </Stack>
                    <Box sx={{ height: "0.5px", bgcolor: T.border, my: 2 }} />
                  </Box>
                )}

                {/* DROP ZONE */}
                <Box
                  component="label" htmlFor="file-upload"
                  sx={{
                    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 0.75, p: 3, borderRadius: "8px", cursor: "pointer",
                    border: `1.5px dashed ${T.border}`, bgcolor: T.bg,
                    transition: "all 0.15s",
                    "&:hover": { borderColor: T.green, bgcolor: T.greenBg },
                  }}
                >
                  <UploadFile sx={{ fontSize: 26, color: T.muted }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.textSub }}>
                    {isEdit ? "Ajouter de nouveaux fichiers PDF" : "Cliquez pour ajouter des fichiers PDF"}
                  </Typography>
                  <Typography sx={{ fontSize: 11, color: T.muted }}>Plusieurs fichiers acceptés</Typography>
                  <input id="file-upload" type="file" accept="application/pdf" multiple hidden onChange={handleFileChange} />
                </Box>

                {/* NEW FILE LIST */}
                {files.length > 0 && (
                  <Stack spacing={1} mt={2}>
                    {files.map((file, i) => (
                      <Box key={i} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: "10px 14px", borderRadius: "8px", bgcolor: T.greenBg, border: `0.5px solid ${T.greenBorder}` }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                          <Article sx={{ fontSize: 16, color: T.green }} />
                          <Box>
                            <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.text }}>{file.name}</Typography>
                            <Typography sx={{ fontSize: 11, color: T.muted }}>{(file.size / 1024).toFixed(0)} KB — Nouveau</Typography>
                          </Box>
                        </Stack>
                        <Button size="small" onClick={() => removeFile(i)} sx={{ minWidth: 0, px: 1, color: T.error, fontSize: 11, textTransform: "none", borderRadius: "6px", "&:hover": { bgcolor: "#fef2f2" } }}>
                          Retirer
                        </Button>
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>
            </Paper>

          </Stack>

          {/* SIDEBAR */}
          <Box sx={{ position: "sticky", top: 24, alignSelf: "start" }}>
            <Stack spacing={1.5}>

              {/* PREVIEW */}
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: "12px", border: `0.5px solid ${T.border}`, bgcolor: T.surface }}>
                <Typography sx={{ fontSize: 14, fontWeight: 500, color: T.text, mb: 1.5, pb: 1.5, borderBottom: `0.5px solid ${T.border}` }}>Aperçu</Typography>
                <Stack spacing={1}>
                  {[
                    ["Exploitant",  form.beneficiary_name],
                    ["CIN",         form.national_id],
                    ["Culture",     form.crop],
                    ["Superficie",  form.area_net ? `${form.area_net} ha` : ""],
                    ["Société",     form.company],
                  ].map(([lbl, val]) => (
                    <Box key={lbl} sx={{ bgcolor: T.bg, borderRadius: "8px", p: "10px 12px" }}>
                      <Typography sx={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: "3px" }}>{lbl}</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: val ? T.text : T.muted, fontStyle: val ? "normal" : "italic" }}>{val || "—"}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ bgcolor: T.bg, borderRadius: "8px", p: "10px 12px" }}>
                    <Typography sx={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: "5px" }}>Phase</Typography>
                    <Chip size="small" label={form.phase || "—"} sx={{ bgcolor: form.phase ? alpha(T.green, 0.1) : T.border, color: form.phase ? T.green : T.muted, fontWeight: 500, fontSize: 11, border: `0.5px solid ${form.phase ? T.greenBd : T.border}`, height: 22 }} />
                  </Box>
                  {(existingDocs.length > 0 || files.length > 0) && (
                    <Box sx={{ bgcolor: T.greenBg, borderRadius: "8px", p: "10px 12px", border: `0.5px solid ${T.greenBd}` }}>
                      <Typography sx={{ fontSize: 10, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", mb: "3px" }}>Documents</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: T.green }}>
                        {existingDocs.length} existant{existingDocs.length > 1 ? "s" : ""}
                        {files.length > 0 ? ` + ${files.length} nouveau${files.length > 1 ? "x" : ""}` : ""}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Paper>

              {/* BUTTONS */}
              <Stack spacing={1}>
                {isEdit && (
                  <Button
                    fullWidth variant="outlined"
                    onClick={onCancel} disabled={loading}
                    sx={{ height: 44, borderRadius: "8px", textTransform: "none", fontWeight: 500, fontSize: 14, borderColor: T.amber, color: T.amber, "&:hover": { bgcolor: T.amberBg, borderColor: T.amberDk } }}
                  >
                    Annuler
                  </Button>
                )}
                <Button
                  fullWidth variant="contained"
                  onClick={handleSubmit} disabled={loading}
                  startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <Save sx={{ fontSize: 16 }} />}
                  sx={{ height: 44, borderRadius: "8px", textTransform: "none", fontWeight: 500, fontSize: 14, bgcolor: T.green, boxShadow: "none", "&:hover": { bgcolor: T.greenDk, boxShadow: "none" } }}
                >
                  {loading
                    ? (isEdit ? "Mise à jour..." : "Création...")
                    : (isEdit ? "Enregistrer les modifications" : "Créer le dossier")}
                </Button>
              </Stack>

              {hasErrors && (
                <Box sx={{ p: "10px 14px", borderRadius: "8px", border: `0.5px solid ${alpha(T.error, 0.35)}`, bgcolor: T.errorBg }}>
                  <Typography sx={{ fontSize: 12, color: T.error }}>Veuillez corriger les erreurs avant de continuer.</Typography>
                </Box>
              )}

              {completion === 100 && !hasErrors && (
                <Box sx={{ p: "10px 14px", borderRadius: "8px", border: `0.5px solid ${T.greenBd}`, bgcolor: T.greenLt, display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircle sx={{ color: T.green, fontSize: 15 }} />
                  <Typography sx={{ fontSize: 12, color: T.green, fontWeight: 500 }}>Formulaire complet.</Typography>
                </Box>
              )}

            </Stack>
          </Box>

        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(p => ({ ...p, open: false }))} sx={{ borderRadius: "8px", fontSize: 13 }}>
          {snack.message}
        </Alert>
      </Snackbar>

    </Box>
  );
}