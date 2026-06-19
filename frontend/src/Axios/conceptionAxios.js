import api from "./api";

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

export const checkServerHealth = async () => {
  try {
    const res = await api.get(`/health`);
    return res.data.status === "ok";
  } catch {
    return false;
  }
};

//LUNCH CONCEPTION AND SAVE _ RETURN CONCEPTION-DATA
export const calculateAndSave = async (formPayload) => {
  // Step 1 — calculate
  const calcRes = await api.post("/calculate", formPayload, { withCredentials: true });
  const calcData = calcRes.data;
  if (!calcData.success) throw new Error(calcData.error || "Erreur de calcul.");

  // Step 2 — save
  const saveRes = await api.post("/conceptions/save", {
    folder_id:    formPayload.folder_id,
    dossier_name: formPayload.dossier_name,
    input:        formPayload,
    results:      calcData.results,
  }, { withCredentials: true });

  const saveData = saveRes.data;
  if (!saveData.success) throw new Error(saveData.error || "Erreur d'enregistrement.");

  return {
    conception_id: saveData.conception_id,
    results:       calcData.results,
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// CHECK IF CONCEPTION EXISTS FOR A FOLDER
// ─────────────────────────────────────────────────────────────────────────────

export const checkConceptionByFolder = async (folder_id) => {
  try {
    const res = await api.get(`/conceptions/folder/${folder_id}`, { withCredentials: true });
    return res.data.success;
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCH LATEST FULL CONCEPTION FOR A FOLDER (for ConceptionVision)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchConceptionByFolder = async (folder_id) => {
  try {
    const res = await api.get(`/conceptions/folder/${folder_id}`, { withCredentials: true });
    return res.data.data;
  } catch (error) {
    const errorMsg = error.response?.data?.error || error.message || "Erreur conception";
    throw new Error(errorMsg);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVE CONCEPTION MANUALLY (from ConceptionVision confirm button if needed)
// ─────────────────────────────────────────────────────────────────────────────

export const saveConceptionAxios = async (payload) => {
  if (!payload?.folder_id) throw new Error("folder_id manquant.");
  const res = await api.post("/conceptions/save", payload, { withCredentials: true });
  if (!res.data.success) throw new Error(res.data.error || "Erreur d'enregistrement.");
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// Delete CONCEPTION MANUALLY (confirm button  needed)
// ─────────────────────────────────────────────────────────────────────────────
export const deleteConceptionByFolderAxios = async (folder_id) => {
  try {
    const res = await api.delete(`/conceptions/folder/${folder_id}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    const errorMsg = error.response?.data?.message || error.message || "Erreur suppression conception";
    throw new Error(errorMsg);
  }
};