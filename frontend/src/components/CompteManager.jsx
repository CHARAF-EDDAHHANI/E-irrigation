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
  CircularProgress
} from '@mui/material';
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
    <Box sx={{ bgcolor: '#f4f6f8', minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <CssBaseline />
        
        {/* TOP BAR / NAVIGATION PANEL */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a2035', letterSpacing: '-0.5px' }}>
              Portail d'Administration
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Gestion de la sécurité des utilisateurs et des rôles applicatifs
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="error"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ 
              textTransform: 'none', 
              fontWeight: 'bold', 
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)' 
            }}
          >
            Déconnexion
          </Button>
        </Box>

        <Grid container spacing={4}>
          {/* LEFT SIDE: OVERVIEW & STATS */}
          <Grid item xs={12} md={5}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2c3e50', mb: 2 }}>
              Vue d'ensemble des accès
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#e3f2fd', color: '#1e88e5', width: 48, height: 48 }}>
                      <GroupIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="textSecondary">Rôles Disponibles</Typography>
                      <Typography variant="h5" sx={{ fontWeight: 'bold' }}>4 Catégories</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#e8f5e9', color: '#43a047', width: 40, height: 40 }}>
                      <AssignmentIndIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">Opérationnel</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Agents</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ bgcolor: '#fff8e1', color: '#ffb300', width: 40, height: 40 }}>
                      <BusinessIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">Partenaires</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Entreprises</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: '#e1f5fe', color: '#0288d1', width: 40, height: 40 }}>
                      <AgricultureIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="textSecondary">Exploitation</Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Agriculteurs</Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT SIDE: MODERN FORM CONTAINER */}
          <Grid item xs={12} md={7}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4, 
                borderRadius: '16px', 
                border: '1px solid #eef2f6',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.03)'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PersonAddIcon color="primary" />
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1e293b' }}>
                  Inscrire un bénéficiaire
                </Typography>
              </Box>

              {error && <Alert severity="error" sx={{ borderRadius: '8px', mb: 3 }}>{error}</Alert>}
              {success && <Alert severity="success" sx={{ borderRadius: '8px', mb: 3 }}>{success}</Alert>}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                  
                  {/* SELECTEUR DE RÔLE */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      select
                      id="role"
                      label="Rôle du bénéficiaire"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    >
                      <MenuItem value="agent">Agent</MenuItem>
                      <MenuItem value="company">Entreprise (Société)</MenuItem>
                      <MenuItem value="farmer">Agriculteur</MenuItem>
                      <MenuItem value="admin">Administrateur</MenuItem>
                    </TextField>
                  </Grid>

                  {/* NOM COMPLET */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="fullName"
                      label="Pseudo / Nom Complet"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>

                  {/* EMAIL */}
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Adresse Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>

                  {/* 📞 TELEPHONE DYNAMIQUE */}
                  {showPhoneField && (
                    <Grid item xs={12} sm={showNationalIdField ? 6 : 12}>
                      <TextField
                        required
                        fullWidth
                        id="phone"
                        label="Numéro de Téléphone"
                        name="phone"
                        placeholder="+2126..."
                        value={formData.phone}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Grid>
                  )}

                  {/* 🪪 ID NATIONAL DYNAMIQUE */}
                  {showNationalIdField && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="national_id"
                        label="ID National (CIN)"
                        name="national_id"
                        placeholder="Ex: GH12233"
                        value={formData.national_id}
                        onChange={handleChange}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                      />
                    </Grid>
                  )}

                  {/* MOT DE PASSE */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="password"
                      label="Mot de passe"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>

                  {/* CONFIRMATION MOT DE PASSE */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="confirmPassword"
                      label="Confirmer mot de passe"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                    />
                  </Grid>

                  {/* BOUTON DE SOUMISSION */}
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      sx={{
                        py: 1.5,
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        fontSize: '16px',
                        boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)'
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : "Créer le compte"}
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