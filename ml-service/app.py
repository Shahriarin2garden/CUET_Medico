"""
Flask ML microservice for mental health text classification with LIME explanations.
Runs on port 5001.

Endpoints:
  POST /predict  — classify text, return prediction + confidence
  POST /explain  — classify text + return LIME word-level explanations
  GET  /health   — health check
"""

import os
import json
import joblib
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from lime.lime_text import LimeTextExplainer

app = Flask(__name__)
CORS(app)

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")

# Load model at startup
pipeline = None
class_names = []
explainer = None


def load_model():
    global pipeline, class_names, explainer

    pipeline_path = os.path.join(MODEL_DIR, "pipeline.pkl")
    classes_path = os.path.join(MODEL_DIR, "label_classes.json")

    if not os.path.exists(pipeline_path):
        print(f"WARNING: Model not found at {pipeline_path}")
        print("Run train_model.py first.")
        return False

    pipeline = joblib.load(pipeline_path)

    with open(classes_path, "r") as f:
        class_names = json.load(f)

    explainer = LimeTextExplainer(class_names=class_names)
    print(f"Model loaded. Classes: {class_names}")
    return True


@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok" if pipeline is not None else "model_not_loaded",
        "classes": class_names,
    })


@app.route("/predict", methods=["POST"])
def predict():
    if pipeline is None:
        return jsonify({"error": "Model not loaded. Run train_model.py first."}), 503

    data = request.get_json()
    text = data.get("text", "").strip()

    if not text or len(text) < 10:
        return jsonify({"error": "Text must be at least 10 characters."}), 400

    proba = pipeline.predict_proba([text])[0]
    pred_idx = int(np.argmax(proba))
    prediction = class_names[pred_idx]
    confidence = float(proba[pred_idx])

    all_probs = {name: round(float(p), 4) for name, p in zip(class_names, proba)}

    return jsonify({
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "all_probabilities": all_probs,
    })


@app.route("/explain", methods=["POST"])
def explain():
    if pipeline is None:
        return jsonify({"error": "Model not loaded. Run train_model.py first."}), 503

    data = request.get_json()
    text = data.get("text", "").strip()
    num_features = data.get("num_features", 15)

    if not text or len(text) < 10:
        return jsonify({"error": "Text must be at least 10 characters."}), 400

    # Prediction
    proba = pipeline.predict_proba([text])[0]
    pred_idx = int(np.argmax(proba))
    prediction = class_names[pred_idx]
    confidence = float(proba[pred_idx])
    all_probs = {name: round(float(p), 4) for name, p in zip(class_names, proba)}

    # LIME explanation
    exp = explainer.explain_instance(
        text,
        pipeline.predict_proba,
        num_features=min(num_features, 20),
        num_samples=500,
        labels=[pred_idx],
    )

    explanation = [
        {"word": word, "weight": round(float(weight), 6)}
        for word, weight in exp.as_list(label=pred_idx)
    ]

    return jsonify({
        "prediction": prediction,
        "confidence": round(confidence, 4),
        "all_probabilities": all_probs,
        "explanation": explanation,
    })


if __name__ == "__main__":
    model_loaded = load_model()
    if not model_loaded:
        print("\n⚠ Starting server without model. /predict and /explain will return 503.")
        print("Run 'python train_model.py' to train and save the model.\n")
    app.run(host="0.0.0.0", port=5001, debug=True)
