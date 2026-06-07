import { useState } from "react";

import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Grid,
  InputAdornment,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Typography,
  LinearProgress,
} from "@mui/material";

import AgricultureIcon from "@mui/icons-material/Agriculture";
import ArticleIcon from "@mui/icons-material/Article";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BusinessIcon from "@mui/icons-material/Business";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
//import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import PersonIcon from "@mui/icons-material/Person";
import SaveIcon from "@mui/icons-material/Save";

import { alpha } from "@mui/material/styles";

import { CreateFolderAxios } from "../Axios/folderAxios";

// ─────────────────────────────────────────────────────────────────────────────
// COLORS
// ─────────────────────────────────────────────────────────────────────────────

const T = {
  green: "#16803c",
  greenBg: "#f0fdf4",
  greenBorder: "#86efac",

  blue: "#2563eb",
  blueBg: "#eff6ff",

  amber: "#d97706",
  amberBg: "#fffbeb",

  bg: "#f8fafc",
  surface: "#ffffff",

  border: "#e2e8f0",
  text: "#0f172a",
  textSub: "#475569",
  textMuted: "#94a3b8",

  error: "#dc2626",
  errorBg: "#fef2f2",

  radius: "16px",
};

// ─────────────────────────────────────────────────────────────────────────────
// INITIAL STATE
// ─────────────────────────────────────────────────────────────────────────────

const initialForm = {
  beneficiary_name: "",
  national_id: "",
  deposit_year: "",
  cvm: "",
  area: "",
  investment: "",
  investment_per_hectare: "",
  reimbursed_investment: "",
  subsidy: "",
  percentage: "",
  phase: "",
  company: "",
  crop: "",
  documents: "",
  comment: "",
};

const REQUIRED = [
  "beneficiary_name",
  "national_id",
  "deposit_year",
];

// ─────────────────────────────────────────────────────────────────────────────
// FORM STRUCTURE
// ─────────────────────────────────────────────────────────────────────────────

