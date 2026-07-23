import pandas as pd

# 1. Nom de vos fichiers
input_file = 'stations.csv'
output_file = 'stations_compressed.csv'

print("Chargement du fichier CSV...")

# 2. Lecture du fichier CSV
# sep=';' correspond au séparateur utilisé dans votre exemple
df = pd.read_csv(
    input_file, 
    sep=';', 
    dtype=str,              # Conserve tout en chaîne de caractères pour éviter les déformations
    keep_default_na=False   # Conserve les champs vides sous forme de texte vide
)

# On nettoie les espaces inutiles autour des noms de colonnes
df.columns = df.columns.str.strip()

# Identifiez le nom exact de la colonne des technologies (ex: 'SYST')
# Et des autres colonnes à conserver
tech_column = 'SYST'
group_columns = [col for col in df.columns if col != tech_column]

print("Regroupement et fusion des technologies...")

# 3. Regroupement par toutes les colonnes sauf 'SYST'
# Et concaténation des technologies uniques séparées par un espace
df_compressed = (
    df.groupby(group_columns, as_index=False)[tech_column]
      .apply(lambda series: ' '.join(sorted(set(filter(None, series)))))
)

# 4. Sauvegarde du nouveau CSV
df_compressed.to_csv(output_file, sep=';', index=False)

print(f"Terminé ! Fichier compressé sauvegardé sous : {output_file}")
print(f"Nombre de lignes initiales : {len(df)}")
print(f"Nombre de lignes final     : {len(df_compressed)}")