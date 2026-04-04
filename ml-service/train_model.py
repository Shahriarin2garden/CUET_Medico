"""
Train a mental health text classifier using the Kaggle
"Sentiment Analysis for Mental Health" dataset.

Usage:
  1. Download CSV from https://www.kaggle.com/datasets/suchintikasarkar/sentiment-analysis-for-mental-health
  2. Place it in ml-service/data/ (any .csv file)
  3. Run: python train_model.py
"""

import os
import glob
import json
import joblib
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")


def find_csv():
    csvs = glob.glob(os.path.join(DATA_DIR, "*.csv"))
    if not csvs:
        raise FileNotFoundError(
            f"No CSV found in {DATA_DIR}. Download the dataset from Kaggle and place it there."
        )
    return csvs[0]


def load_data(path):
    df = pd.read_csv(path)
    print(f"Loaded {len(df)} rows from {os.path.basename(path)}")
    print(f"Columns: {list(df.columns)}")

    # The Kaggle dataset typically has 'statement' and 'status' columns
    text_col = None
    label_col = None

    for col in df.columns:
        lower = col.strip().lower()
        if lower in ("statement", "text", "content", "message"):
            text_col = col
        if lower in ("status", "label", "class", "category"):
            label_col = col

    if text_col is None or label_col is None:
        print(f"\nAvailable columns: {list(df.columns)}")
        # Fallback: use first and last columns
        text_col = df.columns[0]
        label_col = df.columns[-1]
        print(f"Auto-selected: text='{text_col}', label='{label_col}'")

    print(f"Using: text='{text_col}', label='{label_col}'")

    df = df[[text_col, label_col]].dropna()
    df.columns = ["text", "label"]
    df["text"] = df["text"].astype(str).str.strip()
    df["label"] = df["label"].astype(str).str.strip()
    df = df[df["text"].str.len() > 5]

    print(f"\nLabel distribution:")
    print(df["label"].value_counts().to_string())
    return df


def train(df):
    X = df["text"].values
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    pipe = Pipeline([
        ("tfidf", TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True,
        )),
        ("clf", LogisticRegression(
            max_iter=1000,
            C=1.0,
            solver="lbfgs",
            multi_class="multinomial",
        )),
    ])

    print("\nTraining model...")
    pipe.fit(X_train, y_train)

    train_acc = pipe.score(X_train, y_train)
    test_acc = pipe.score(X_test, y_test)
    print(f"Train accuracy: {train_acc:.3f}")
    print(f"Test accuracy:  {test_acc:.3f}")

    return pipe


def save(pipe):
    os.makedirs(MODEL_DIR, exist_ok=True)

    pipeline_path = os.path.join(MODEL_DIR, "pipeline.pkl")
    joblib.dump(pipe, pipeline_path)
    print(f"\nSaved pipeline to {pipeline_path}")

    classes_path = os.path.join(MODEL_DIR, "label_classes.json")
    with open(classes_path, "w") as f:
        json.dump(list(pipe.classes_), f, indent=2)
    print(f"Saved classes to {classes_path}")


if __name__ == "__main__":
    csv_path = find_csv()
    df = load_data(csv_path)
    pipe = train(df)
    save(pipe)
    print("\nDone! You can now start the Flask server with: python app.py")