const sections = [
  {
    title: "Informations Générales",
    color: T.green,
    bg: T.greenBg,
    icon: <FolderOpenIcon fontSize="small" />,
    fields: [
      {
        label: "Exploitant",
        name: "beneficiary_name",
        md: 6,
        required: true,
        icon: <PersonIcon />,
      },
      {
        label: "CIN / CNE",
        name: "national_id",
        md: 6,
        required: true,
        icon: <ArticleIcon />,
      },
      {
        label: "Année dépôt",
        name: "deposit_year",
        md: 4,
        type: "number",
        icon: <CalendarTodayIcon />,
      },
      {
        label: "CMV",
        name: "cvm",
        md: 4,
      },
    ],
  },

  {
    title: "Culture & Exploitation",
    color: T.blue,
    bg: T.blueBg,
    icon: <AgricultureIcon fontSize="small" />,
    fields: [
      {
        label: "Culture",
        name: "crop",
        md: 6,
        icon: <AgricultureIcon />,
      },
      {
        label: "Superficie",
        name: "area",
        md: 6,
        type: "number",
        adornment: "ha",
      },
      {
        label: "Entreprise",
        name: "company",
        md: 6,
        icon: <BusinessIcon />,
      },
    ],
  },

  {
    title: "Financement",
    color: T.amber,
    bg: T.amberBg,
    icon: <AttachMoneyIcon fontSize="small" />,
    fields: [
      {
        label: "Investissement",
        name: "investment",
        md: 4,
        type: "number",
        adornment: "DH",
      },
      {
        label: "Investissement / Ha",
        name: "investment_per_hectare",
        md: 4,
        type: "number",
        adornment: "DH",
      },
      {
        label: "Investissement retenu",
        name: "reimbursed_investment",
        md: 4,
        type: "number",
        adornment: "DH",
      },
      {
        label: "Subvention",
        name: "subsidy",
        md: 4,
        type: "number",
        adornment: "DH",
      },
      {
        label: "Pourcentage",
        name: "percentage",
        md: 4,
        type: "number",
        adornment: "%",
      },
      {
        label: "Phase",
        name: "phase",
        md: 4,
        type: "select",
        required: true,
        options: [
          { value: "prealable", label: "Préalable" },
          { value: "validation", label: "Validation" },
          { value: "execution", label: "Exécution" },
          { value: "cloture", label: "Clôture" },
        ],
      },
    ],
  },

  {
    title: "Documents & Commentaires",
    color: "#334155",
    bg: "#f8fafc",
    icon: <ArticleIcon fontSize="small" />,
    fields: [
      {
        label: "Documents",
        name: "documents",
        md: 12,
      },
      {
        label: "Commentaire",
        name: "comment",
        md: 12,
        multiline: true,
        rows: 4,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────────────────────

function validate(form) {
  const errors = {};

  REQUIRED.forEach((field) => {
    if (!form[field]) {
      errors[field] = "Champ obligatoire";
    }
  });

  return errors;
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function CreateFolder({ onCreate }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // ───────────────────────────────────────────────────────────────────────────
  // HANDLE CHANGE
  // ───────────────────────────────────────────────────────────────────────────

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // HANDLE SUBMIT
  // ───────────────────────────────────────────────────────────────────────────

  const handleSubmit = async () => {
    const validationErrors = validate(form);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      setSnack({
        open: true,
        message: "Veuillez remplir les champs obligatoires.",
        severity: "error",
      });

      return;
    }

    try {
      setLoading(true);

      const createdFolder = await CreateFolderAxios(form);

      if (onCreate) {
        onCreate(createdFolder);
      }

      setSnack({
        open: true,
        message: "Dossier créé avec succès.",
        severity: "success",
      });

      setForm(initialForm);
      setErrors({});
    } catch (error) {
      setSnack({
        open: true,
        message: error.message || "Erreur serveur.",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // COMPLETION %
  // ───────────────────────────────────────────────────────────────────────────

  const completion =
    Math.round(
      (Object.values(form).filter((v) => v !== "").length /
        Object.keys(form).length) *
        100
    ) || 0;

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER
  // ───────────────────────────────────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: T.bg,
        p: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        {/* HEADER */}

        <Card
          elevation={0}
          sx={{
            mb: 3,
            p: 3,
            borderRadius: T.radius,
            border: `1px solid ${T.border}`,
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 28,
                  fontWeight: 800,
                  color: T.text,
                }}
              >
                Nouveau Dossier
              </Typography>

              <Typography
                sx={{
                  color: T.textSub,
                  mt: 0.5,
                }}
              >
                Gestion des projets d'irrigation
              </Typography>
            </Box>

            <Box sx={{ minWidth: 220 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                sx={{ mb: 1 }}
              >
                <Typography fontSize={13}>
                  Complétion
                </Typography>

                <Typography
                  fontSize={13}
                  fontWeight={700}
                >
                  {completion}%
                </Typography>
              </Stack>

              <LinearProgress
                variant="determinate"
                value={completion}
                sx={{
                  height: 8,
                  borderRadius: 999,
                }}
              />
            </Box>
          </Stack>
        </Card>

        {/* FORM */}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>
              {sections.map((section) => (
                <Card
                  key={section.title}
                  elevation={0}
                  sx={{
                    borderRadius: T.radius,
                    border: `1px solid ${T.border}`,
                    overflow: "hidden",
                  }}
                >
                  {/* SECTION HEADER */}

                  <Box
                    sx={{
                      p: 2,
                      bgcolor: section.bg,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 2,
                          bgcolor: alpha(section.color, 0.12),
                          color: section.color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {section.icon}
                      </Box>

                      <Typography
                        fontWeight={700}
                        fontSize={15}
                      >
                        {section.title}
                      </Typography>
                    </Stack>
                  </Box>

                  {/* FIELDS */}

                  <Box sx={{ p: 3 }}>
                    <Grid container spacing={2}>
                      {section.fields.map((field) => (
                        <Grid
                          item
                          xs={12}
                          md={field.md}
                          key={field.name}
                        >
                          <TextField
                            fullWidth
                            label={
                              field.required
                                ? `${field.label} *`
                                : field.label
                            }
                            name={field.name}
                            value={form[field.name]}
                            onChange={handleChange}
                            type={field.type || "text"}
                            select={field.type === "select"}
                            multiline={field.multiline}
                            rows={field.rows}
                            error={!!errors[field.name]}
                            helperText={errors[field.name]}
                            InputProps={{
                              startAdornment: field.icon && (
                                <InputAdornment position="start">
                                  {field.icon}
                                </InputAdornment>
                              ),

                              endAdornment: field.adornment && (
                                <InputAdornment position="end">
                                  {field.adornment}
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                            '& .MuiOutlinedInput-root': { borderRadius: '8px' },
                            '& .MuiSelect-select': { py: 1.5 },
                            '& .css-18jp67o-MuiNativeSelect-root-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-18jp67o-MuiNativeSelect-root-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input.css-18jp67o-MuiNativeSelect-root-MuiSelect-select-MuiInputBase-input-MuiOutlinedInput-input': {
                            paddingRight: '200px',
                            }
                            }}
                          >
                            {field.type === "select" &&
                              field.options.map((option) => (
                                <MenuItem
                                  key={option.value}
                                  value={option.value}
                                >
                                  {option.label}
                                </MenuItem>
                              ))}
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
            <Stack spacing={3}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: T.radius,
                  border: `1px solid ${T.border}`,
                }}
              >
                <Typography
                  fontWeight={700}
                  mb={2}
                >
                  Aperçu
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography fontSize={12} color={T.textMuted}>
                      Dossier
                    </Typography>

                    <Typography fontWeight={600}>
                      {form.folder_name || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography fontSize={12} color={T.textMuted}>
                      Exploitant
                    </Typography>

                    <Typography fontWeight={600}>
                      {form.beneficiary_name || "—"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography fontSize={12} color={T.textMuted}>
                      Phase
                    </Typography>

                    <Chip
                      size="small"
                      label={form.phase || "—"}
                      color="success"
                    />
                  </Box>
                </Stack>
              </Card>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress
                      size={18}
                      color="inherit"
                    />
                  ) : (
                    <SaveIcon />
                  )
                }
                onClick={handleSubmit}
                disabled={loading}
                sx={{
                  height: 54,
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: 15,
                  bgcolor: T.green,

                  "&:hover": {
                    bgcolor: "#166534",
                  },
                }}
              >
                {loading
                  ? "Création..."
                  : "Créer le dossier"}
              </Button>

              {Object.keys(errors).length > 0 && (
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: T.radius,
                    border: `1px solid ${alpha(T.error, 0.2)}`,
                    bgcolor: T.errorBg,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                  {/*}  <ErrorOutlineIcon
                      sx={{
                        color: T.error,
                        fontSize: 18,
                      }}
                    />*/}

                    <Typography
                      fontSize={13}
                      color={T.error}
                    >
                      Veuillez corriger les erreurs.
                    </Typography>
                  </Stack>
                </Card>
              )}

              {completion === 100 && (
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: T.radius,
                    border: `1px solid ${T.greenBorder}`,
                    bgcolor: T.greenBg,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <CheckCircleIcon
                      sx={{
                        color: T.green,
                        fontSize: 18,
                      }}
                    />

                    <Typography
                      fontSize={13}
                      color={T.green}
                      fontWeight={600}
                    >
                      Formulaire complet.
                    </Typography>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* SNACKBAR */}

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() =>
          setSnack((prev) => ({
            ...prev,
            open: false,
          }))
        }
      >
        <Alert
          severity={snack.severity}
          variant="filled"
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}