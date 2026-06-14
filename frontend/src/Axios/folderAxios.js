import api from "./api";

// ─── CREATE FOLDER (FormData: fields + files) ─────────────────────────────────
export const CreateFolderAxios = async (body) => {
  console.log(body);
  try {
    const res = await api.post("/create-folder", body, {
      headers: {
        // DO NOT set Content-Type — axios sets multipart boundary automatically
      },
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur lors de la création du dossier";
    throw new Error(errorMsg);
  }
};

// ─── GET ALL FOLDERS ──────────────────────────────────────────────────────────
export const fetchAllFolders = async () => {
  try {
    const res = await api.get("/allfolders");
    const data = res.data;
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.folders)) return data.folders;
      if (Array.isArray(data.data))    return data.data;
      if (Object.keys(data).length > 0) return [data];
    }
    return [];
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur de chargement des dossiers";
    throw new Error(errorMsg);
  }
};

// ─── GET FOLDER BY ID ─────────────────────────────────────────────────────────
export const fetchFolderById = async (folder_id) => {
  try {
    const res = await api.get(`/folders/${folder_id}`);
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur lors du chargement du dossier";
    throw new Error(errorMsg);
  }
};

// ─── GET DOCUMENTS BY FOLDER ──────────────────────────────────────────────────
export const fetchFolderDocuments = async (folder_id) => {
  try {
    const res = await api.get(`/folder/${folder_id}/documents`);
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur lors du chargement des documents";
    throw new Error(errorMsg);
  }
};

// ─── UPLOAD PDF TO EXISTING FOLDER ───────────────────────────────────────────
export const uploadFolderDocument = async (folder_id, files) => {
  try {
    const body = new FormData();
    files.forEach(file => body.append("files", file));
    const res = await api.post(`/folder/${folder_id}/upload`, body, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur lors de l'upload";
    throw new Error(errorMsg);
  }
};

// ─── DELETE DOCUMENT ──────────────────────────────────────────────────────────
export const deleteFolderDocument = async (folder_id, doc_id) => {
  try {
    const res = await api.delete(`/folder/${folder_id}/documents/${doc_id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur lors de la suppression";
    throw new Error(errorMsg);
  }
};