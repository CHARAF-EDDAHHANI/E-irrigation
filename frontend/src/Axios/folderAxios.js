import api from "./api";

// ─────────────────────────────────────────────
// CREATE FOLDER
// ─────────────────────────────────────────────

export const CreateFolderAxios = async (form) => {

  // validation
  if (!form) {
    throw new Error("Veuillez remplir tous les champs.");
  }

  try {
    console.log(form);
    const response = await api.post(
      "/create-folder",
      form
    );

    return response.data;

  } catch (error) {

    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Création du dossier échouée. Veuillez contacter le support technique.";

    throw new Error(errorMsg);
  }
};

//---------------
//GET ALL FOLDERS
//---------------
export const fetchAllFolders = async() => {
  try {
    const response = await api.get("/allfolders");
    const data = response.data;
    
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === "object") {
      if (Array.isArray(data.folders)) return data.folders;
      if (Array.isArray(data.data)) return data.data;
      if (Object.keys(data).length > 0) {
      return [data];
    }
  }
  return [];
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "erreur de trouver les dossier, essayez plus tard";
    throw new Error(errorMsg);
  }
};

//------------
// GET FOLDER BY ID
//-----------

export const fetchFolderById = async (folder_id) => {
  try {
    const response = await api.get(`/folders/${folder_id}`);
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.message ||
      "Erreur lors du chargement du dossier";
    throw new Error(errorMsg);
  }
};