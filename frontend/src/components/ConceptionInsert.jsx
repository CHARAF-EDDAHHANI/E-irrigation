import { useState, useEffect } from "react";
import { calculateAndSave, checkServerHealth } from "../Axios/conceptionAxios";

// ─────────────────────────────────────────────────────────────────────────────
// SECTIONS NAV
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: "cultures",     label: "1. Besoins en Eau" },
  { id: "emitters",     label: "2. Distributeurs" },
  { id: "postes",       label: "3. Postes d'Irrigation" },
  { id: "rampe",        label: "4. Rampes" },
  { id: "porte_rampe",  label: "5. Porte-Rampes" },
  { id: "conduites",    label: "6. Conduites" },
  { id: "pompe_bassin", label: "7a. Pompe Bassin" },
  { id: "pompe_forage", label: "7b. Pompe Forage" },
  { id: "bassin",       label: "8. Bassin de Stockage" },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:          "#f4f6fa",
  surface:     "#ffffff",
  border:      "#dde2ec",
  borderFocus: "#2563eb",
  accent:      "#2563eb",
  accentLight: "#eff4ff",
  accentMid:   "#bfcff7",
  text:        "#18243a",
  label:       "#4a5a74",
  muted:       "#8898b0",
  danger:      "#dc2626",
  success:     "#16a34a",
  warning:     "#d97706",
  divider:     "#e8ecf5",
};

// ─────────────────────────────────────────────────────────────────────────────
// DEFAULT FORM DATA
// ─────────────────────────────────────────────────────────────────────────────

const defaultData = {
  dossier_name:   "",
  folder_id:      "",
  cultures:       [{ name: "AGRUME", ET0: 6, Kc: 0.65, Kr: 0.8 }],
  emitters:       [{ culture: "AGRUME", debit_goutteur: 3.47, ecart_rampe: 6, ecart_goutteur: 0.75, nb_rampes: 2, Pn: 10 }],
  emitter_params: { debit_goutteur: 3.47, ecart_goutteur: 0.75, ecart_rampe: 6 },
  postes:         [{ poste_id: 1, duree_h: 2.25, units: [{ unit_id: "U1", culture: "AGRUME", superficie: 46400 }] }],
  rampe:          { Lr: 66, Eg: 1.66, qg: 7.54, Dr: 13.8, pente: 0, Pentree: 10, Qr: 300 },
  porte_rampe:    { Lpr: 108, Edepart: 6, Qpr: 25230, pente: 3.1, Pentree: 0, Qdepart: 1402, diameter_mm: 84 },
  conduites:      [{ troncon: "T1", debit: 51.68, diam_ext: 200, diam_int: 117, longueur: 115 }],
  pompe_bassin:   { Q: 38.86, Pa: 23.2, PDCmax: 10, Ha: 2.85, NPSH: 5.15 },
  pompe_forage:   { Q: 38.5, Lfb: 123, diam_int: 103.7, delta_z: 1.4, delta_pfb: 3.2, Nd: 160, delta_pc: 5.2, rendement: 72 },
  bassin:         { hauteur: 4, longueur_gueule: 45, largeur_gueule: 33, longueur_radier: 37, largeur_radier: 25, superficie_nette_ha: 99, besoins_m3j: 551.29 },
};

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

function Field({ label, value, onChange, type = "number", unit = "", hint = "" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: focused ? C.accent : C.label, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 5, transition: "color 0.15s" }}>
        {label}{unit && <span style={{ fontWeight: 400, color: C.muted, marginLeft: 4, textTransform: "none" }}>{unit}</span>}
      </label>
      <input
        type={type} value={value}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        onChange={e => onChange(type === "number" ? (parseFloat(e.target.value) || 0) : e.target.value)}
        style={{
          width: "100%", boxSizing: "border-box",
          background: C.surface, border: `1.5px solid ${focused ? C.borderFocus : C.border}`,
          borderRadius: 6, padding: "9px 12px", fontSize: 13, color: C.text, outline: "none",
          boxShadow: focused ? `0 0 0 3px ${C.accentLight}` : "none", transition: "all 0.15s",
        }}
      />
      {hint && <p style={{ margin: "4px 0 0", fontSize: 10, color: C.muted }}>{hint}</p>}
    </div>
  );
}

