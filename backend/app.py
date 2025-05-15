from flask import Flask, request, jsonify, g
from flask_cors import CORS
import numpy as np
import pickle
import os
from pymongo import MongoClient
from dotenv import load_dotenv
import tensorflow as tf
import json
import firebase_admin
from firebase_admin import credentials, auth
from functools import wraps
from datetime import datetime  # Add at top if not already imported

#  Load environment variables
load_dotenv()

#  Paths
BASE_DIR = os.path.dirname(__file__)
SCALER_PATH = os.path.join(BASE_DIR, "scaler.pkl")
MODEL_PATH = os.path.join(BASE_DIR, "lung_model.tflite")
LABELS_PATH = os.path.join(BASE_DIR, "label_mapping.json")
FIREBASE_CRED_PATH = os.path.join(BASE_DIR, "firebase-adminsdk.json")

#  Firebase Admin SDK
cred = credentials.Certificate(FIREBASE_CRED_PATH)
firebase_admin.initialize_app(cred)

#  Load scaler
with open(SCALER_PATH, "rb") as f:
    scaler = pickle.load(f)

#  Load TFLite model
interpreter = tf.lite.Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

#  Load label mapping
with open(LABELS_PATH, "r") as f:
    label_mapping = json.load(f)
    label_mapping = {int(k): v.split("_")[0] for k, v in label_mapping.items()}

#  MongoDB setup
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]
collection = db[os.getenv("COLLECTION_NAME")]

#  Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})  # FIXED CORS

#  Authentication middleware
def authenticate(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        id_token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                id_token = auth_header.split('Bearer ')[1]
        if not id_token:
            return jsonify({'error': 'Authorization token missing'}), 401
        try:
            decoded_token = auth.verify_id_token(id_token)
            g.user = decoded_token
        except Exception as e:
            return jsonify({'error': f'Invalid token: {str(e)}'}), 401
        return f(*args, **kwargs)
    return decorated_function

@app.route('/')
def home():
    return " Flask backend is running!"

#  Predict route


@app.route('/api/predict', methods=['POST'])
@authenticate
def predict():
    try:
        data = request.get_json()
        features = data.get("features")
        user_id = data.get("user_id", "anonymous")
        comment = data.get("comment", "")

        if not features or len(features) != 9:
            return jsonify({"error": "Exactly 9 input features required."}), 400

        try:
            features_np = np.array(features, dtype=np.float32).reshape(1, -1)
        except Exception as e:
            return jsonify({"error": "Invalid input format."}), 400

        scaled_input = scaler.transform(features_np)

        if np.isnan(scaled_input).any() or np.isinf(scaled_input).any():
            return jsonify({"error": "Input contains NaN or Inf after scaling."}), 400

        expected_shape = input_details[0]['shape']
        expected_dtype = input_details[0]['dtype']

        print(" Input before interpreter:", scaled_input.shape)
        print(" Expected by model:", expected_shape, "dtype:", expected_dtype)

        scaled_input = scaled_input.reshape(expected_shape).astype(expected_dtype)
        interpreter.set_tensor(input_details[0]['index'], scaled_input)
        interpreter.invoke()
        output_data = interpreter.get_tensor(output_details[0]['index'])

        print(" Model output:", output_data)

        predicted_class_index = int(np.argmax(output_data))
        confidence = float(np.max(output_data))
        prediction_label = label_mapping.get(predicted_class_index, "Unknown")

        #  Save structured data
        record = {
            "user_id": user_id,
            "predicted_class": prediction_label,
            "confidence": round(confidence * 100, 2),  # Convert to percentage
            "Baseline_FEV1_L": float(features[0]),
            "Baseline_FVC_L": float(features[1]),
            "Baseline_FEV1_FVC_Ratio": float(features[2]),
            "timestamp": datetime.utcnow(),
            "comment": comment,
            "input_features": features  # optional: keep original for trace
        }
        collection.insert_one(record)

        return jsonify({
            "prediction": prediction_label,
            "confidence": confidence
        })

    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500

#  Save history route
@app.route("/api/savehistory", methods=["POST"])
@authenticate
def save_history():
    try:
        data = request.get_json()
        record = {
            "user_id": data.get("user_id"),
            "comment": data.get("comment"),
            "input_features": data.get("features"),
            "prediction": data.get("prediction"),
            "confidence": data.get("confidence")
        }
        collection.insert_one(record)
        return jsonify({"message": "History saved successfully"})
    except Exception as e:
        return jsonify({"error": f"Save history failed: {str(e)}"}), 500

#  Get history route
@app.route("/api/gethistory", methods=["GET"])
@authenticate
def get_history():
    try:
        user_id = g.user["uid"]  # get user ID from Firebase token
        records = (
            collection.find({"user_id": user_id}, {"_id": 0})
            .sort("timestamp", -1)  # sort by newest
            .limit(5)               # only last 5 entries
        )
        return jsonify({"history": list(records)})
    except Exception as e:
        return jsonify({"error": f"History retrieval failed: {str(e)}"}), 500

#  Save profile route
@app.route("/api/saveprofile", methods=["POST"])
@authenticate
def save_profile():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        profile_data = {
            "user_id": user_id,
            "name": data.get("name"),
            "phone": data.get("phone"),
            "age": data.get("age"),
            "sex": data.get("sex"),
            "address": data.get("address"),
        }
        db["profiles"].update_one({"user_id": user_id}, {"$set": profile_data}, upsert=True)
        return jsonify({"message": "Profile saved successfully"})
    except Exception as e:
        return jsonify({"error": f"Saving profile failed: {str(e)}"}), 500

#  Get profile route
@app.route("/api/getprofile", methods=["POST"])
@authenticate
def get_profile():
    try:
        data = request.get_json()
        user_id = data.get("user_id")
        profile = db["profiles"].find_one({"user_id": user_id}, {"_id": 0})
        if profile:
            return jsonify({"profile": profile})
        return jsonify({"error": "Profile not found"}), 404
    except Exception as e:
        return jsonify({"error": f"Fetching profile failed: {str(e)}"}), 500

#  Run the app
if __name__ == "__main__":
    app.run(debug=True)
