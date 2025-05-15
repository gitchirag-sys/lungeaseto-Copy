import os
import pandas as pd
import numpy as np
import pickle
import json
import tensorflow as tf
from sklearn.model_selection import StratifiedShuffleSplit
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau
from sklearn.metrics import confusion_matrix, classification_report
import seaborn as sns
import matplotlib.pyplot as plt

#Paths
BASE_DIR = os.path.dirname(__file__)  # /LUNGEASE2/model_training
ROOT_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))  # /LUNGEASE2
BACKEND_DIR = os.path.join(ROOT_DIR, "backend")
DATA_PATH = os.path.join(ROOT_DIR, "data", "cleaned_lungease_dataset.csv")

#  Load dataset
df = pd.read_csv(DATA_PATH)
print(" CSV Columns:", df.columns.tolist())

df.dropna(inplace=True)

# Encode 'Sex'
if 'Sex' in df.columns:
    df['Sex'] = df['Sex'].map({'Female': 0, 'Male': 1})
    if df['Sex'].isnull().any():
        raise ValueError(" Some values in 'Sex' column are not 'Male' or 'Female'.")
else:
    raise ValueError(" 'Sex' column is missing!")

#  Define columns
feature_columns = [
    'Baseline_FEV1_L', 'Baseline_FVC_L', 'Baseline_FEV1_FVC_Ratio',
    'Baseline_PEF_Ls', 'Baseline_FEF2575_Ls', 'Age', 'Height', 'Weight', 'Sex'
]
label_columns = [
    'Normal_5th_Segmented',
    'Obstruction_5th_Segmented',
    'Restrictive_Spirometry_Pattern_5th_Segmented'
]

#  Convert labels to binary
for col in label_columns:
    df[col] = df[col].apply(lambda x: 1 if str(x).strip().lower() in ['1', 'true', 'yes', col.lower(), 'normal', 'obstruction', 'restrictive'] else 0)

#  Keep only one-hot rows
df = df[df[label_columns].sum(axis=1) == 1]

#  Feature and label prep
X = df[feature_columns].astype(np.float32)
y = df[label_columns].astype(np.float32)

#  Scaling
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

#  Save scaler
with open(os.path.join(BACKEND_DIR, "scaler.pkl"), "wb") as f:
    pickle.dump(scaler, f)
print(" Scaler saved to backend/")

#  Train/test split
y_class = np.argmax(y.values, axis=1)
sss = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
for train_idx, test_idx in sss.split(X_scaled, y_class):
    X_train, X_test = X_scaled[train_idx], X_scaled[test_idx]
    y_train, y_test = y.values[train_idx], y.values[test_idx]

#  Class weights
y_train_classes = np.argmax(y_train, axis=1)
class_weights = compute_class_weight(class_weight='balanced', classes=np.unique(y_train_classes), y=y_train_classes)
class_weight_dict = dict(enumerate(class_weights))

# Build model
model = Sequential([
    Dense(64, activation='relu', input_shape=(X_train.shape[1],)),
    Dropout(0.3),
    Dense(64, activation='relu'),
    Dropout(0.3),
    Dense(len(label_columns), activation='softmax')
])
model.compile(optimizer=tf.keras.optimizers.Adam(0.001), loss='categorical_crossentropy', metrics=['accuracy'])

#  Callbacks
early_stop = EarlyStopping(monitor='val_loss', patience=5, restore_best_weights=True)
lr_scheduler = ReduceLROnPlateau(monitor='val_loss', factor=0.5, patience=3, verbose=1)

# Train model
model.fit(
    X_train, y_train,
    epochs=50,
    batch_size=32,
    validation_split=0.1,
    class_weight=class_weight_dict,
    callbacks=[early_stop, lr_scheduler]
)

# Save model (optional)
model.save(os.path.join(BACKEND_DIR, "lung_model.h5"))

#  Convert to TFLite and save
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()
with open(os.path.join(BACKEND_DIR, "lung_model.tflite"), "wb") as f:
    f.write(tflite_model)
print(" TFLite model saved to backend/")

#  Save label mapping
label_mapping = {
    0: 'Normal_5th_Segmented',
    1: 'Obstruction_5th_Segmented',
    2: 'Restrictive_Spirometry_Pattern_5th_Segmented'
}
with open(os.path.join(BACKEND_DIR, "label_mapping.json"), "w") as f:
    json.dump(label_mapping, f)
print(" Label mapping saved to backend/")

#  Evaluate
y_pred_probs = model.predict(X_test)
y_pred_classes = np.argmax(y_pred_probs, axis=1)
y_true_classes = np.argmax(y_test, axis=1)

print("\n Classification Report:\n")
print(classification_report(y_true_classes, y_pred_classes, target_names=['Normal', 'Obstruction', 'Restrictive']))

#  Confusion Matrix
cm = confusion_matrix(y_true_classes, y_pred_classes)
plt.figure(figsize=(8, 6))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Normal', 'Obstruction', 'Restrictive'],
            yticklabels=['Normal', 'Obstruction', 'Restrictive'])
plt.title('Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.tight_layout()
plt.show()
