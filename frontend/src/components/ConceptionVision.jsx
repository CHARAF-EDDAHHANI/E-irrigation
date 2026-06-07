import { useState, useEffect } from "react";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, ReferenceLine, Cell,
} from "recharts";

// ─────────────────────────────────────────────────────────────────────────────
// API CONFIG
// ─────────────────────────────────────────────────────────────────────────────

const API = "http://localhost:5000/api";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

const C = {
  bg:       "#f4f6fa",
  surface:  "#ffffff",
  border:   "#dde2ec",
  divider:  "#e8ecf5",
  accent:   "#2563eb",
  accentLt: "#eff4ff",
  text:     "#18243a",
  label:    "#4a5a74",
  muted:    "#8898b0",
  danger:   "#dc2626",
  dangerLt: "#fef2f2",
  success:  "#16a34a",
  successLt:"#f0fdf4",
  warning:  "#d97706",
  warningLt:"#fffbeb",
  grid:     "#edf0f7",
  p1: "#2563eb",
  p2: "#0891b2",
  p3: "#d97706",
  p4: "#7c3aed",
  p5: "#059669",
  p6: "#db2777",
};

const PALETTE = [C.p1, C.p2, C.p3, C.p4, C.p5, C.p6];

// ─────────────────────────────────────────────────────────────────────────────
// TABS
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "besoins",       label: "Besoins en Eau" },
  { id: "distributeurs", label: "Distributeurs" },
  { id: "postes",        label: "Postes" },
  { id: "rampe",         label: "Rampe" },
  { id: "porte_rampe",   label: "Porte-Rampe" },
  { id: "pompes",        label: "Pompes" },
  { id: "bassin",        label: "Bassin" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SHARED CHART PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────

const axTick   = { fill: C.muted, fontSize: 11 };
const gridLine = { stroke: C.grid, strokeDasharray: "3 3" };

const Tip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: "10px 14px", fontSize: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
      <p style={{ margin: "0 0 6px", color: C.label, fontWeight: 600, fontSize: 11 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ margin: "2px 0", color: p.color, fontWeight: 500 }}>
          {p.name}: <strong style={{ color: C.text }}>
            {typeof p.value === "number"
              ? p.value.toLocaleString("fr-FR", { maximumFractionDigits: 3 })
              : p.value}
          </strong>
        </p>
      ))}
    </div>
  );
};

function KpiCard({ label, value, unit = "", color = C.accent, sub = "" }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "16px 20px", borderTop: `3px solid ${color}`, boxShadow: "0 1px 5px rgba(0,0,0,0.04)" }}>
      <p style={{ margin: "0 0 6px", fontSize: 10, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: C.text, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {typeof value === "number" ? value.toLocaleString("fr-FR", { maximumFractionDigits: 2 }) : value}
        {unit && <span style={{ fontSize: 12, fontWeight: 500, color: C.muted, marginLeft: 5 }}>{unit}</span>}
      </p>
      {sub && <p style={{ margin: "5px 0 0", fontSize: 11, color: C.muted }}>{sub}</p>}
    </div>
  );
}

