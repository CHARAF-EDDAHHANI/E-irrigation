import api from './api';
/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FETCH OR INITIALIZE DISCUSSION THREAD (GET ROUTE CLIC ACTION)
 * ─────────────────────────────────────────────────────────────────────────────
 * Triggered when clicking the "Message" button on a folder.
 * Returns the full BacklogBox object containing metadata and the messages array.
 */
export const fetchOrCreateChatByFolder = async (folder_id) => {
  if (!folder_id) {
    throw new Error("L'identifiant du dossier (folder_id) est obligatoire.");
  }

  try {
    // Hits: GET /api/backlog/folder/<folder_id>
    const response = await api.get(`/backlog/folder/${folder_id}`);
    const data = response.data;
    console.log(data);

    if (!data || !data.success || !data.data) {
      throw new Error("Impossible de structurer le canal de messagerie.");
    }

    // Returns the active BacklogBox dict (with metadata + nested messages array)
    return data.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "Une erreur est survenue lors de l'accès au fil de discussion.";
    throw new Error(errorMsg);
  }
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * APPEND A NEW CHAT MESSAGE BLOCK (POST ROUTE)
 * ─────────────────────────────────────────────────────────────────────────────
 * Appends a fresh text block into the folder's embedded chat array.
 * Note: sender_id and sender_type are captured securely server-side from cookies.
 */
export const sendMessage = async (backlogbox_id, content) => {
  if (!backlogbox_id) {
    throw new Error("erreur pour l'envoi.");
  }
  if (!content || content.trim() === "") {
    throw new Error("Le contenu du message ne peut pas être vide.");
  }

    try {
    const response = await api.post(`/backlog/${backlogbox_id}`, {
      content: content.trim(),
    });
    const data = response.data;
    if (data && data.success && data.data) {
      return data.data;
    }
    if (data && (data.messages || data.backlogbox_id)) {
      return data;
    }

    
  }catch(Error){
      throw new Error("Le serveur a renvoyé un format de réponse invalide.");
  }
};

//get all backlogboxes 
export const fetchbacklogboxs = async () => {

  try {
    // Hits: GET /api/backlogs
    const response = await api.get(`/backlogs`);
    const data = response.data;
    console.log(data);

    if (!data || !data.success || !data.data) {
      throw new Error("Impossible de connecte au serveur.");
    }

    // Returns the active BacklogBoxs dict
    return data.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.error ||
      error.message ||
      "Une erreur est survenue lors de l'accès au fil de discussion.";
    throw new Error(errorMsg);
  }
};