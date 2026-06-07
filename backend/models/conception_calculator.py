"""
ConceptionCalculator.py
=======================
Business Logic Layer — pure hydraulic calculations.

Golden Rule
-----------
This file does NOT:
  - Start a server
  - Save or load any file
  - Handle HTTP requests

It ONLY:
  - Receives a structured dict (from server.py)
  - Performs all irrigation hydraulic calculations
  - Returns a structured results dict

Sections calculated
-------------------
1. Besoins en eau        (crop water requirements)
2. Distributeurs         (emitter design)
3. Postes d'irrigation   (station flow and uniformity)
4. Rampes                (drip lateral — segment analysis)
5. Porte-rampes          (sub-main pipe — segment analysis)
6. Conduites             (main pipe velocity)
7. Pompe bassin          (surface pump HMT and power)
8. Pompe forage          (borehole pump HMT and power)
9. Bassin de stockage    (basin volume and autonomy)
"""

import math

# ─────────────────────────────────────────────────────────────────────────────
# PHYSICAL CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

G      = 9.81      # gravitational acceleration [m/s²]
RHO    = 1000.0    # water density              [kg/m³]
NU     = 1e-6      # kinematic viscosity        [m²/s]


# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL HELPERS
# ─────────────────────────────────────────────────────────────────────────────

def _pipe_area(diameter_mm: float) -> float:
    """Cross-sectional area of a circular pipe [m²]."""
    d = diameter_mm / 1000.0
    return math.pi * d ** 2 / 4.0


def _friction_factor(Re: float) -> float:
    """
    Darcy-Weisbach friction factor.
    Laminar   Re < 2300 : f = 64 / Re
    Turbulent Re ≥ 2300 : f = 0.316 / Re^0.25  (Blasius)
    """
    if Re <= 0:
        return 0.0
    return 64.0 / Re if Re < 2300 else 0.316 / Re ** 0.25


def _head_loss(f: float, length: float, diameter_mm: float, velocity: float) -> float:
    """
    Darcy-Weisbach head loss for one pipe segment [mCE].
    Yls = f × L / D × V² / (2g)
    """
    D = diameter_mm / 1000.0
    if D <= 0:
        return 0.0
    return f * (length / D) * (velocity ** 2) / (2.0 * G)


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 1 — BESOINS EN EAU
# ─────────────────────────────────────────────────────────────────────────────

def calc_besoins(cultures: list) -> list:
    """
    Compute gross and net daily water requirements for each crop.

    Formula
    -------
    B_brute = ET0 × Kc / Kr     [mm/day]
    B_net   = B_brute × Kr      [mm/day]

    Parameters
    ----------
    cultures : list of dicts
        Each dict: { name, ET0, Kc, Kr }

    Returns
    -------
    list of dicts with B_brute_mm and B_net_mm added.
    """
    results = []
    for c in cultures:
        ET0 = float(c["ET0"])
        Kc  = float(c["Kc"])
        Kr  = float(c["Kr"])

        B_brute = (ET0 * Kc / Kr) if Kr > 0 else 0.0
        B_net   = B_brute * Kr

        results.append({
            "culture":    c["name"],
            "ET0":        ET0,
            "Kc":         Kc,
            "Kr":         Kr,
            "B_brute_mm": round(B_brute, 3),
            "B_net_mm":   round(B_net,   3),
        })
    return results


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 2 — DISTRIBUTEURS ET ECARTEMENTS
# ─────────────────────────────────────────────────────────────────────────────

def calc_distributeurs(emitters: list) -> list:
    """
    Emitter design parameters for each crop line.

    Computed values
    ---------------
    Sg      = ecart_rampe × ecart_goutteur    [m² — wetted area per emitter]
    x       = q / √Pn                         [emitter exponent proxy]
    delta_P = 0.167 × Pn  (20% rule)         [mCE — allowable pressure spread]
    Pf      = Pn × 0.1 + q × 0.05            [mCE — friction loss estimate]

    Parameters
    ----------
    emitters : list of dicts
        Each dict: { culture, debit_goutteur, ecart_rampe,
                     ecart_goutteur, nb_rampes, Pn }

    Returns
    -------
    list of dicts with all computed design parameters.
    """
    results = []
    for e in emitters:
        q   = float(e["debit_goutteur"])
        er  = float(e["ecart_rampe"])
        eg  = float(e["ecart_goutteur"])
        Pn  = float(e["Pn"])

        Sg      = er * eg
        x       = q / math.sqrt(Pn) if Pn > 0 else 0.0
        delta_P = Pn * 0.1667 if q < 4 else Pn * 0.156
        Pf      = Pn * 0.1 + q * 0.05

        results.append({
            "culture":        e["culture"],
            "debit_goutteur": q,
            "ecart_rampe":    er,
            "ecart_goutteur": eg,
            "nb_rampes":      int(e["nb_rampes"]),
            "Pn":             Pn,
            "Sg":             round(Sg,      3),
            "Pf":             round(Pf,      2),
            "x":              round(x,       4),
            "delta_P":        round(delta_P, 2),
        })
    return results


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 3 — POSTES D'IRRIGATION
# ─────────────────────────────────────────────────────────────────────────────

