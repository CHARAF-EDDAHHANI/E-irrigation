import { useState } from "react";
import { Box, Button, Card, Chip, CircularProgress, Grid, InputAdornment, LinearProgress, MenuItem, Snackbar, Alert, Stack, TextField, Typography } from "@mui/material";
import { Agriculture, Article, AttachMoney, CheckCircle, FolderOpen, Person, Save } from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { CreateFolderAxios } from "../Axios/folderAxios";

const T = { green:"#16803c", greenBg:"#f0fdf4", greenBorder:"#86efac", blue:"#2563eb", blueBg:"#eff6ff", amber:"#d97706", amberBg:"#fffbeb", bg:"#f8fafc", surface:"#ffffff", border:"#e2e8f0", text:"#0f172a", textSub:"#475569", textMuted:"#94a3b8", error:"#dc2626", errorBg:"#fef2f2" };

const INIT = { beneficiary_name:"", national_id:"", deposit_year:"", cvm:"", area:"", investment:"", reimbursed_investment:"", subsidy:"", phase:"", company:"", crop:"", documents:"", comment:"" };

const SECTIONS = [
  { title:"Informations Générales", color:T.green, bg:T.greenBg, icon:<FolderOpen fontSize="small"/>, fields:[
    { label:"Exploitant",   name:"beneficiary_name", md:6, required:true, icon:<Person/> },
    { label:"CIN / CNIE",   name:"national_id",       md:6, required:true, icon:<Article/> },
    { label:"Année dépôt", name:"deposit_year",      md:4, type:"number" },
    { label:"CMV",         name:"cvm",               md:4 },
  ]},
  { title:"Culture & Exploitation", color:T.blue, bg:T.blueBg, icon:<Agriculture fontSize="small"/>, fields:[
    { label:"Culture",    name:"crop",    md:6, icon:<Agriculture/> },
    { label:"Superficie en Ha", name:"area",    md:6, type:"number", adornment:"ha" },
    { label:"Entreprise", name:"company", md:6 },
  ]},
  { title:"Financement", color:T.amber, bg:T.amberBg, icon:<AttachMoney fontSize="small"/>, fields:[
    { label:"Investissement en Dh",        name:"investment",             md:4, type:"number", adornment:"DH" },
    { label:"Invest. retenu en Dh",        name:"reimbursed_investment",  md:4, type:"number", adornment:"DH" },
    { label:"Subvention en Dh",            name:"subsidy",                md:4, type:"number", adornment:"DH" },
    { label:"Phase", name:"phase", md:4, type:"select", required:true, options:[
      { value:"prealable", label:"Préalable" }, { value:"validation", label:"Validation" },
      { value:"execution",  label:"Exécution"  }, { value:"cloture",    label:"Clôture" },
    ]},
  ]},
  { title:"Documents & Commentaires", color:"#334155", bg:T.bg, icon:<Article fontSize="small"/>, fields:[
    { label:"Documents",   name:"documents", md:12 },
    { label:"Commentaire", name:"comment",   md:12, multiline:true, rows:4 },
  ]},
];

const validate = (f) => {
  const e = {};
  ["beneficiary_name","national_id","deposit_year"].forEach(k => { if (!f[k]) e[k] = "Champ obligatoire"; });
  return e;
};

const pct = (f) => Math.round((Object.values(f).filter(v => v !== "").length / Object.keys(f).length) * 100);

