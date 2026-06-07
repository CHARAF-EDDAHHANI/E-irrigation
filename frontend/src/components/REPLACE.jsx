import { useState } from "react";
import {
  Box,
  Card,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Paper,
} from "@mui/material";

import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";

import { CreateFolderAxios } from "../Axios/folderAxios";

export default function CreateFolder({ onCreate }) {

  // ─────────────────────────────────────────────
  // FORM STATE
  // ─────────────────────────────────────────────

  const initialState = {
    folder_name: "",
    case_manager: "",
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
    company_id: "",

    crop: "",

    approval: false,
    invoiced: false,
    completed: false,
    renewal: false,

    documents: "",
    comment: "",
    datetime: "",
  };

  const [form, setForm] = useState(initialState);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  // ─────────────────────────────────────────────
  // HANDLE CHANGE
  // ─────────────────────────────────────────────

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ─────────────────────────────────────────────
  // HANDLE SWITCH
  // ─────────────────────────────────────────────

  const handleSwitch = (e) => {

    const { name, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // ─────────────────────────────────────────────
  // SUBMIT
  // ─────────────────────────────────────────────

  const handleSubmit = async () => {

    try {

      setLoading(true);

      setMessage({
        type: "",
        text: "",
      });

      const payload = {
        ...form,

        area: Number(form.area || 0),

        investment: Number(form.investment || 0),

        investment_per_hectare: Number(
          form.investment_per_hectare || 0
        ),

        reimbursed_investment: Number(
          form.reimbursed_investment || 0
        ),

        subsidy: Number(form.subsidy || 0),

        percentage: Number(form.percentage || 0),
      };

      const response = await CreateFolderAxios(payload);

      console.log("Folder created:", response);

      if (onCreate) {
        onCreate(response);
      }

      setMessage({
        type: "success",
        text: "Dossier créé avec succès.",
      });

      setForm(initialState);

    } catch (error) {

      setMessage({
        type: "error",
        text: error.message,
      });

    } finally {

      setLoading(false);

    }
  };

  // ─────────────────────────────────────────────
  // INPUT CONFIG
  // ─────────────────────────────────────────────

  const fields = [
    {
      label: "Nom du Dossier",
      name: "folder_name",
      md: 6,
    },

    {
      label: "Exploitant",
      name: "beneficiary_name",
      md: 6,
    },

    {
      label: "CIN / CNE",
      name: "national_id",
      md: 6,
    },

    {
      label: "Année Dépôt",
      name: "deposit_year",
      type: "number",
      md: 4,
    },

    {
      label: "CVM",
      name: "cvm",
      md: 4,
    },

     {
      label: "Agent Chargé",
      name: "case_manager",
      md: 6,
    },

    {
      label: "Culture",
      name: "crop",
      md: 4,
    },

    {
      label: "Superficie (ha)",
      name: "area",
      type: "number",
      md: 4,
    },

    {
      label: "Investissement",
      name: "investment",
      type: "number",
      md: 4,
    },

    {
      label: "Investissement / ha",
      name: "investment_per_hectare",
      type: "number",
      md: 4,
    },

    {
      label: "Investissement Retenu",
      name: "reimbursed_investment",
      type: "number",
      md: 4,
    },

    {
      label: "Subvention",
      name: "subsidy",
      type: "number",
      md: 4,
    },

    {
      label: "Pourcentage",
      name: "percentage",
      type: "number",
      md: 4,
    },

    {
      label: "Entreprise",
      name: "company",
      md: 6,
    },

    {
      label: "ICE Entreprise",
      name: "company_id",
      md: 6,
    },

    {
      label: "Documents",
      name: "documents",
      md: 12,
    },
  ];

  // ─────────────────────────────────────────────
  // UI
  // ─────────────────────────────────────────────

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg, #f4f7fb 0%, #eef2f7 100%)",
        p: {
          xs: 2,
          md: 4,
        },
      }}
    >

      <Card
        elevation={0}
        sx={{
          maxWidth: 1400,
          mx: "auto",

          borderRadius: "28px",

          overflow: "hidden",

          border: "1px solid #e5e7eb",

          backdropFilter: "blur(10px)",

          background:
            "rgba(255,255,255,0.9)",
        }}
      >

        {/* HEADER */}

        <Box
          sx={{
            p: 4,

            background:
              "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",

            color: "white",
          }}
        >

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >

            <FolderOpenOutlinedIcon
              sx={{
                fontSize: 42,
              }}
            />

            <Box>

              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                }}
              >
                Nouveau Dossier
              </Typography>

              <Typography
                sx={{
                  opacity: 0.8,
                  mt: 0.5,
                }}
              >
                Gestion moderne des dossiers agricoles et irrigation
              </Typography>

            </Box>

          </Box>

        </Box>

        {/* CONTENT */}

        <Box sx={{ p: 4 }}>

          {/* STATUS */}

          {message.text && (

            <Paper
              elevation={0}
              sx={{
                mb: 3,

                p: 2,

                borderRadius: 3,

                border:
                  message.type === "success"
                    ? "1px solid #bbf7d0"
                    : "1px solid #fecaca",

                background:
                  message.type === "success"
                    ? "#f0fdf4"
                    : "#fef2f2",

                color:
                  message.type === "success"
                    ? "#166534"
                    : "#991b1b",
              }}
            >
              {message.text}
            </Paper>
          )}

          {/* FORM */}

          <Grid container spacing={3}>

            {fields.map((field) => (

              <Grid
                item
                xs={12}
                md={field.md}
                key={field.name}
              >

                <TextField
                  fullWidth

                  label={field.label}

                  name={field.name}

                  type={field.type || "text"}

                  value={form[field.name]}

                  onChange={handleChange}

                  variant="outlined"

                  InputProps={{
                    sx: {
                      borderRadius: "16px",
                      backgroundColor: "#ffffff",
                    },
                  }}

                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "16px",
                    },
                  }}
                />

              </Grid>
            ))}

            {/* PHASE */}

            <Grid item xs={12} md={6}>

              <TextField
                fullWidth
                select

                label="Phase"

                name="phase"

                value={form.phase}

                onChange={handleChange}

                InputProps={{
                  sx: {
                    borderRadius: "16px",
                  },
                }}
              >

                <MenuItem value="prealable">
                  Préalable
                </MenuItem>

                <MenuItem value="validation">
                  Validation
                </MenuItem>

                <MenuItem value="execution">
                  Exécution
                </MenuItem>

                <MenuItem value="cloture">
                  Clôture
                </MenuItem>

              </TextField>

            </Grid>

            {/* COMMENT */}

            <Grid item xs={12}>

              <TextField
                fullWidth

                multiline

                rows={5}

                label="Commentaire"

                name="comment"

                value={form.comment}

                onChange={handleChange}

                InputProps={{
                  sx: {
                    borderRadius: "16px",
                  },
                }}
              />

            </Grid>

          </Grid>

          {/* SWITCHES */}

          <Divider sx={{ my: 4 }} />

          <Typography
            variant="h6"
            sx={{
              mb: 3,
              fontWeight: 700,
            }}
          >
            État du dossier
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 3,
            }}
          >

            <FormControlLabel
              control={
                <Switch
                  checked={form.approval}
                  onChange={handleSwitch}
                  name="approval"
                />
              }
              label="Approuvé"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.invoiced}
                  onChange={handleSwitch}
                  name="invoiced"
                />
              }
              label="Facturé"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.completed}
                  onChange={handleSwitch}
                  name="completed"
                />
              }
              label="Réalisé"
            />

            <FormControlLabel
              control={
                <Switch
                  checked={form.renewal}
                  onChange={handleSwitch}
                  name="renewal"
                />
              }
              label="Renouvellement"
            />

          </Box>

          {/* ACTION */}

          <Box
            sx={{
              mt: 5,

              display: "flex",

              justifyContent: "flex-end",
            }}
          >

            <Button
              variant="contained"

              onClick={handleSubmit}

              disabled={loading}

              startIcon={
                loading
                  ? null
                  : <SaveOutlinedIcon />
              }

              sx={{
                px: 5,
                py: 1.6,

                borderRadius: "18px",

                textTransform: "none",

                fontSize: 16,

                fontWeight: 700,

                background:
                  "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",

                boxShadow:
                  "0 10px 25px rgba(37,99,235,0.25)",

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow:
                    "0 14px 30px rgba(37,99,235,0.35)",
                },

                transition: "all 0.25s ease",
              }}
            >
              {loading
                ? "Création..."
                : "Créer le dossier"}
            </Button>

          </Box>

        </Box>

      </Card>

    </Box>
  );
}