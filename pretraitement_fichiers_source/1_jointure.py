import pandas as pd
import numpy as np
import os

def clean_system_technology(val):
    """Normalise la technologie en 2G, 3G, 4G, 5G."""
    if not isinstance(val, str):
        return "INCONNU"
    val_upper = val.upper()
    if "5G" in val_upper or "NR" in val_upper:
        return "5G"
    elif "LTE" in val_upper or "4G" in val_upper:
        return "4G"
    elif "UMTS" in val_upper or "3G" in val_upper:
        return "3G"
    elif "GSM" in val_upper or "2G" in val_upper:
        return "2G"
    return "AUTRE"

# Table de secours si SUP_ADMINISTRATEUR.txt est absent
EXPLOITANTS_FALLBACK = {
    "1": "ORANGE",
    "2": "SFR",
    "12": "SFR",
    "15": "ORANGE",
    "22": "BOUYGUES TELECOM",
    "30": "FREE MOBILE",
    "427": "FREE MOBILE",
}

def load_administrateurs():
    """Charge la correspondance des identifiants d'opérateurs."""
    possible_filenames = ["SUP_ADMINISTRATEUR.txt", "ADMINISTRATEUR.txt", "ADM.txt"]
    for fname in possible_filenames:
        if os.path.exists(fname):
            print(f"-> Fichier administrateur trouvé : {fname}")
            try:
                df_adm = pd.read_csv(fname, sep=";", dtype=str, encoding="utf-8")
                id_col = [c for c in df_adm.columns if "ID" in c][0]
                name_col = [c for c in df_adm.columns if "NOM" in c or "LB" in c][0]
                return dict(zip(df_adm[id_col].str.strip(), df_adm[name_col].str.strip()))
            except Exception as e:
                print(f"Erreur de lecture de {fname}: {e}")
    
    print("-> Fichier SUP_ADMINISTRATEUR.txt non trouvé : utilisation de la table par défaut.")
    return EXPLOITANTS_FALLBACK

def dms_to_dd(df, dg_col, mn_col, sc_col, card_col):
    """
    Convertit des coordonnées Degrés, Minutes, Secondes (DMS) 
    en Degrés Décimaux (DD) prêts pour Leaflet / OpenStreetMap.
    """
    # Conversion en valeurs numériques (remplacement des virgules éventuelles)
    deg = pd.to_numeric(df[dg_col].astype(str).str.replace(',', '.'), errors='coerce').fillna(0)
    mn = pd.to_numeric(df[mn_col].astype(str).str.replace(',', '.'), errors='coerce').fillna(0)
    sc = pd.to_numeric(df[sc_col].astype(str).str.replace(',', '.'), errors='coerce').fillna(0)
    cardinal = df[card_col].astype(str).str.strip().str.upper()

    # Formule : DD = Degrés + (Minutes / 60) + (Secondes / 3600)
    dd = deg + (mn / 60.0) + (sc / 3600.0)

    # Inversion du signe pour Sud (S) et Ouest (O / W)
    mask_negative = cardinal.isin(['S', 'O', 'W'])
    dd = np.where(mask_negative, -dd, dd)

    # Arrondi propre à 6 décimales (~10 cm de précision)
    return np.round(dd, 6)