export default function CreateFolder({ onCreate }) {
  const [form, setForm]   = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open:false, message:"", severity:"success" });

  const handleChange = ({ target: { name, value } }) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); setSnack({ open:true, message:"Champs obligatoires manquants.", severity:"error" }); return; }
    try {
      setLoading(true);
      console.log(form);
      const created = await CreateFolderAxios(form);
      onCreate?.(created);
      setSnack({ open:true, message:"Dossier créé avec succès.", severity:"success" });
      setForm(INIT); setErrors({});
    } catch (err) {
      setSnack({ open:true, message: err.message || "Erreur serveur.", severity:"error" });
    } finally { setLoading(false); }
  };

  const completion = pct(form);
  const hasErrors  = Object.keys(errors).length > 0;

  return (
    <Box sx={{ minHeight:"100vh", bgcolor:T.bg, p:{ xs:2, md:4 } }}>
      <Box sx={{ maxWidth:1400, mx:"auto" }}>

        {/* HEADER */}
        <Card elevation={0} sx={{ mb:3, p:3, borderRadius:2, border:`1px solid ${T.border}` }}>
          <Stack direction={{ xs:"column", md:"row" }} justifyContent="space-between" spacing={2}>
            <Box>
              <Typography sx={{ fontSize:26, fontWeight:800, color:T.text }}>Nouveau Dossier</Typography>
              <Typography sx={{ color:T.textSub, mt:0.5 }}>Gestion des projets d'irrigation</Typography>
            </Box>
            <Box sx={{ minWidth:220 }}>
              <Stack direction="row" justifyContent="space-between" mb={1}>
                <Typography fontSize={13}>Complétion</Typography>
                <Typography fontSize={13} fontWeight={700}>{completion}%</Typography>
              </Stack>
              <LinearProgress variant="determinate" value={completion} sx={{ height:8, borderRadius:999 }} />
            </Box>
          </Stack>
        </Card>

        <Grid container spacing={3}>
          {/* FORM */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {SECTIONS.map(sec => (
                <Card key={sec.title} elevation={0} sx={{ borderRadius:2, border:`1px solid ${T.border}`, overflow:"hidden" }}>
                  <Box sx={{ p:2, bgcolor:sec.bg, borderBottom:`1px solid ${T.border}` }}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ width:34, height:34, borderRadius:2, bgcolor:alpha(sec.color, 0.12), color:sec.color, display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {sec.icon}
                      </Box>
                      <Typography fontWeight={700} fontSize={15}>{sec.title}</Typography>
                    </Stack>
                  </Box>
                  <Box sx={{ p:3 }}>
                    <Grid container spacing={2}>
                      {sec.fields.map(f => (
                        <Grid item xs={12} md={f.md} key={f.name}>
                          <TextField fullWidth size="small"
                            label={f.required ? `${f.label} *` : f.label}
                            name={f.name} value={form[f.name]} onChange={handleChange}
                            type={f.type || "text"} select={f.type === "select"}
                            multiline={f.multiline} rows={f.rows}
                            error={!!errors[f.name]} helperText={errors[f.name]}
                            InputProps={{
                              startAdornment: f.icon && <InputAdornment position="start">{f.icon}</InputAdornment>,
                              endAdornment:   f.adornment && <InputAdornment position="end">{f.adornment}</InputAdornment>,
                            }}
                            sx={{ "& .MuiOutlinedInput-root": { borderRadius:"8px" } }}
                          >
                            {f.type === "select" && f.options.map(o => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                          </TextField>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Card>
              ))}
            </Stack>
          </Grid>

          {/* SIDEBAR */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2} sx={{ position:"sticky", top:24 }}>
              <Card elevation={0} sx={{ p:3, borderRadius:2, border:`1px solid ${T.border}` }}>
                <Typography fontWeight={700} mb={2}>Aperçu</Typography>
                <Stack spacing={1.5}>
                  {[["Exploitant", form.beneficiary_name], ["CIN", form.national_id], ["Culture", form.crop], ["Superficie", form.area ? `${form.area} ha` : ""]].map(([lbl, val]) => (
                    <Box key={lbl}>
                      <Typography fontSize={11} color={T.textMuted} textTransform="uppercase" letterSpacing="0.06em">{lbl}</Typography>
                      <Typography fontWeight={600} fontSize={13}>{val || "—"}</Typography>
                    </Box>
                  ))}
                  <Box>
                    <Typography fontSize={11} color={T.textMuted} textTransform="uppercase" letterSpacing="0.06em">Phase</Typography>
                    <Chip size="small" label={form.phase || "—"} sx={{ mt:"3px", bgcolor: form.phase ? alpha(T.green, 0.1) : T.bg, color: form.phase ? T.green : T.textMuted, fontWeight:600, fontSize:11 }} />
                  </Box>
                </Stack>
              </Card>

              <Button fullWidth variant="contained" size="large" onClick={handleSubmit} disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit"/> : <Save/>}
                sx={{ height:50, borderRadius:2, textTransform:"none", fontWeight:700, fontSize:14, bgcolor:T.green, "&:hover":{ bgcolor:"#166534" } }}>
                {loading ? "Création..." : "Créer le dossier"}
              </Button>

              {hasErrors && (
                <Box sx={{ p:1.5, borderRadius:2, border:`1px solid ${alpha(T.error, 0.2)}`, bgcolor:T.errorBg }}>
                  <Typography fontSize={12} color={T.error}>Veuillez corriger les erreurs.</Typography>
                </Box>
              )}

              {completion === 100 && !hasErrors && (
                <Box sx={{ p:1.5, borderRadius:2, border:`1px solid ${T.greenBorder}`, bgcolor:T.greenBg, display:"flex", alignItems:"center", gap:1 }}>
                  <CheckCircle sx={{ color:T.green, fontSize:16 }}/>
                  <Typography fontSize={12} color={T.green} fontWeight={600}>Formulaire complet.</Typography>
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(p => ({ ...p, open:false }))} anchorOrigin={{ vertical:"bottom", horizontal:"center" }}>
        <Alert severity={snack.severity} variant="filled" onClose={() => setSnack(p => ({ ...p, open:false }))}>{snack.message}</Alert>
      </Snackbar>
    </Box>
  );
}