import api from './api';

//auth user 
export const Auth = async () => {
    try{
        const response= await api.get("/auth/me");
        return response.data;
    } catch (error){
        throw new Error("session indisponible reconnectez vous de nouveau");
    }
};

//login
export const loginAxios = async (email, password) => {
    if (!email || !password) {
        throw new Error("Please fill all fields.");
    }
    try{
        const response = await api.post("/login", {email, password});
        return response.data.user;
    }catch (error){
        const errorMsg =
        error.response?.data?.message || error.message || "Connexion échouée Veuillez Contacter le Support Technique pour Resoudre le problem";
        throw new Error(errorMsg);
    }
};


// Register
export const registerAxios = async (formData) => {
    if (!formData) {
        throw new Error("SVP! entrez les informations d'inscription");
    }
    try {
        const response = await api.post("/register", formData);
        return response.data.user;
    } catch (error) {
        const errorMsg =
            error.response?.data?.message || 
            error.message || 
            "Inscription échouée. Veuillez contacter le support technique pour résoudre le problème.";
        throw new Error(errorMsg);
    }
};

// Logout - Déconnexion de l'utilisateur
export const logoutAxios = async () => {
    try {
        // Envoie de la requête POST au backend Flask pour détruire le cookie
        const response = await api.post("/logout");
        return response.data;
    } catch (error) {
        // Extraction et traitement du message d'erreur renvoyé par le serveur
        const errorMsg =
            error.response?.data?.message || 
            error.message || 
            "Erreur lors de la déconnexion. Veuillez réessayer.";
        throw new Error(errorMsg);
    }
};

