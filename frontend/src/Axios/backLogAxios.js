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

//send message + file
export const sendMessage = async (backlogbox_id, content, file = null) => {
  try {
    let res;
    if (file) {
      const body = new FormData();
      body.append("content", content || "");
      body.append("file", file);
      res = await api.post(`/backlog/${backlogbox_id}`, body, {
        withCredentials: true,
        // No Content-Type header — axios sets multipart boundary automatically
      });
      console.log(res);
    } else {
      res = await api.post(
        `/backlog/${backlogbox_id}`,
        { content },
        { withCredentials: true }
      );
    }
    return res.data.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message || "Erreur envoi message";
    throw new Error(errorMsg);
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