def calc_postes(postes: list, emitter_params: dict) -> dict:
    """
    Flow, emitter count and uniformity for each irrigation station.

    For each sub-unit
    -----------------
    nb_goutteurs = superficie / (ecart_goutteur × ecart_rampe)
    debit_m3h    = nb_goutteurs × debit_goutteur / 1000

    Uniformity check
    ----------------
    variation_pct = (Qmax − Qmin) / Qmax × 100
    Values > 20% signal a uniformity problem (highlighted in frontend).

    Parameters
    ----------
    postes : list of dicts
        Each dict: { poste_id, duree_h, units: [{unit_id, culture, superficie}] }
    emitter_params : dict
        { debit_goutteur [l/h], ecart_goutteur [m], ecart_rampe [m] }

    Returns
    -------
    dict with postes list and global totals.
    """
    q_g = float(emitter_params["debit_goutteur"])   # l/h
    e_g = float(emitter_params["ecart_goutteur"])   # m
    e_r = float(emitter_params["ecart_rampe"])       # m
    cell = e_g * e_r                                 # m²

    all_postes      = []
    total_sup       = 0.0
    total_goutteurs = 0

    for p in postes:
        units_out   = []
        poste_sup   = 0.0
        poste_gout  = 0
        poste_debit = 0.0

        for u in p["units"]:
            sup   = float(u["superficie"])
            nb_g  = int(sup / cell) if cell > 0 else 0
            q_m3h = nb_g * q_g / 1000.0

            units_out.append({
                "unit_id":       u["unit_id"],
                "culture":       u["culture"],
                "superficie_m2": sup,
                "nb_goutteurs":  nb_g,
                "debit_m3h":     round(q_m3h, 2),
            })
            poste_sup   += sup
            poste_gout  += nb_g
            poste_debit += q_m3h

        debits    = [u["debit_m3h"] for u in units_out]
        variation = (
            (max(debits) - min(debits)) / max(debits) * 100
            if debits and max(debits) > 0 else 0.0
        )

        all_postes.append({
            "poste_id":            int(p["poste_id"]),
            "duree_h":             float(p["duree_h"]),
            "units":               units_out,
            "total_superficie_m2": round(poste_sup,   2),
            "total_goutteurs":     poste_gout,
            "total_debit_m3h":     round(poste_debit, 2),
            "variation_debit_pct": round(variation,   2),
        })
        total_sup       += poste_sup
        total_goutteurs += poste_gout

    return {
        "postes":              all_postes,
        "total_superficie_m2": round(total_sup, 2),
        "total_goutteurs":     total_goutteurs,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 4 — RAMPES
# ─────────────────────────────────────────────────────────────────────────────

def calc_rampe(rampe: dict) -> dict:
    """
    Segment-by-segment hydraulic analysis of a drip lateral.

    For each segment i (1 → nb_troncons)
    --------------------------------------
    Q_i   = Qr − (i−1) × qg            [l/h → m³/s via ÷ 3 600 000]
    V_i   = Q_i / A                     [m/s]
    Re_i  = V_i × D / ν
    f_i   = friction factor (Blasius)
    Yls_i = f × Eg / D × V² / (2g)    [mCE head loss]
    DZ_i  = pente/100 × Eg             [m elevation change]
    Peff  = Pentree − ΣYls + ΣDZ

    Parameters
    ----------
    rampe : dict
        { Lr, Eg, qg, Dr, pente, Pentree, Qr }
        Flows in [l/h], lengths in [m], diameter in [mm], pente in [%].

    Returns
    -------
    dict with troncons table, Pmax, Pmin, Lpx, Lpn.
    """
    Lr      = float(rampe["Lr"])
    Eg      = float(rampe["Eg"])
    qg      = float(rampe["qg"])       # l/h per emitter
    Dr      = float(rampe["Dr"])       # mm
    pente   = float(rampe["pente"])    # %
    Pentree = float(rampe["Pentree"])  # mCE
    Qr      = float(rampe["Qr"])       # l/h total inlet flow

    A           = _pipe_area(Dr)
    nb_troncons = max(1, int(Lr / Eg))
    D           = Dr / 1000.0

    troncons = []
    Yls_cum  = 0.0

    for i in range(1, nb_troncons + 1):
        # Flow decreases segment by segment (emitters discharge along the way)
        # l/h → m³/s : divide by 3 600 000
        Q_m3s = max(0.0, (Qr - (i - 1) * qg) / 3_600_000.0)
        V     = Q_m3s / A if A > 0 else 0.0
        Re    = V * D / NU if V > 0 else 0.0
        f     = _friction_factor(Re)
        Yls   = _head_loss(f, Eg, Dr, V)
        DZ    = (pente / 100.0) * Eg

        Yls_cum += Yls
        P_eff    = Pentree - Yls_cum + DZ * i

        troncons.append({
            "n":        i,
            "Lcum_m":   round(i * Eg,            2),
            "Qtr_lh":   round(Q_m3s * 3_600_000, 2),   # back to l/h for display
            "DZ_m":     round(DZ,    3),
            "Yls_mce":  round(Yls,   4),
            "Peff_mce": round(P_eff, 4),
            "V_ms":     round(V,     3),
        })

    return {
        "Lr":          Lr,
        "Eg":          Eg,
        "qg":          qg,
        "Dr":          Dr,
        "pente":       pente,
        "nb_troncons": nb_troncons,
        "Pmax":        round(max(t["Peff_mce"] for t in troncons), 4),
        "Pmin":        round(min(t["Peff_mce"] for t in troncons), 4),
        "Lpx":         troncons[0]["Lcum_m"],
        "Lpn":         troncons[-1]["Lcum_m"],
        "troncons":    troncons,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 5 — PORTE-RAMPES
# ─────────────────────────────────────────────────────────────────────────────

def calc_porte_rampe(porte_rampe: dict) -> dict:
    """
    Segment-by-segment hydraulic analysis of a sub-main pipe.

    Flow is linearly distributed from Qdepart (near end) to Qpr (inlet).
    Same Darcy-Weisbach approach as calc_rampe.

    Parameters
    ----------
    porte_rampe : dict
        { Lpr, Edepart, Qpr, pente, Pentree, Qdepart, diameter_mm }
        Flows in [l/h], lengths in [m], diameter in [mm], pente in [%].

    Returns
    -------
    dict with troncons table, Pmax, Pmin.
    """
    Lpr        = float(porte_rampe["Lpr"])
    Edepart    = float(porte_rampe["Edepart"])
    Qpr        = float(porte_rampe["Qpr"])        # l/h — total inlet
    pente      = float(porte_rampe["pente"])       # %
    Pentree    = float(porte_rampe["Pentree"])     # mCE
    Qdepart    = float(porte_rampe["Qdepart"])     # l/h — first segment
    D_mm       = float(porte_rampe["diameter_mm"]) # mm

    A  = _pipe_area(D_mm)
    nb = max(1, int(Lpr / Edepart))

    troncons = []
    P_eff    = Pentree

    for i in range(1, nb + 1):
        # Interpolate flow: segment 1 = Qdepart, last segment = Qpr
        frac  = (i - 1) / max(nb - 1, 1)
        Q_lh  = Qdepart + (Qpr - Qdepart) * frac
        Q_m3s = Q_lh / 3_600_000.0         # l/h → m³/s

        V   = Q_m3s / A if A > 0 else 0.0
        Re  = V * (D_mm / 1000.0) / NU if V > 0 else 0.0
        f   = _friction_factor(Re)
        Yls = _head_loss(f, Edepart, D_mm, V)
        DZ  = (pente / 100.0) * Edepart

        P_eff = P_eff - Yls + DZ

        troncons.append({
            "n":        i,
            "Lcum_m":   round(i * Edepart,       2),
            "Qtr_lh":   round(Q_lh,              2),
            "D_mm":     D_mm,
            "DZ_m":     round(DZ,    3),
            "Yls_mce":  round(Yls,   4),
            "Peff_mce": round(P_eff, 4),
            "V_ms":     round(V,     3),
        })

    return {
        "Lpr":         Lpr,
        "diameter_mm": D_mm,
        "nb_troncons": nb,
        "Pmax":        round(max(t["Peff_mce"] for t in troncons), 3),
        "Pmin":        round(min(t["Peff_mce"] for t in troncons), 3),
        "troncons":    troncons,
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 6 — CONDUITES PRINCIPALES
# ─────────────────────────────────────────────────────────────────────────────

def calc_conduites(conduites: list) -> list:
    """
    Flow velocity for each main pipe or antenna segment.

    Formula: V = Q / A   where A = π D² / 4,  Q in [m³/s]

    Parameters
    ----------
    conduites : list of dicts
        Each dict: { troncon, debit [m³/h], diam_ext [mm],
                     diam_int [mm], longueur [m] (optional) }

    Returns
    -------
    list of dicts with vitesse_ms added.
    """
    results = []
    for c in conduites:
        D_mm = float(c["diam_int"])
        A    = _pipe_area(D_mm)
        Q    = float(c["debit"]) / 3600.0    # m³/h → m³/s
        V    = Q / A if A > 0 else 0.0

        results.append({
            "troncon":     c["troncon"],
            "debit_m3h":   float(c["debit"]),
            "diam_ext_mm": float(c["diam_ext"]),
            "diam_int_mm": D_mm,
            "longueur_m":  float(c["longueur"]) if c.get("longueur") else None,
            "vitesse_ms":  round(V, 3),
        })
    return results


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7a — POMPE SUR BASSIN
# ─────────────────────────────────────────────────────────────────────────────

def calc_pompe_bassin(pompe: dict) -> dict:
    """
    HMT and shaft power for a surface pump drawing from a storage basin.

    Formulas
    --------
    HMT  = Pa + PDCmax + Ha                    [mCE]
    P_kW = ρ × g × Q × HMT / (η × 1000)      [kW]

    Default efficiency η = 75% (surface pump typical value).

    Parameters
    ----------
    pompe : dict
        { Q [m³/h], Pa [mCE], PDCmax [mCE], Ha [m], NPSH [m] }

    Returns
    -------
    dict with HMT_mce, rendement_pct, puissance_kw.
    """
    Q      = float(pompe["Q"])
    Pa     = float(pompe["Pa"])
    PDCmax = float(pompe["PDCmax"])
    Ha     = float(pompe["Ha"])
    NPSH   = float(pompe["NPSH"])

    HMT   = Pa + PDCmax + Ha
    eta   = 0.75                          # default 75%
    P_kw  = (RHO * G * (Q / 3600.0) * HMT) / (eta * 1000.0)

    return {
        "Q_m3h":         Q,
        "Pa_mce":        Pa,
        "PDCmax_mce":    PDCmax,
        "Ha_m":          Ha,
        "NPSH_m":        NPSH,
        "HMT_mce":       round(HMT,  2),
        "rendement_pct": round(eta * 100, 1),
        "puissance_kw":  round(P_kw, 2),
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 7b — POMPE SUR FORAGE
# ─────────────────────────────────────────────────────────────────────────────

def calc_pompe_forage(pompe: dict) -> dict:
    """
    HMT and shaft power for a submersible borehole pump.

    Formula
    -------
    HMT  = Nd + ΔPc + ΔPfb + ΔZ            [mCE]
    P_kW = ρ × g × Q × HMT / (η × 1000)   [kW]

    Parameters
    ----------
    pompe : dict
        { Q [m³/h], Lfb [m], diam_int [mm], delta_z [m],
          delta_pfb [mCE], Nd [m], delta_pc [mCE], rendement [%] }

    Returns
    -------
    dict with HMT_mce and puissance_kw.
    """
    Q         = float(pompe["Q"])
    Lfb       = float(pompe["Lfb"])
    diam_int  = float(pompe["diam_int"])
    delta_z   = float(pompe["delta_z"])
    delta_pfb = float(pompe["delta_pfb"])
    Nd        = float(pompe["Nd"])
    delta_pc  = float(pompe["delta_pc"])
    eta       = float(pompe["rendement"]) / 100.0

    HMT  = Nd + delta_pc + delta_pfb + delta_z
    P_kw = (RHO * G * (Q / 3600.0) * HMT) / (eta * 1000.0) if eta > 0 else 0.0

    return {
        "Q_m3h":          Q,
        "Lfb_m":          Lfb,
        "diam_int_mm":    diam_int,
        "delta_z_m":      delta_z,
        "delta_pfb_mce":  delta_pfb,
        "Nd_m":           Nd,
        "delta_pc_mce":   delta_pc,
        "HMT_mce":        round(HMT,  2),
        "rendement_pct":  round(eta * 100, 1),
        "puissance_kw":   round(P_kw, 2),
    }


# ─────────────────────────────────────────────────────────────────────────────
# SECTION 8 — BASSIN DE STOCKAGE
# ─────────────────────────────────────────────────────────────────────────────

def calc_bassin(bassin: dict) -> dict:
    """
    Volume and liner surface areas for a trapezoidal storage basin.

    Volume (prismatoid / frustum formula)
    --------------------------------------
    V = h/3 × (S_radier + S_gueule + √(S_radier × S_gueule))

    Surface areas
    -------------
    S_parois_long = 2 × longueur_gueule × h
    S_parois_larg = 2 × largeur_gueule  × h
    S_perimetre   = (perimeter × 1.5) + corner correction
    S_etancheite  = S_radier × 0.10   (10% extra for waterproofing overlap)
    S_totale      = sum of all surfaces
    S_interne     = S_totale − S_perimetre − S_etancheite

    Autonomy
    --------
    autonomie_j  = volume / besoins_m3j
    vol_par_ha   = volume / superficie_nette_ha

    Parameters
    ----------
    bassin : dict
        { hauteur, longueur_gueule, largeur_gueule, longueur_radier,
          largeur_radier, superficie_nette_ha, besoins_m3j }

    Returns
    -------
    dict with volume, surface breakdown and autonomy.
    """
    h    = float(bassin["hauteur"])
    lg   = float(bassin["longueur_gueule"])
    lrg  = float(bassin["largeur_gueule"])
    lr   = float(bassin["longueur_radier"])
    lrr  = float(bassin["largeur_radier"])
    sup  = float(bassin["superficie_nette_ha"])
    dem  = float(bassin["besoins_m3j"])

    S_rad = lr  * lrr
    S_gue = lg  * lrg
    vol   = (h / 3.0) * (S_rad + S_gue + math.sqrt(S_rad * S_gue))

    S_pl  = 2.0 * lg  * h
    S_pw  = 2.0 * lrg * h
    perim = 2.0 * (lg + lrg)
    S_pe  = perim * 1.5 + 4 * 1.5 * 1.5
    S_et  = S_rad * 0.10
    S_tot = S_rad + S_pl + S_pw + S_pe + S_et
    S_int = S_tot - S_pe - S_et

    return {
        "volume_m3":        round(vol,   2),
        "S_radier_m2":      round(S_rad, 2),
        "S_parois_long_m2": round(S_pl,  2),
        "S_parois_larg_m2": round(S_pw,  2),
        "S_perimetre_m2":   round(S_pe,  2),
        "S_totale_m2":      round(S_tot, 2),
        "S_interne_m2":     round(S_int, 2),
        "autonomie_j":      round(vol / dem if dem > 0 else 0, 1),
        "vol_par_ha_m3":    round(vol / sup if sup > 0 else 0, 1),
    }


# ─────────────────────────────────────────────────────────────────────────────
# MAIN PIPELINE — called by server.py
# ─────────────────────────────────────────────────────────────────────────────

def run_calculations(payload: dict) -> dict:
    """
    Orchestrate the full hydraulic design pipeline.

    Called by server.py after receiving a POST /api/calculate request.
    Results are returned to server.py — this function never saves anything.

    Parameters
    ----------
    payload : dict
        Raw JSON body from the frontend form. Expected keys (all optional
        except folder_id): cultures, emitters, emitter_params, postes,
        rampe, porte_rampe, conduites, pompe_bassin, pompe_forage, bassin.

    Returns
    -------
    dict — one key per calculated section.
    """
    results = {}

    if "cultures" in payload:
        results["besoins"] = calc_besoins(payload["cultures"])

    if "emitters" in payload:
        results["distributeurs"] = calc_distributeurs(payload["emitters"])

    if "postes" in payload and "emitter_params" in payload:
        results["postes"] = calc_postes(payload["postes"], payload["emitter_params"])

    if "rampe" in payload:
        results["rampe"] = calc_rampe(payload["rampe"])

    if "porte_rampe" in payload:
        results["porte_rampe"] = calc_porte_rampe(payload["porte_rampe"])

    if "conduites" in payload:
        results["conduites"] = calc_conduites(payload["conduites"])

    if "pompe_bassin" in payload:
        results["pompe_bassin"] = calc_pompe_bassin(payload["pompe_bassin"])

    if "pompe_forage" in payload:
        results["pompe_forage"] = calc_pompe_forage(payload["pompe_forage"])

    if "bassin" in payload:
        results["bassin"] = calc_bassin(payload["bassin"])

    return results