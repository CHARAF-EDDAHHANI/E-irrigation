import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  TextField,
  Button, 
  Alert, 
  CssBaseline,
  Paper,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  CircularProgress
} from '@mui/material';
import ShieldIcon from '@mui/icons-material/Shield'
import LogoutIcon from '@mui/icons-material/Logout';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import GroupIcon from '@mui/icons-material/Group';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import BusinessIcon from '@mui/icons-material/Business';
import AgricultureIcon from '@mui/icons-material/Agriculture'; 
import { registerAxios, logoutAxios } from "../Axios/userAxios";


export default function CompteManager() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    phone: '',        
    national_id: '',  
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Liste des rôles nécessitant le téléphone (Défini proprement au sein du composant)
  const EXTENDED_ROLES = ['farmer', 'company'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleLogout = async () => {
    try {
      await logoutAxios();
      window.location.reload();
    } catch (err) {
      setError(err.message || 'Erreur lors de la déconnexion.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!formData.role || !formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('SVP! Remplissez toutes les données obligatoires.');
      setLoading(false);
      return;
    }

    if (EXTENDED_ROLES.includes(formData.role) && (!formData.phone || formData.phone.trim() === '')) {
      setError('Le numéro de téléphone est obligatoire pour ce type de compte.');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Adresse email non valide.');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mots de passe non conformes !');
      setLoading(false);
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      fullName: formData.fullName,
      role: formData.role,
    };

    if (EXTENDED_ROLES.includes(formData.role)) {
      payload.phone = formData.phone.trim();
    }

    if (
      formData.role === 'farmer' &&
      formData.national_id &&
      formData.national_id.trim() !== ''
    ) {
      payload.national_id = formData.national_id.trim();
    }

    try {
      await registerAxios(payload); 
      setSuccess('Compte créé avec succès !');
      setError(''); 
      
      setFormData({ 
        fullName: '', 
        email: '', 
        password: '', 
        confirmPassword: '', 
        role: '', 
        phone: '', 
        national_id: '' 
      });
    } catch (err) {
      setSuccess('');
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  // Le téléphone s'affiche pour les agriculteurs (farmer) et les entreprises (company)
  const showPhoneField = ['farmer', 'company'].includes(formData.role);

  // Le CIN s'affiche UNIQUEMENT pour l'agriculteur (farmer)
  const showNationalIdField = formData.role === 'farmer';


   return (
  <Box sx={{ bgcolor: 'var(--color-background-tertiary)', minHeight: '100vh', py: 4, px: 3 }}>
    <Container maxWidth="lg">
      <CssBaseline />

      {/* TOP BAR */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 500, color: 'text.primary', letterSpacing: '-0.3px', fontSize: '22px' }}>
            Portail d'administration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: '2px', fontSize: '13px' }}>
            Gestion de la sécurité des utilisateurs et des rôles applicatifs
          </Typography>
        </Box>

        <Button
          variant="outlined"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{ textTransform: 'none', fontWeight: 500, borderRadius: '8px', fontSize: '13px', borderWidth: '0.5px' }}
        >
          Déconnexion
        </Button>
      </Box>

      <Grid container spacing={3}>

        {/* LEFT PANEL */}
        <Grid item xs={12} md={4}>
          <Typography sx={{ fontSize: '11px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.8px', textTransform: 'uppercase', mb: 1.5 }}>
            Vue d'ensemble des accès
          </Typography>

          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '0.5px solid', borderColor: 'divider' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '14px !important' }}>
                  <Avatar sx={{ bgcolor: '#E6F1FB', color: '#185FA5', borderRadius: '8px', width: 38, height: 38 }}>
                    <ShieldIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Rôles disponibles</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>4 catégories</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '0.5px solid', borderColor: 'divider' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '14px !important' }}>
                  <Avatar sx={{ bgcolor: '#EAF3DE', color: '#3B6D11', borderRadius: '8px', width: 38, height: 38 }}>
                    <AssignmentIndIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Opérationnel</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>Agents</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={6}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '0.5px solid', borderColor: 'divider' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '14px !important' }}>
                  <Avatar sx={{ bgcolor: '#FAEEDA', color: '#854F0B', borderRadius: '8px', width: 38, height: 38 }}>
                    <BusinessIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Partenaires</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>Entreprises</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={0} sx={{ borderRadius: 2, border: '0.5px solid', borderColor: 'divider' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: '14px !important' }}>
                  <Avatar sx={{ bgcolor: '#E1F5EE', color: '#0F6E56', borderRadius: '8px', width: 38, height: 38 }}>
                    <AgricultureIcon sx={{ fontSize: 18 }} />
                  </Avatar>
                  <Box>
                    <Typography sx={{ fontSize: '11px', color: 'text.secondary' }}>Exploitation</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>Agriculteurs</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* RIGHT FORM */}
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3.5, borderRadius: 3, border: '0.5px solid', borderColor: 'divider' }}>

            {/* FORM HEADER */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5, pb: 2, borderBottom: '0.5px solid', borderColor: 'divider' }}>
              <PersonAddIcon color="info" sx={{ fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 500, fontSize: '18px' }}>
                Inscrire un bénéficiaire
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '13px' }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2, borderRadius: 2, fontSize: '13px' }}>{success}</Alert>}

            {!error && !success && (
              <Alert severity="info" sx={{ mb: 2, borderRadius: 2, fontSize: '13px' }}>
                Sélectionnez un rôle pour personnaliser le formulaire.
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>

              {/* ROLE LABEL */}
              <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 1 }}>
                Rôle du bénéficiaire
              </Typography>

              {/* ROLE PILLS */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {[
                  { value: 'agent', label: 'Agent', icon: <AssignmentIndIcon sx={{ fontSize: 15 }} />, activeColor: { bg: '#E6F1FB', border: '#378ADD', color: '#0C447C' } },
                  { value: 'company', label: 'Entreprise', icon: <BusinessIcon sx={{ fontSize: 15 }} />, activeColor: { bg: '#FAEEDA', border: '#BA7517', color: '#633806' } },
                  { value: 'farmer', label: 'Agriculteur', icon: <AgricultureIcon sx={{ fontSize: 15 }} />, activeColor: { bg: '#EAF3DE', border: '#3B6D11', color: '#27500A' } },
                  { value: 'admin', label: 'Administrateur', icon: <ShieldIcon sx={{ fontSize: 15 }} />, activeColor: { bg: '#FBEAF0', border: '#D4537E', color: '#72243E' } },
                ].map(({ value, label, icon, activeColor }) => {
                  const isActive = formData.role === value;
                  return (
                    <Box
                      key={value}
                      onClick={() => setFormData(prev => ({ ...prev, role: value }))}
                      sx={{
                        display: 'flex', alignItems: 'center', gap: 0.75,
                        px: 1.75, py: 0.875,
                        borderRadius: '999px',
                        border: '0.5px solid',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: isActive ? 500 : 400,
                        transition: 'all 0.15s',
                        bgcolor: isActive ? activeColor.bg : 'background.default',
                        borderColor: isActive ? activeColor.border : 'divider',
                        color: isActive ? activeColor.color : 'text.secondary',
                        '&:hover': { borderColor: 'text.primary' }
                      }}
                    >
                      {icon} {label}
                    </Box>
                  );
                })}
              </Box>

              <Grid container spacing={1.5}>

                {/* NAME */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 0.75 }}>
                    Pseudo / Nom complet
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Ex: Jean Dupont"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '14px', bgcolor: 'action.hover' },
                      '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0.5px' }
                    }}
                  />
                </Grid>

                {/* EMAIL */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 0.75 }}>
                    Email
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="jean@exemple.com"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '14px', bgcolor: 'action.hover' },
                      '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0.5px' }
                    }}
                  />
                </Grid>

                {/* PHONE */}
                {showPhoneField && (
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 0.75 }}>
                      Téléphone
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="+212 600 000 000"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '14px', bgcolor: 'action.hover' },
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0.5px' }
                      }}
                    />
                  </Grid>
                )}

                {/* CIN */}
                {showNationalIdField && (
                  <Grid item xs={12} sm={6}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 0.75 }}>
                      CIN
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="AB123456"
                      name="national_id"
                      value={formData.national_id}
                      onChange={handleChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '14px', bgcolor: 'action.hover' },
                        '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0.5px' }
                      }}
                    />
                  </Grid>
                )}

                {/* PASSWORD */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 0.75 }}>
                    Mot de passe
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    placeholder="••••••••"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '14px', bgcolor: 'action.hover' },
                      '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0.5px' }
                    }}
                  />
                </Grid>

                {/* CONFIRM PASSWORD */}
                <Grid item xs={12} sm={6}>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'text.secondary', letterSpacing: '0.3px', textTransform: 'uppercase', mb: 0.75 }}>
                    Confirmer mot de passe
                  </Typography>
                  <TextField
                    fullWidth
                    type="password"
                    placeholder="••••••••"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    variant="outlined"
                    sx={{
                      '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '14px', bgcolor: 'action.hover' },
                      '& .MuiOutlinedInput-notchedOutline': { borderWidth: '0.5px' }
                    }}
                  />
                </Grid>

                {/* SUBMIT */}
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    startIcon={!loading && <PersonAddIcon />}
                    sx={{
                      py: 1.25, mt: 0.5,
                      borderRadius: 2,
                      fontWeight: 500,
                      textTransform: 'none',
                      fontSize: '14px',
                      boxShadow: 'none',
                      '&:hover': { boxShadow: 'none' }
                    }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Créer le compte'}
                  </Button>
                </Grid>

              </Grid>
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Container>
  </Box>
);
}