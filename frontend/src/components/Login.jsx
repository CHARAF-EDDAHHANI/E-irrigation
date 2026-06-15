import { useState } from "react";
import {
  Box, Button, TextField, Typography, InputAdornment,
  IconButton, Collapse, CircularProgress,
} from "@mui/material";
import {
  EmailOutlined, LockOutlined, Visibility,
  VisibilityOff, ArrowForward, ErrorOutlined,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";
import { loginAxios } from "../Axios/userAxios";

// ── TOKENS ────────────────────────────────────────────────────────────────────
const G = {
  dark:    "#14532d",
  mid:     "#16a34a",
  light:   "#4ade80",
  bg:      "#f0fdf4",
  border:  "#bbf7d0",
  surface: "#ffffff",
  text:    "#0f172a",
  sub:     "#475569",
  muted:   "#94a3b8",
  error:   "#dc2626",
  errorBg: "#fef2f2",
};

// ── FIELD STYLE ───────────────────────────────────────────────────────────────
const fieldSx = (hasError) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "14px",
    background: G.surface,
    fontSize: 14,
    transition: "box-shadow 0.18s",
    "& fieldset": {
      borderColor: hasError ? G.error : "#e2e8f0",
      borderWidth: "1.5px",
    },
    "&:hover fieldset": {
      borderColor: hasError ? G.error : "#94a3b8",
    },
    "&.Mui-focused fieldset": {
      borderColor: hasError ? G.error : G.mid,
      borderWidth: "1.5px",
    },
    "&.Mui-focused": {
      boxShadow: hasError
        ? `0 0 0 4px ${alpha(G.error, 0.08)}`
        : `0 0 0 4px ${alpha(G.mid, 0.12)}`,
    },
  },
  "& .MuiInputLabel-root": {
    fontSize: 13.5,
    fontWeight: 500,
    color: G.muted,
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: hasError ? G.error : G.mid,
  },
  "& .MuiFormHelperText-root": {
    fontSize: 11.5,
    marginTop: "4px",
    marginLeft: "2px",
  },
});

