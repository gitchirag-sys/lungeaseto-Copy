import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
import pickle

df = pd.read_csv("data/cleaned_lungease_dataset.csv")

df.dropna(inplace=True)

# Encode Sex: Female = 0, Male = 1 (as used in model training)
df["Sex"] = df["Sex"].map({"Female": 0, "Male": 1})
if df["Sex"].isnull().any():
    raise ValueError("Sex column contains unmapped values.")

features = [
    "Baseline_FEV1_L", "Baseline_FVC_L", "Baseline_FEV1_FVC_Ratio",
    "Baseline_PEF_Ls", "Baseline_FEF2575_Ls",
    "Age", "Height", "Weight", "Sex"
]

X = df[features].astype(np.float32)
scaler = StandardScaler()
scaler.fit(X)

with open("scaler.pkl", "wb") as f:
    pickle.dump(scaler, f)

print(" Scaler saved successfully.")
