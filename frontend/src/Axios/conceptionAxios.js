import api from "./api";

const BASE = "http://localhost:5000/api";

// ─────────────────────────────────────────────────────────────────────────────
// HEALTH CHECK
// ─────────────────────────────────────────────────────────────────────────────

export const checkServerHealth = async () => {
  try {
    const res = await fetch(`${BASE}/health`);
    const data = await res.json();
    return data.status === "ok";
  } catch {
    return false;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// CALCULATE + AUTO-SAVE  (Step 1 + Step 2 in one call)
// Called from ConceptionInsert on "Lancer le calcul"
// 1. POST /api/calculate  → get results
// 2. POST /api/conceptions/save → persist with folder_id
// Returns { conception_id, results } on success
// ─────────────────────────────────────────────────────────────────────────────

export const calculateAndSave = async (formPayload) => {
  // Step 1 — calculate
  const calcRes = await fetch(`${BASE}/calculate`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(formPayload),
  });
  const calcData = await calcRes.json();
  if (!calcData.success) throw new Error(calcData.error || "Erreur de calcul.");

  // Step 2 — save immediately
  const saveRes = await fetch(`${BASE}/conceptions/save`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder_id:    formPayload.folder_id,
      dossier_name: formPayload.dossier_name,
      input:        formPayload,
      results:      calcData.results,
    }),
  });
  const saveData = await saveRes.json();
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
  if (!folder_id) return false;
  
  try {
    const response = await api.get(`/conceptions/${folder_id}`);
        const data = response.data;
        return !!(data && data.success && data.data);
  } catch (error) {
    return false;
  }
};


// ─────────────────────────────────────────────────────────────────────────────
// FETCH LATEST FULL CONCEPTION FOR A FOLDER (for ConceptionVision)
// ─────────────────────────────────────────────────────────────────────────────

export const fetchConceptionByFolder = async (folder_id) => {
  if (!folder_id) {
    throw new Error("L'identifiant du dossier (folder_id) est manquant.");
  }

  try {
    const response = await api.get(`/conceptions/${folder_id}`);
    const data = response.data;

    if (!data || !data.success || !data.data) {
      throw new Error("Aucune conception trouvée pour ce dossier.");
    }

    return data.data;

  } catch (error) {
    const errorMsg = error.response?.data?.error || "Impossible de charger les données de conception.";
    throw new Error(errorMsg);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// SAVE CONCEPTION MANUALLY (from ConceptionVision confirm button if needed)
// ─────────────────────────────────────────────────────────────────────────────

export const saveConceptionAxios = async (payload) => {
  if (!payload?.folder_id) throw new Error("folder_id manquant.");
  const res  = await fetch(`${BASE}/conceptions/save`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || "Erreur d'enregistrement.");
  return data;
};