export default function Login({ onSuccess }) {
  const [form,        setForm]        = useState({ email: "", password: "" });
  const [errors,      setErrors]      = useState({});
  const [serverError, setServerError] = useState(null);
  const [isLoading,   setIsLoading]   = useState(false);
  const [showPass,    setShowPass]    = useState(false);

  const handleChange = ({ target: { name, value } }) => {
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name])  setErrors(p => ({ ...p, [name]: "" }));
    if (serverError)   setServerError(null);
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim())                        e.email    = "Email obligatoire";
    else if (!/\S+@\S+\.\S+/.test(form.email))    e.email    = "Format email invalide";
    if (!form.password.trim())                     e.password = "Mot de passe obligatoire";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      const user = await loginAxios(form.email, form.password);
      onSuccess?.(user);
    } catch (err) {
      setServerError(err.message || "Connexion impossible. Contactez le support.");
    } finally {
      setIsLoading(false);
    }
  };

  const filled = form.email && form.password;

  return (
    <Box sx={{
      minHeight: "100vh",
      bgcolor: G.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      px: 2,
    }}>

      {/* CARD */}
      <Box sx={{
        width: "100%",
        maxWidth: 420,
        bgcolor: G.surface,
        borderRadius: "24px",
        border: `1px solid ${G.border}`,
        boxShadow: "0 8px 40px rgba(22,163,74,0.08), 0 1px 4px rgba(0,0,0,0.04)",
        overflow: "hidden",
      }}>

        {/* TOP ACCENT BAR */}
        <Box sx={{
          height: 4,
          background: `linear-gradient(90deg, ${G.dark}, ${G.mid}, ${G.light})`,
        }} />

        <Box sx={{ px: 4, pt: 4, pb: 4 }}>

          {/* LOGO MARK */}
          <Box sx={{ display: "grid", jsutifyContent:"grid", justifyItems: "center", alignItems: "center", gap: 1.5, mb: 3 }}>
             {/* LOGO MARK */}
            <Box
              component="img"
              src="/logonv.png"
              alt="Logo"
              sx={{
                width: 80,
                height: 80,
                objectFit: "contain",
              }}
            />
            <Box>
              <Typography sx={{ fontSize: 15, fontWeight: 800, color: G.dark, letterSpacing: "0.08em", textTransform: "uppercase", }}>
                Système de Gestion
              </Typography>
            </Box>
          </Box>

          {/* HEADING */}
          <Typography sx={{ fontSize: 24, fontWeight: 800, color: G.text, lineHeight: 1.2, mb: 0.5 }}>
            Bon retour
          </Typography>
          <Typography sx={{ fontSize: 13.5, color: G.sub, mb: 3.5 }}>
            Connectez-vous à votre espace de gestion
          </Typography>

          {/* FORM */}
          <Box component="form" onSubmit={onSubmit} noValidate>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

              {/* EMAIL */}
              <TextField
                label="Adresse email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
                error={!!errors.email}
                helperText={errors.email}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailOutlined sx={{ fontSize: 18, color: errors.email ? G.error : G.muted }} />
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx(!!errors.email)}
              />

              {/* PASSWORD */}
              <TextField
                label="Mot de passe"
                name="password"
                type={showPass ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                disabled={isLoading}
                error={!!errors.password}
                helperText={errors.password}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ fontSize: 18, color: errors.password ? G.error : G.muted }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        onClick={() => setShowPass(s => !s)}
                        edge="end"
                        tabIndex={-1}
                        sx={{ color: G.muted, mr: -0.5 }}
                      >
                        {showPass
                          ? <VisibilityOff sx={{ fontSize: 17 }} />
                          : <Visibility   sx={{ fontSize: 17 }} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={fieldSx(!!errors.password)}
              />

            </Box>

            {/* SERVER ERROR */}
            <Collapse in={!!serverError}>
              <Box sx={{
                mt: 2,
                display: "flex", alignItems: "flex-start", gap: 1,
                p: "10px 14px",
                bgcolor: G.errorBg,
                border: `1px solid ${alpha(G.error, 0.2)}`,
                borderRadius: "10px",
              }}>
                <ErrorOutlined sx={{ fontSize: 16, color: G.error, mt: "1px", flexShrink: 0 }} />
                <Typography sx={{ fontSize: 12.5, color: G.error, lineHeight: 1.5 }}>
                  {serverError}
                </Typography>
              </Box>
            </Collapse>

            {/* SUBMIT */}
            <Button
              type="submit"
              fullWidth
              disabled={isLoading}
              endIcon={!isLoading && <ArrowForward sx={{ fontSize: 17 }} />}
              sx={{
                mt: 3,
                height: 50,
                borderRadius: "14px",
                textTransform: "none",
                fontSize: 14.5,
                fontWeight: 700,
                letterSpacing: "0.01em",
                background: filled && !isLoading
                  ? `linear-gradient(135deg, ${G.dark}, ${G.mid})`
                  : alpha(G.mid, 0.12),
                color: filled && !isLoading ? "white" : G.muted,
                boxShadow: filled && !isLoading
                  ? `0 4px 18px ${alpha(G.mid, 0.35)}`
                  : "none",
                transition: "all 0.2s ease",
                "&:hover": {
                  background: filled && !isLoading
                    ? `linear-gradient(135deg, ${G.dark}, #15803d)`
                    : alpha(G.mid, 0.15),
                  boxShadow: filled && !isLoading
                    ? `0 6px 24px ${alpha(G.mid, 0.42)}`
                    : "none",
                  transform: filled && !isLoading ? "translateY(-1px)" : "none",
                },
                "&:active": { transform: "translateY(0)" },
                "&.Mui-disabled": {
                  background: alpha(G.mid, 0.1),
                  color: G.muted,
                  boxShadow: "none",
                },
              }}
            >
              {isLoading
                ? <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CircularProgress size={16} sx={{ color: G.mid }} />
                    <span>Connexion...</span>
                  </Box>
                : "Se connecter"
              }
            </Button>
          </Box>

          {/* FOOTER */}
          <Typography sx={{
            mt: 3, textAlign: "center",
            fontSize: 12, color: G.muted, lineHeight: 1.6,
          }}>
            Accès réservé aux agents ORMVAM autorisés.<br />
            Problème de connexion ?{" "}
            <Box component="span" sx={{ color: G.mid, fontWeight: 600, cursor: "pointer" }}>
              Contactez le support
            </Box>
          </Typography>

        </Box>
      </Box>
    </Box>
  );
}
              