def process_anfr_data():
    print("1. Démarrage du traitement de la base ANFR...")
    
    admin_dict = load_administrateurs()

    # 2. Chargement des fichiers
    print("2. Lecture des fichiers sources CSV/TXT...")
    df_antenne = pd.read_csv("SUP_ANTENNE.txt", sep=";", dtype=str, usecols=["STA_NM_ANFR", "AER_ID", "SUP_ID"])
    df_emetteur = pd.read_csv("SUP_EMETTEUR.txt", sep=";", dtype=str, usecols=["STA_NM_ANFR", "AER_ID", "EMR_LB_SYSTEME"])
    df_station = pd.read_csv("SUP_STATION.txt", sep=";", dtype=str, usecols=["STA_NM_ANFR", "ADM_ID"])

    # Chargement de SUP_SUPPORT.txt avec les composantes DMS et adresses
    support_cols = [
        "SUP_ID", "STA_NM_ANFR",
        "COR_NB_DG_LAT", "COR_NB_MN_LAT", "COR_NB_SC_LAT", "COR_CD_NS_LAT",
        "COR_NB_DG_LON", "COR_NB_MN_LON", "COR_NB_SC_LON", "COR_CD_EW_LON",
        "ADR_LB_LIEU", "ADR_LB_ADD1", "ADR_LB_ADD2", "ADR_LB_ADD3", "ADR_NM_CP"
    ]
    
    if os.path.exists("SUP_SUPPORT.txt"):
        print("-> Fichier SUP_SUPPORT.txt trouvé.")
        df_support = pd.read_csv("SUP_SUPPORT.txt", sep=";", dtype=str, usecols=lambda c: c in support_cols)
    else:
        raise FileNotFoundError("Erreur critique : Fichier SUP_SUPPORT.txt introuvable !")

    print("3. Conversion des coordonnées DMS -> Degrés Décimaux...")
    # Calcul de LAT et LON
    df_support["LAT"] = dms_to_dd(df_support, "COR_NB_DG_LAT", "COR_NB_MN_LAT", "COR_NB_SC_LAT", "COR_CD_NS_LAT")
    df_support["LON"] = dms_to_dd(df_support, "COR_NB_DG_LON", "COR_NB_MN_LON", "COR_NB_SC_LON", "COR_CD_EW_LON")

    # Concaténation propre de l'adresse
    adr_parts = ["ADR_LB_LIEU", "ADR_LB_ADD1", "ADR_LB_ADD2", "ADR_LB_ADD3", "ADR_NM_CP"]
    present_adr_cols = [c for c in adr_parts if c in df_support.columns]
    
    df_support["ADR"] = (
        df_support[present_adr_cols]
        .fillna("")
        .agg(" ".join, axis=1)
        .str.replace(r"\s+", " ", regex=True)
        .str.strip()
    )

    print("4. Réalisation des jointures des tables...")
    # Jointure 1: Antenne + Émetteur sur (STA_NM_ANFR, AER_ID)
    df_merged = pd.merge(df_antenne, df_emetteur, on=["STA_NM_ANFR", "AER_ID"], how="inner")
    
    # Jointure 2: Station (pour récupérer ADM_ID)
    df_merged = pd.merge(df_merged, df_station, on="STA_NM_ANFR", how="left")

    # Jointure 3: Support (pour la géolocalisation et l'adresse via SUP_ID)
    df_merged = pd.merge(
        df_merged, 
        df_support[["SUP_ID", "LAT", "LON", "ADR"]], 
        on="SUP_ID", 
        how="left"
    )

    print("5. Mise en forme finale...")
    df_merged["ID"] = df_merged["AER_ID"]
    df_merged["SYST"] = df_merged["EMR_LB_SYSTEME"].apply(clean_system_technology)
    df_merged["OPR"] = df_merged["ADM_ID"].str.strip().map(admin_dict).fillna("INCONNU (" + df_merged["ADM_ID"].astype(str) + ")")

    # Sélection des colonnes demandées
    output_cols = ["ID", "LAT", "LON", "ADR", "OPR", "SYST"]
    df_final = df_merged[output_cols].drop_duplicates()

    # Exclusion des lignes sans coordonnées valides
    df_final = df_final[df_final["LAT"] != 0]

    output_filename = "stations.csv"
    df_final.to_csv(output_filename, sep=";", index=False, encoding="utf-8")
    print(f"\n Succès ! Le fichier '{output_filename}' a été généré ({len(df_final)} antennes).")

if __name__ == "__main__":
    process_anfr_data()