function Grid({ children, cols = 2 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "14px 20px" }}>{children}</div>;
}

function Block({ title, children, onRemove }) {
  return (
    <div style={{ background: C.bg, border: `1px solid ${C.divider}`, borderRadius: 8, padding: "16px 20px", marginBottom: 14 }}>
      {title && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, letterSpacing: "0.08em", textTransform: "uppercase" }}>{title}</span>
          {onRemove && (
            <button onClick={onRemove}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer", fontSize: 12, padding: "2px 10px", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.borderColor = C.danger; e.target.style.color = C.danger; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>
              Supprimer
            </button>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

function AddBtn({ onClick, label }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? C.accentLight : C.surface, border: `1.5px dashed ${hov ? C.accent : C.border}`, borderRadius: 6, padding: "7px 18px", color: hov ? C.accent : C.muted, fontSize: 12, fontWeight: 600, cursor: "pointer", marginTop: 4, transition: "all 0.15s" }}>
      + {label}
    </button>
  );
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "26px 30px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ marginBottom: 22, borderBottom: `1px solid ${C.divider}`, paddingBottom: 16 }}>
        <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: C.text }}>{title}</h3>
        {subtitle && <p style={{ margin: "4px 0 0", fontSize: 12, color: C.muted }}>{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FOLDER SELECTOR — loads folders from GET /api/folders
// ─────────────────────────────────────────────────────────────────────────────

function FolderSelector({ value, onChange }) {
  const [folders, setFolders]     = useState([]);
  const [creating, setCreating]   = useState(false);
  const [newName, setNewName]     = useState("");
  const [loadErr, setLoadErr]     = useState(null);
  const [creating_, setCreating_] = useState(false);

  // Load folders on mount
  useEffect(() => {
    fetch(`${API}/folders`)
      .then(r => r.json())
      .then(d => { if (d.success) setFolders(d.data); })
      .catch(() => setLoadErr("Impossible de charger les dossiers."));
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating_(true);
    try {
      const res  = await fetch(`${API}/folders`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setFolders(f => [...f, data.data]);
        onChange(data.data.folder_id);
        setNewName("");
        setCreating(false);
      }
    } finally { setCreating_(false); }
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      {!creating ? (
        <>
          <select
            value={value}
            onChange={e => onChange(e.target.value)}
            style={{ background: C.bg, border: `1.5px solid ${value ? C.accent : C.border}`, borderRadius: 6, padding: "8px 12px", color: value ? C.text : C.muted, fontSize: 13, outline: "none", minWidth: 200 }}>
            <option value="">-- Choisir un dossier --</option>
            {folders.map(f => (
              <option key={f.folder_id} value={f.folder_id}>{f.name}</option>
            ))}
          </select>
          <button onClick={() => setCreating(true)}
            style={{ background: C.accentLight, border: `1px solid ${C.accentMid}`, borderRadius: 6, padding: "8px 14px", color: C.accent, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            + Nouveau dossier
          </button>
          {loadErr && <span style={{ color: C.danger, fontSize: 12 }}>{loadErr}</span>}
        </>
      ) : (
        <>
          <input
            autoFocus placeholder="Nom du nouveau dossier" value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleCreate()}
            style={{ background: C.surface, border: `1.5px solid ${C.accent}`, borderRadius: 6, padding: "8px 12px", fontSize: 13, color: C.text, outline: "none", width: 220 }}
          />
          <button onClick={handleCreate} disabled={creating_ || !newName.trim()}
            style={{ background: C.accent, border: "none", borderRadius: 6, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
            {creating_ ? "..." : "Creer"}
          </button>
          <button onClick={() => { setCreating(false); setNewName(""); }}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "8px 12px", color: C.muted, fontSize: 12, cursor: "pointer" }}>
            Annuler
          </button>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION FORMS (unchanged from original — wired to form state)
// ─────────────────────────────────────────────────────────────────────────────

function CulturesSection({ data, onChange }) {
  const add    = () => onChange([...data, { name: "", ET0: 6, Kc: 0.7, Kr: 0.7 }]);
  const remove = i => onChange(data.filter((_, j) => j !== i));
  const update = (i, k, v) => { const d = [...data]; d[i] = { ...d[i], [k]: v }; onChange(d); };
  return (
    <SectionCard title="Besoins en Eau par Culture" subtitle="Calcul des besoins hydriques journaliers par type de culture">
      {data.map((c, i) => (
        <Block key={i} title={`Culture ${i + 1}`} onRemove={data.length > 1 ? () => remove(i) : null}>
          <Grid cols={4}>
            <Field label="Nom" value={c.name} onChange={v => update(i, "name", v)} type="text" />
            <Field label="ET0" value={c.ET0} onChange={v => update(i, "ET0", v)} unit="mm/j" hint="Evapotranspiration de reference" />
            <Field label="Kc"  value={c.Kc}  onChange={v => update(i, "Kc", v)}  hint="Coefficient cultural" />
            <Field label="Kr"  value={c.Kr}  onChange={v => update(i, "Kr", v)}  hint="Coefficient de couverture" />
          </Grid>
        </Block>
      ))}
      <AddBtn onClick={add} label="Ajouter une culture" />
    </SectionCard>
  );
}

function EmittersSection({ data, onChange }) {
  const add    = () => onChange([...data, { culture: "", debit_goutteur: 4, ecart_rampe: 6, ecart_goutteur: 1, nb_rampes: 2, Pn: 10 }]);
  const remove = i => onChange(data.filter((_, j) => j !== i));
  const update = (i, k, v) => { const d = [...data]; d[i] = { ...d[i], [k]: v }; onChange(d); };
  return (
    <SectionCard title="Distributeurs et Ecartements" subtitle="Caracteristiques des goutteurs et espacement sur les rampes">
      {data.map((e, i) => (
        <Block key={i} title={`Emetteur ${i + 1}`} onRemove={data.length > 1 ? () => remove(i) : null}>
          <Grid cols={3}>
            <Field label="Culture" value={e.culture} onChange={v => update(i, "culture", v)} type="text" />
            <Field label="Debit goutteur" value={e.debit_goutteur} onChange={v => update(i, "debit_goutteur", v)} unit="l/h" />
            <Field label="Pression nominale Pn" value={e.Pn} onChange={v => update(i, "Pn", v)} unit="mCE" />
            <Field label="Ecart rampe" value={e.ecart_rampe} onChange={v => update(i, "ecart_rampe", v)} unit="m" />
            <Field label="Ecart goutteur" value={e.ecart_goutteur} onChange={v => update(i, "ecart_goutteur", v)} unit="m" />
            <Field label="Nb. rampes" value={e.nb_rampes} onChange={v => update(i, "nb_rampes", v)} />
          </Grid>
        </Block>
      ))}
      <AddBtn onClick={add} label="Ajouter un emetteur" />
    </SectionCard>
  );
}

function PostesSection({ data, onChange }) {
  const addPoste  = () => onChange([...data, { poste_id: data.length + 1, duree_h: 2.25, units: [{ unit_id: "U1", culture: "AGRUME", superficie: 10000 }] }]);
  const removePoste = i => onChange(data.filter((_, j) => j !== i));
  const updatePoste = (i, k, v) => { const d = [...data]; d[i] = { ...d[i], [k]: v }; onChange(d); };
  const addUnit   = i => { const d = [...data]; d[i].units = [...d[i].units, { unit_id: `U${d[i].units.length + 1}`, culture: "AGRUME", superficie: 10000 }]; onChange(d); };
  const removeUnit = (i, j) => { const d = [...data]; d[i].units = d[i].units.filter((_, k) => k !== j); onChange(d); };
  const updateUnit = (i, j, k, v) => { const d = [...data]; d[i].units[j] = { ...d[i].units[j], [k]: v }; onChange(d); };
  return (
    <SectionCard title="Postes d'Irrigation" subtitle="Organisation du reseau en postes et unites d'arrosage">
      {data.map((p, i) => (
        <Block key={i} title={`Poste ${p.poste_id}`} onRemove={data.length > 1 ? () => removePoste(i) : null}>
          <div style={{ marginBottom: 16, maxWidth: 200 }}>
            <Field label="Duree d'irrigation" value={p.duree_h} onChange={v => updatePoste(i, "duree_h", v)} unit="h" />
          </div>
          <div style={{ borderTop: `1px solid ${C.divider}`, paddingTop: 14 }}>
            <p style={{ margin: "0 0 10px", fontSize: 11, fontWeight: 600, color: C.label, textTransform: "uppercase", letterSpacing: "0.06em" }}>Unites de ce poste</p>
            {p.units.map((u, j) => (
              <div key={j} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: "0 12px", alignItems: "end", marginBottom: 10 }}>
                <Field label="Unite ID"   value={u.unit_id}    onChange={v => updateUnit(i, j, "unit_id", v)}    type="text" />
                <Field label="Culture"    value={u.culture}    onChange={v => updateUnit(i, j, "culture", v)}    type="text" />
                <Field label="Superficie" value={u.superficie} onChange={v => updateUnit(i, j, "superficie", v)} unit="m²" />
                {p.units.length > 1 && (
                  <button onClick={() => removeUnit(i, j)}
                    style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 4, color: C.muted, cursor: "pointer", fontSize: 11, padding: "2px 8px", marginBottom: 2, transition: "all 0.15s" }}
                    onMouseEnter={e => { e.target.style.borderColor = C.danger; e.target.style.color = C.danger; }}
                    onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>
                    Retirer
                  </button>
                )}
              </div>
            ))}
            <AddBtn onClick={() => addUnit(i)} label="Ajouter une unite" />
          </div>
        </Block>
      ))}
      <AddBtn onClick={addPoste} label="Ajouter un poste" />
    </SectionCard>
  );
}

function RampeSection({ data, onChange }) {
  const u = (k, v) => onChange({ ...data, [k]: v });
  return (
    <SectionCard title="Rampes" subtitle="Dimensionnement hydraulique des rampes goutteurs">
      <Grid cols={3}>
        <Field label="Longueur Lr"        value={data.Lr}      onChange={v => u("Lr", v)}      unit="m" />
        <Field label="Ecart goutteur Eg"  value={data.Eg}      onChange={v => u("Eg", v)}      unit="m" />
        <Field label="Debit goutteur qg"  value={data.qg}      onChange={v => u("qg", v)}      unit="l/h" />
        <Field label="Diametre int. Dr"   value={data.Dr}      onChange={v => u("Dr", v)}      unit="mm" />
        <Field label="Pente"              value={data.pente}   onChange={v => u("pente", v)}   unit="%" />
        <Field label="Pression entree"    value={data.Pentree} onChange={v => u("Pentree", v)} unit="mCE" />
        <Field label="Debit rampe Qr"     value={data.Qr}      onChange={v => u("Qr", v)}      unit="l/h" />
      </Grid>
    </SectionCard>
  );
}

function PorteRampeSection({ data, onChange }) {
  const u = (k, v) => onChange({ ...data, [k]: v });
  return (
    <SectionCard title="Porte-Rampes" subtitle="Conduites secondaires alimentant les rampes">
      <Grid cols={3}>
        <Field label="Longueur Lpr"     value={data.Lpr}         onChange={v => u("Lpr", v)}         unit="m" />
        <Field label="Ecart depart"     value={data.Edepart}     onChange={v => u("Edepart", v)}     unit="m" />
        <Field label="Debit total Qpr"  value={data.Qpr}         onChange={v => u("Qpr", v)}         unit="l/h" />
        <Field label="Pente"            value={data.pente}       onChange={v => u("pente", v)}       unit="%" />
        <Field label="Pression entree"  value={data.Pentree}     onChange={v => u("Pentree", v)}     unit="mCE" />
        <Field label="Debit depart"     value={data.Qdepart}     onChange={v => u("Qdepart", v)}     unit="l/h" />
        <Field label="Diametre int."    value={data.diameter_mm} onChange={v => u("diameter_mm", v)} unit="mm" />
      </Grid>
    </SectionCard>
  );
}

function ConduiteSection({ data, onChange }) {
  const add    = () => onChange([...data, { troncon: "", debit: 0, diam_ext: 110, diam_int: 103, longueur: 100 }]);
  const remove = i => onChange(data.filter((_, j) => j !== i));
  const update = (i, k, v) => { const d = [...data]; d[i] = { ...d[i], [k]: v }; onChange(d); };
  return (
    <SectionCard title="Conduites Principales et Antennes" subtitle="Reseau principal de distribution">
      {data.map((c, i) => (
        <Block key={i} title={`Troncon ${i + 1}`} onRemove={data.length > 1 ? () => remove(i) : null}>
          <Grid cols={5}>
            <Field label="Identifiant" value={c.troncon}  onChange={v => update(i, "troncon", v)}  type="text" />
            <Field label="Debit"       value={c.debit}    onChange={v => update(i, "debit", v)}    unit="m³/h" />
            <Field label="Diam. ext."  value={c.diam_ext} onChange={v => update(i, "diam_ext", v)} unit="mm" />
            <Field label="Diam. int."  value={c.diam_int} onChange={v => update(i, "diam_int", v)} unit="mm" />
            <Field label="Longueur"    value={c.longueur} onChange={v => update(i, "longueur", v)} unit="m" />
          </Grid>
        </Block>
      ))}
      <AddBtn onClick={add} label="Ajouter un troncon" />
    </SectionCard>
  );
}

function PompeBassinSection({ data, onChange }) {
  const u = (k, v) => onChange({ ...data, [k]: v });
  return (
    <SectionCard title="Groupe Motopompe — Bassin" subtitle="Pompe alimentee depuis le bassin de stockage">
      <Grid cols={3}>
        <Field label="Debit Q"           value={data.Q}      onChange={v => u("Q", v)}      unit="m³/h" />
        <Field label="Pression aval Pa"  value={data.Pa}     onChange={v => u("Pa", v)}     unit="mCE" />
        <Field label="PDC max"           value={data.PDCmax} onChange={v => u("PDCmax", v)} unit="mCE" />
        <Field label="Hauteur asp. Ha"   value={data.Ha}     onChange={v => u("Ha", v)}     unit="m" />
        <Field label="NPSH"              value={data.NPSH}   onChange={v => u("NPSH", v)}   unit="m" />
      </Grid>
    </SectionCard>
  );
}

function PompeForageSection({ data, onChange }) {
  const u = (k, v) => onChange({ ...data, [k]: v });
  return (
    <SectionCard title="Groupe Motopompe — Forage" subtitle="Pompe immergee dans le forage">
      <Grid cols={3}>
        <Field label="Debit Q"           value={data.Q}         onChange={v => u("Q", v)}         unit="m³/h" />
        <Field label="Longueur F-B"      value={data.Lfb}       onChange={v => u("Lfb", v)}       unit="m" />
        <Field label="Diametre int."     value={data.diam_int}  onChange={v => u("diam_int", v)}  unit="mm" />
        <Field label="Denivele dZ"       value={data.delta_z}   onChange={v => u("delta_z", v)}   unit="m" />
        <Field label="PDC conduite F-B"  value={data.delta_pfb} onChange={v => u("delta_pfb", v)} unit="mCE" />
        <Field label="Niveau dynamique"  value={data.Nd}        onChange={v => u("Nd", v)}        unit="m" />
        <Field label="PDC colonne"       value={data.delta_pc}  onChange={v => u("delta_pc", v)}  unit="mCE" />
        <Field label="Rendement"         value={data.rendement} onChange={v => u("rendement", v)} unit="%" />
      </Grid>
    </SectionCard>
  );
}

function BassinSection({ data, onChange }) {
  const u = (k, v) => onChange({ ...data, [k]: v });
  return (
    <SectionCard title="Bassin de Stockage" subtitle="Reservoir tampon pour l'autonomie d'irrigation">
      <Grid cols={3}>
        <Field label="Hauteur totale"      value={data.hauteur}             onChange={v => u("hauteur", v)}             unit="m" />
        <Field label="Longueur en gueule"  value={data.longueur_gueule}     onChange={v => u("longueur_gueule", v)}     unit="m" />
        <Field label="Largeur en gueule"   value={data.largeur_gueule}      onChange={v => u("largeur_gueule", v)}      unit="m" />
        <Field label="Longueur au radier"  value={data.longueur_radier}     onChange={v => u("longueur_radier", v)}     unit="m" />
        <Field label="Largeur au radier"   value={data.largeur_radier}      onChange={v => u("largeur_radier", v)}      unit="m" />
        <Field label="Superficie nette"    value={data.superficie_nette_ha} onChange={v => u("superficie_nette_ha", v)} unit="ha" />
        <Field label="Besoins journaliers" value={data.besoins_m3j}         onChange={v => u("besoins_m3j", v)}         unit="m³/j" />
      </Grid>
    </SectionCard>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ConceptionInsert({ folderId, folderName, setCurrentPage, setConceptionData }) {
  const [activeSection, setActiveSection] = useState("cultures");
  const [form, setForm]   = useState({ ...defaultData, folder_id: folderId || "", dossier_name: folderName || "" });
  const [loading, setLoading] = useState(false);
  const [status,  setStatus]  = useState(null);
  const [serverOk, setServerOk] = useState(null);

  // Sync props into form when folder changes
  useEffect(() => {
    setForm(f => ({ ...f, folder_id: folderId || "", dossier_name: folderName || "" }));
  }, [folderId, folderName]);

  // Health check via axios helper
  useEffect(() => {
    checkServerHealth().then(ok => setServerOk(ok));
  }, []);

  const updateSection = (key, val) => setForm(f => ({ ...f, [key]: val }));

  // ── Calculate + Save + Navigate to Vision automatically ───────────────────
  const handleCalculate = async () => {
    if (!form.folder_id) {
      setStatus({ type: "warn", msg: "folder_id manquant — revenez à la liste des dossiers." });
      return;
    }

    setLoading(true);
    setStatus(null);
    // Clear any stale results
    localStorage.removeItem("conception_results");

    try {
      const { conception_id, results } = await calculateAndSave(form);

      // Store in localStorage for Vision fallback
      localStorage.setItem("conception_results", JSON.stringify({
        input:         { ...form, folder_id: folderId, dossier_name: folderName },
        results,
        saved:         true,
        conception_id,
      }));

      // Pass data up to Dashboard and navigate to Vision immediately
      setConceptionData?.({ input: form, results, conception_id });
      setCurrentPage?.("conception-vision");

    } catch (err) {
      setStatus({ type: "error", msg: err.message || "Erreur inattendue." });
      setLoading(false);
    }
  };

  const sectionMap = {
    cultures:     <CulturesSection    data={form.cultures}     onChange={v => updateSection("cultures", v)} />,
    emitters:     <EmittersSection    data={form.emitters}     onChange={v => updateSection("emitters", v)} />,
    postes:       <PostesSection      data={form.postes}       onChange={v => updateSection("postes", v)} />,
    rampe:        <RampeSection       data={form.rampe}        onChange={v => updateSection("rampe", v)} />,
    porte_rampe:  <PorteRampeSection  data={form.porte_rampe}  onChange={v => updateSection("porte_rampe", v)} />,
    conduites:    <ConduiteSection    data={form.conduites}    onChange={v => updateSection("conduites", v)} />,
    pompe_bassin: <PompeBassinSection data={form.pompe_bassin} onChange={v => updateSection("pompe_bassin", v)} />,
    pompe_forage: <PompeForageSection data={form.pompe_forage} onChange={v => updateSection("pompe_forage", v)} />,
    bassin:       <BassinSection      data={form.bassin}       onChange={v => updateSection("bassin", v)} />,
  };

  const statusColors = {
    success: { bg: "#f0fdf4", border: "#bbf7d0", text: C.success },
    error:   { bg: "#fef2f2", border: "#fecaca", text: C.danger },
    warn:    { bg: "#fffbeb", border: "#fde68a", text: C.warning },
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text }}>

      {/* ── HEADER ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 58, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 5px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 4, height: 32, background: `linear-gradient(180deg, ${C.accent}, ${C.accentMid})`, borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Irrigation Goutte-a-Goutte
              {serverOk !== null && (
                <span style={{ marginLeft: 10, color: serverOk ? C.success : C.danger }}>
                  {serverOk ? "● Serveur OK" : "● Serveur hors ligne"}
                </span>
              )}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>Saisie de Conception</div>
          </div>
        </div>

        {/* Folder badge + action */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {/* Folder name — read-only, passed from Dashboard */}
          {form.dossier_name && (
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: C.accentLight, border: `1px solid ${C.accentMid}`,
              borderRadius: 8, padding: "6px 14px",
            }}>
              <span style={{ fontSize: 11, color: C.accent, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Dossier</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{form.dossier_name}</span>
            </div>
          )}
          <button onClick={handleCalculate} disabled={loading || serverOk === false}
            style={{ background: (loading || serverOk === false) ? C.divider : C.accent, border: "none", borderRadius: 7, padding: "9px 22px", color: (loading || serverOk === false) ? C.muted : "#fff", fontWeight: 700, fontSize: 13, cursor: (loading || serverOk === false) ? "not-allowed" : "pointer", boxShadow: loading ? "none" : "0 2px 10px rgba(37,99,235,0.25)", transition: "all 0.15s" }}>
            {loading ? "Calcul..." : "Lancer le calcul"}
          </button>
        </div>
      </div>

      {/* ── STATUS BANNER ── */}
      {status && (
        <div style={{ margin: "12px 32px 0", background: statusColors[status.type].bg, border: `1px solid ${statusColors[status.type].border}`, borderRadius: 7, padding: "10px 18px", color: statusColors[status.type].text, fontSize: 13, fontWeight: 500 }}>
          {status.msg}
        </div>
      )}

      <div style={{ display: "flex", height: "calc(100vh - 58px)" }}>

        {/* ── SIDEBAR ── */}
        <div style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.border}`, paddingTop: 20, flexShrink: 0, overflowY: "auto" }}>
          <p style={{ margin: "0 20px 10px", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>Sections</p>
          {SECTIONS.map(s => {
            const active = activeSection === s.id;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ width: "100%", background: active ? C.accentLight : "transparent", border: "none", borderLeft: `3px solid ${active ? C.accent : "transparent"}`, padding: "10px 20px", color: active ? C.accent : C.label, textAlign: "left", cursor: "pointer", fontSize: 12.5, fontWeight: active ? 700 : 500, fontFamily: "inherit", transition: "all 0.12s" }}>
                {s.label}
              </button>
            );
          })}
        </div>

        {/* ── CONTENT ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
          {sectionMap[activeSection]}
        </div>
      </div>
    </div>
  );
}