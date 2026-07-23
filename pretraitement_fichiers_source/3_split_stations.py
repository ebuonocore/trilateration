import sys
print("=== SCRIPT DÉMARRÉ ===")
sys.stdout.flush()

import pandas as pd
print("1/3. Chargement du fichier CSV...")
input_file = 'stations.csv'
usecols = ['ID', 'LAT', 'LON', 'ADR', 'OPR', 'SYST']


df = pd.read_csv(
    input_file, 
    sep=';', 
    dtype=str, 
    usecols=usecols, 
    keep_default_na=False
)
df.columns = df.columns.str.strip()

print(f"Lignes chargées : {len(df)}")

print("3/3. Découpage et exportation en 3 fichiers...")
total_lines = len(df)
chunk_size = (total_lines // 3) + 1

# Découpage natif Pandas sans NumPy
dfs = [df.iloc[i:i + chunk_size] for i in range(0, total_lines, chunk_size)]

for i, sub_df in enumerate(dfs, start=1):
    output_filename = f'stations_{i}.csv'
    sub_df.to_csv(output_filename, sep=';', index=False)
    print(f" -> {output_filename} créé ({len(sub_df)} lignes)")

print("\nOpération terminée avec succès !")