function ChartCard({ title, children, span = 1 }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "20px 22px", gridColumn: `span ${span}`, boxShadow: "0 1px 5px rgba(0,0,0,0.04)" }}>
      <p style={{ margin: "0 0 16px", fontSize: 11, fontWeight: 700, color: C.label, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${C.divider}`, paddingBottom: 10 }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function KpiRow({ children, cols = 4 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 14, marginBottom: 20 }}>{children}</div>;
}

function ChartGrid({ children, cols = 2 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>{children}</div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// SECTION PANELS
// ─────────────────────────────────────────────────────────────────────────────

function BesoinPanel({ data }) {
  return (
    <>
      <KpiRow cols={Math.min(data.length, 4)}>
        {data.map((c, i) => (
          <KpiCard key={i} label={`${c.culture} — brut`} value={c.B_brute_mm} unit="mm/j" color={PALETTE[i % PALETTE.length]} />
        ))}
      </KpiRow>
      <ChartGrid>
        <ChartCard title="Besoins bruts et nets par culture (mm/j)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barGap={4} barSize={26}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="culture" tick={axTick} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.label }} />
              <Bar dataKey="B_brute_mm" name="Besoin brut" fill={C.p1} radius={[4,4,0,0]} />
              <Bar dataKey="B_net_mm"   name="Besoin net"  fill={C.p2} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Coefficients Kc et Kr par culture">
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={data}>
              <PolarGrid stroke={C.divider} />
              <PolarAngleAxis dataKey="culture" tick={{ fill: C.label, fontSize: 11 }} />
              <PolarRadiusAxis tick={{ fill: C.muted, fontSize: 9 }} />
              <Radar name="Kc" dataKey="Kc" stroke={C.p3} fill={C.p3} fillOpacity={0.2} />
              <Radar name="Kr" dataKey="Kr" stroke={C.p1} fill={C.p1} fillOpacity={0.15} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.label }} />
              <Tooltip content={<Tip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </>
  );
}

function DistributeurPanel({ data }) {
  return (
    <>
      <KpiRow cols={Math.min(data.length, 4)}>
        {data.map((d, i) => (
          <KpiCard key={i} label={`${d.culture} — dP`} value={d.delta_P} unit="mCE" color={PALETTE[i % PALETTE.length]} />
        ))}
      </KpiRow>
      <ChartGrid>
        <ChartCard title="Debit goutteur et surface couverte Sg">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barGap={6} barSize={22}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="culture" tick={axTick} />
              <YAxis yAxisId="l" tick={axTick} />
              <YAxis yAxisId="r" orientation="right" tick={axTick} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.label }} />
              <Bar yAxisId="l" dataKey="debit_goutteur" name="Debit (l/h)" fill={C.p1} radius={[4,4,0,0]} />
              <Bar yAxisId="r" dataKey="Sg"             name="Sg (m2)"    fill={C.p3} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Variation de pression dP par culture (mCE)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} barSize={36}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="culture" tick={axTick} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="delta_P" name="dP (mCE)" radius={[4,4,0,0]}>
                {data.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </>
  );
}

function PostesPanel({ data }) {
  const posteData = data.postes.map(p => ({
    name:      `Poste ${p.poste_id}`,
    superficie: +(p.total_superficie_m2 / 10000).toFixed(2),
    debit:      p.total_debit_m3h,
    variation:  p.variation_debit_pct,
  }));

  const unitData = data.postes.flatMap(p =>
    p.units.map(u => ({
      name:       u.unit_id,
      superficie: +(u.superficie_m2 / 1000).toFixed(1),
      debit:      u.debit_m3h,
      poste:      p.poste_id,
    }))
  );

  return (
    <>
      <KpiRow cols={3}>
        <KpiCard label="Superficie totale" value={+(data.total_superficie_m2 / 10000).toFixed(1)} unit="ha"  color={C.p1} />
        <KpiCard label="Total goutteurs"   value={data.total_goutteurs.toLocaleString("fr-FR")}  color={C.p2} />
        <KpiCard label="Nb. postes"        value={data.postes.length}                            color={C.p3} />
      </KpiRow>
      <ChartGrid>
        <ChartCard title="Debit total par poste (m3/h)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={posteData} barSize={44}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="name" tick={axTick} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="debit" name="Debit (m3/h)" radius={[5,5,0,0]}>
                {posteData.map((_, i) => <Cell key={i} fill={PALETTE[i % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Variation de debit par poste (%)">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={posteData} barSize={44}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="name" tick={axTick} />
              <YAxis tick={axTick} unit="%" />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={20} stroke={C.danger} strokeDasharray="4 2"
                label={{ value: "Seuil 20%", fill: C.danger, fontSize: 10, position: "insideTopRight" }} />
              <Bar dataKey="variation" name="Variation (%)" radius={[4,4,0,0]}>
                {posteData.map((e, i) => <Cell key={i} fill={e.variation > 20 ? C.danger : C.success} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
      <div style={{ marginTop: 16 }}>
        <ChartCard title="Superficie par unite d'irrigation (x1000 m2)">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={unitData} barSize={28}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="name" tick={axTick} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="superficie" name="Superficie (x10³ m2)" radius={[4,4,0,0]}>
                {unitData.map((e, i) => <Cell key={i} fill={PALETTE[(e.poste - 1) % PALETTE.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function RampePanel({ data }) {
  const tr = data.troncons || [];
  return (
    <>
      <KpiRow cols={4}>
        <KpiCard label="Longueur rampe" value={data.Lr}          unit="m"   color={C.p1} />
        <KpiCard label="Nb. troncons"   value={data.nb_troncons}            color={C.p2} />
        <KpiCard label="Pression max"   value={data.Pmax}        unit="mCE" color={C.success} sub="entree rampe" />
        <KpiCard label="Pression min"   value={data.Pmin}        unit="mCE" color={C.danger}  sub="bout de rampe" />
      </KpiRow>
      <ChartGrid>
        <ChartCard title="Profil de pression effective le long de la rampe (mCE)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={tr}>
              <defs>
                <linearGradient id="pg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.p1} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.p1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="Lcum_m" tick={axTick} label={{ value: "L (m)", fill: C.muted, fontSize: 10, position: "insideBottomRight", offset: -4 }} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={0} stroke={C.danger} strokeDasharray="3 2" />
              <Area type="monotone" dataKey="Peff_mce" name="Peff (mCE)" stroke={C.p1} fill="url(#pg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Debit et vitesse par troncon">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={tr}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="Lcum_m" tick={axTick} />
              <YAxis yAxisId="l" tick={axTick} />
              <YAxis yAxisId="r" orientation="right" tick={axTick} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.label }} />
              <Line yAxisId="l" type="monotone" dataKey="Qtr_lh" name="Debit (l/h)"   stroke={C.p2} strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="V_ms"   name="Vitesse (m/s)" stroke={C.p3} strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </>
  );
}

function PorteRampePanel({ data }) {
  const tr = data.troncons || [];
  return (
    <>
      <KpiRow cols={4}>
        <KpiCard label="Longueur"     value={data.Lpr}         unit="m"   color={C.p1} />
        <KpiCard label="Nb. troncons" value={data.nb_troncons}            color={C.p2} />
        <KpiCard label="Pression max" value={data.Pmax}        unit="mCE" color={C.success} />
        <KpiCard label="Pression min" value={data.Pmin}        unit="mCE" color={C.danger} />
      </KpiRow>
      <ChartGrid>
        <ChartCard title="Profil de pression effective le long du porte-rampe (mCE)">
          <ResponsiveContainer width="100%" height={270}>
            <AreaChart data={tr}>
              <defs>
                <linearGradient id="prg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.p4} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={C.p4} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="Lcum_m" tick={axTick} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <ReferenceLine y={0} stroke={C.danger} strokeDasharray="3 2" />
              <Area type="monotone" dataKey="Peff_mce" name="Peff (mCE)" stroke={C.p4} fill="url(#prg)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Debit et vitesse le long du porte-rampe">
          <ResponsiveContainer width="100%" height={270}>
            <LineChart data={tr}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="Lcum_m" tick={axTick} />
              <YAxis yAxisId="l" tick={axTick} />
              <YAxis yAxisId="r" orientation="right" tick={axTick} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.label }} />
              <Line yAxisId="l" type="monotone" dataKey="Qtr_lh" name="Debit (l/h)"   stroke={C.p1} strokeWidth={2} dot={false} />
              <Line yAxisId="r" type="monotone" dataKey="V_ms"   name="Vitesse (m/s)" stroke={C.p3} strokeWidth={2} dot={false} strokeDasharray="5 3" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </>
  );
}

function PompePanel({ bassin, forage }) {
  const compare = [
    { name: "HMT (mCE)",      bassin: bassin?.HMT_mce,       forage: forage?.HMT_mce },
    { name: "Puissance (kW)", bassin: bassin?.puissance_kw,  forage: forage?.puissance_kw },
    { name: "Rendement (%)",  bassin: bassin?.rendement_pct, forage: forage?.rendement_pct },
    { name: "Debit (m3/h)",  bassin: bassin?.Q_m3h,          forage: forage?.Q_m3h },
  ];
  return (
    <>
      <ChartGrid cols={2}>
        {bassin && (
          <ChartCard title="Pompe Bassin — recapitulatif">
            <KpiRow cols={2}>
              <KpiCard label="HMT"       value={bassin.HMT_mce}       unit="mCE" color={C.p1} />
              <KpiCard label="Puissance" value={bassin.puissance_kw}  unit="kW"  color={C.p3} />
              <KpiCard label="Rendement" value={bassin.rendement_pct} unit="%"   color={C.success} />
              <KpiCard label="Debit"     value={bassin.Q_m3h}         unit="m3/h" color={C.p2} />
            </KpiRow>
          </ChartCard>
        )}
        {forage && (
          <ChartCard title="Pompe Forage — recapitulatif">
            <KpiRow cols={2}>
              <KpiCard label="HMT"             value={forage.HMT_mce}       unit="mCE" color={C.p1} />
              <KpiCard label="Puissance"        value={forage.puissance_kw}  unit="kW"  color={C.p3} />
              <KpiCard label="Rendement"        value={forage.rendement_pct} unit="%"   color={C.success} />
              <KpiCard label="Niveau dynamique" value={forage.Nd_m}          unit="m"   color={C.p4} />
            </KpiRow>
          </ChartCard>
        )}
      </ChartGrid>
      <div style={{ marginTop: 16 }}>
        <ChartCard title="Comparatif Pompe Bassin vs Pompe Forage">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={compare} barGap={10} barSize={30}>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="name" tick={axTick} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: C.label }} />
              <Bar dataKey="bassin" name="Pompe Bassin" fill={C.p1} radius={[4,4,0,0]} />
              <Bar dataKey="forage" name="Pompe Forage" fill={C.p3} radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  );
}

function BassinPanel({ data }) {
  const surfaces = [
    { name: "Radier",       value: data.S_radier_m2 },
    { name: "Parois long.", value: data.S_parois_long_m2 },
    { name: "Parois larg.", value: data.S_parois_larg_m2 },
    { name: "Interne",      value: data.S_interne_m2 },
  ];
  const fillCurve = Array.from({ length: Math.ceil(data.autonomie_j) + 1 }, (_, i) => ({
    jour:   i,
    volume: Math.max(0, data.volume_m3 - (data.volume_m3 / data.autonomie_j) * i),
  }));
  return (
    <>
      <KpiRow cols={4}>
        <KpiCard label="Volume total"       value={data.volume_m3}      unit="m3"    color={C.p1} />
        <KpiCard label="Autonomie"          value={data.autonomie_j}    unit="jours" color={C.p2} sub="sans apport" />
        <KpiCard label="Volume par hectare" value={data.vol_par_ha_m3}  unit="m3/ha" color={C.p3} />
        <KpiCard label="Surface interne"    value={data.S_interne_m2}   unit="m2"    color={C.p4} />
      </KpiRow>
      <ChartGrid>
        <ChartCard title="Repartition des surfaces du bassin (m2)">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={surfaces} layout="vertical" barSize={30}>
              <CartesianGrid {...gridLine} />
              <XAxis type="number" tick={axTick} />
              <YAxis dataKey="name" type="category" tick={axTick} width={90} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="value" name="Surface (m2)" radius={[0,4,4,0]}>
                {surfaces.map((_, i) => <Cell key={i} fill={PALETTE[i]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Courbe de vidange du bassin (m3 vs jours)">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={fillCurve}>
              <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor={C.p2} stopOpacity={0.18} />
                  <stop offset="95%" stopColor={C.p2} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridLine} />
              <XAxis dataKey="jour" tick={axTick} label={{ value: "Jours", fill: C.muted, fontSize: 10, position: "insideBottomRight", offset: -4 }} />
              <YAxis tick={axTick} />
              <Tooltip content={<Tip />} />
              <Area type="monotone" dataKey="volume" name="Volume (m3)" stroke={C.p2} fill="url(#bg)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartGrid>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVE / DISCARD CONFIRMATION BAR
// ─────────────────────────────────────────────────────────────────────────────

function ActionBar({ input, results, onSaved, onDiscarded }) {
  const [saving,   setSaving]   = useState(false);
  const [saveMsg,  setSaveMsg]  = useState(null);   // { type, text }
  const [confirm,  setConfirm]  = useState(false);  // discard confirm

  // ── SAVE → POST /api/conceptions/save ─────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveMsg(null);
    try {
      const res  = await fetch(`${API}/conceptions/save`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id:    input.folder_id,
          dossier_name: input.dossier_name,
          input:        input,
          results:      results,
          // conception_id omitted → server creates a new record
        }),
      });
      const data = await res.json();

      if (data.success) {
        setSaveMsg({ type: "success", text: `Conception enregistree. ID : ${data.conception_id}` });
        // Mark localStorage as saved so header badge updates
        const stored = JSON.parse(localStorage.getItem("conception_results") || "{}");
        localStorage.setItem("conception_results", JSON.stringify({
          ...stored,
          saved:         true,
          conception_id: data.conception_id,
        }));
        onSaved(data.conception_id);
      } else {
        setSaveMsg({ type: "error", text: `Erreur serveur : ${data.error}` });
      }
    } catch {
      setSaveMsg({ type: "error", text: "Serveur inaccessible." });
    }
    setSaving(false);
  };

  // ── DISCARD → clear localStorage, no server call needed ───────────────────
  const handleDiscard = () => {
    localStorage.removeItem("conception_results");
    onDiscarded();
  };

  return (
    <div style={{
      position: "sticky", top: 0, zIndex: 100,
      background: "#fffbeb",
      border:     `1px solid #fde68a`,
      borderRadius: 10,
      padding:    "14px 20px",
      marginBottom: 20,
      display:    "flex", alignItems: "center", justifyContent: "space-between",
      boxShadow:  "0 2px 8px rgba(217,119,6,0.12)",
    }}>
      <div>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.warning }}>
          Resultats non enregistres
        </p>
        <p style={{ margin: "2px 0 0", fontSize: 12, color: C.label }}>
          Verifiez les graphiques ci-dessous.
          Cliquez <strong>Enregistrer</strong> pour sauvegarder dans le dossier
          <strong style={{ color: C.text }}> {input.folder_id ? `(${input.dossier_name})` : ""}</strong>,
          ou <strong>Ignorer</strong> pour abandonner ces resultats.
        </p>
        {saveMsg && (
          <p style={{ margin: "6px 0 0", fontSize: 12, color: saveMsg.type === "success" ? C.success : C.danger, fontWeight: 600 }}>
            {saveMsg.text}
          </p>
        )}
      </div>

      <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
        {!confirm ? (
          <>
            <button onClick={() => setConfirm(true)}
              style={{ background: "none", border: `1.5px solid ${C.border}`, borderRadius: 7, padding: "9px 20px", color: C.muted, fontSize: 13, fontWeight: 600, cursor: "pointer", transition: "all 0.15s" }}
              onMouseEnter={e => { e.target.style.borderColor = C.danger; e.target.style.color = C.danger; }}
              onMouseLeave={e => { e.target.style.borderColor = C.border; e.target.style.color = C.muted; }}>
              Ignorer
            </button>
            <button onClick={handleSave} disabled={saving}
              style={{ background: saving ? C.divider : C.success, border: "none", borderRadius: 7, padding: "9px 24px", color: saving ? C.muted : "#fff", fontWeight: 700, fontSize: 13, cursor: saving ? "not-allowed" : "pointer", boxShadow: saving ? "none" : "0 2px 10px rgba(22,163,74,0.28)", transition: "all 0.15s" }}>
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
          </>
        ) : (
          // Discard confirmation
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.danger, fontWeight: 600 }}>
              Confirmer la suppression des resultats ?
            </span>
            <button onClick={() => setConfirm(false)}
              style={{ background: C.surface, border: `1.5px solid ${C.border}`, borderRadius: 6, padding: "7px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: C.label }}>
              Annuler
            </button>
            <button onClick={handleDiscard}
              style={{ background: C.danger, border: "none", borderRadius: 6, padding: "7px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
              Oui, ignorer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVED BADGE (shown in header when already persisted)
// ─────────────────────────────────────────────────────────────────────────────

function SavedBadge({ conceptionId }) {
  return (
    <div style={{ background: C.successLt, border: `1px solid #bbf7d0`, borderRadius: 8, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: C.success, flexShrink: 0 }} />
      <div>
        <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: C.success }}>Enregistree</p>
        <p style={{ margin: "1px 0 0", fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
          ID: {conceptionId?.slice(0, 8)}...
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      <div style={{ textAlign: "center", maxWidth: 400 }}>
        <div style={{ width: 64, height: 64, borderRadius: 16, background: C.accentLt, border: `2px solid ${C.border}`, margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 28, height: 28, borderRadius: 4, background: C.accent, opacity: 0.3 }} />
        </div>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 700, color: C.text }}>Aucun resultat disponible</h2>
        <p style={{ margin: "0 0 24px", fontSize: 13, color: C.muted, lineHeight: 1.6 }}>
          Remplissez le formulaire dans <strong>Saisie de Conception</strong>, puis cliquez sur
          <strong> Lancer le calcul</strong> pour voir les resultats ici.
        </p>
        <a href="/"
          style={{ display: "inline-block", background: C.accent, color: "#fff", borderRadius: 7, padding: "10px 24px", fontSize: 13, fontWeight: 700, textDecoration: "none", boxShadow: "0 2px 10px rgba(37,99,235,0.25)" }}>
          Aller a la saisie
        </a>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export default function ConceptionVision({ conceptionData, folderName, setCurrentPage }) {
  const [tab,     setTab]  = useState("besoins");
  const [data,    setData] = useState(null);

  // Accept data from prop (auto-navigate flow) OR fallback to localStorage
  useEffect(() => {
    if (conceptionData) {
      setData(conceptionData);
      return;
    }
    try {
      const raw = localStorage.getItem("conception_results");
      if (raw) setData(JSON.parse(raw));
    } catch {
      setData(null);
    }
  }, [conceptionData]);

  if (!data || !data.results) return <EmptyState />;

  const r       = data.results;
  const input   = data.input || {};

  // Folder name: from prop > from input > fallback
  const dossier = folderName || input.dossier_name || "Conception";

  const panels = {
    besoins:       r.besoins       ? <BesoinPanel      data={r.besoins} />                              : null,
    distributeurs: r.distributeurs ? <DistributeurPanel data={r.distributeurs} />                      : null,
    postes:        r.postes        ? <PostesPanel       data={r.postes} />                              : null,
    rampe:         r.rampe         ? <RampePanel        data={r.rampe} />                               : null,
    porte_rampe:   r.porte_rampe   ? <PorteRampePanel   data={r.porte_rampe} />                        : null,
    pompes:                          <PompePanel         bassin={r.pompe_bassin} forage={r.pompe_forage} />,
    bassin:        r.bassin        ? <BassinPanel       data={r.bassin} />                              : null,
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: C.text }}>

      {/* ── HEADER ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 32px", height: 62, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 1px 5px rgba(0,0,0,0.05)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>

          {/* Back button */}
          {setCurrentPage && (
            <button onClick={() => setCurrentPage("dashboard")}
              style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 12, color: C.label, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
              ← Dossiers
            </button>
          )}

          <div style={{ width: 4, height: 32, background: `linear-gradient(180deg,${C.accent},#60a5fa)`, borderRadius: 2 }} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: C.muted, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              Resultats Hydrauliques
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{dossier}</div>
          </div>
        </div>

        {/* Saved badge — always saved since we auto-save */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "6px 12px" }}>
          <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.success }} />
          <span style={{ fontSize: 11, color: C.success, fontWeight: 700 }}>Enregistre</span>
          {data.conception_id && (
            <span style={{ fontSize: 10, color: C.muted, fontFamily: "monospace" }}>
              · {data.conception_id.slice(0, 8)}
            </span>
          )}
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex", gap: 0, overflowX: "auto" }}>
        {TABS.map(t => {
          const active  = tab === t.id;
          const hasData = t.id === "pompes" || !!r[t.id];
          return (
            <button key={t.id} onClick={() => hasData && setTab(t.id)}
              style={{
                background: "transparent", border: "none",
                borderBottom: `2.5px solid ${active ? C.accent : "transparent"}`,
                padding: "14px 20px",
                color: !hasData ? C.muted : active ? C.accent : C.label,
                fontSize: 13, fontWeight: active ? 700 : 500,
                cursor: hasData ? "pointer" : "default",
                whiteSpace: "nowrap", fontFamily: "inherit", transition: "all 0.12s",
              }}>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "24px 32px", maxWidth: 1280, margin: "0 auto" }}>
        {panels[tab] || (
          <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "40px", textAlign: "center", color: C.muted, fontSize: 14 }}>
            Aucune donnee disponible pour cette section.
          </div>
        )}
      </div>
    </div>
  );
}