import os
import joblib
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.neural_network import MLPClassifier
from typing import Literal

app = FastAPI(title="Credit Risk Prediction API")

# Fix CORS setup with explicit origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model paths
MODEL_DIR = "model"
MODEL_PATH = os.path.join(MODEL_DIR, "model.joblib")
SCALER_PATH = os.path.join(MODEL_DIR, "scaler.joblib")
LABEL_ENCODERS_PATH = os.path.join(MODEL_DIR, "label_encoders.joblib")

# Ensure model directory exists
os.makedirs(MODEL_DIR, exist_ok=True)

class LoanPredictionRequest(BaseModel):
    person_age: int = Field(..., example=27)
    person_income: int = Field(..., example=50000)
    person_home_ownership: Literal["RENT", "MORTGAGE", "OWN", "OTHER"] = Field(..., example="RENT")
    person_emp_length: float = Field(..., example=5.0)
    loan_intent: Literal["PERSONAL", "EDUCATION", "MEDICAL", "VENTURE", "HOMEIMPROVEMENT", "DEBTCONSOLIDATION"] = Field(..., example="PERSONAL")
    loan_grade: Literal["A", "B", "C", "D", "E", "F", "G"] = Field(..., example="C")
    loan_amnt: int = Field(..., example=15000)
    loan_int_rate: float = Field(..., example=12.5)
    loan_percent_income: float = Field(..., example=0.3)
    cb_person_default_on_file: Literal["Y", "N"] = Field(..., example="N")
    cb_person_cred_hist_length: int = Field(..., example=4)

class PredictionResponse(BaseModel):
    loan_status: str
    default_probability: float

def train_model():
    """Train the model and save it along with preprocessors"""
    # Load and prepare data
    df = pd.read_csv("credit_risk_dataset.csv")
    
    # Basic cleaning
    df["loan_int_rate"].fillna(df["loan_int_rate"].median(), inplace=True)
    df = df.dropna(subset=["person_emp_length"])
    df = df[df['person_age'] <= 80]
    df = df[df['person_income'] <= 100000]
    
    # Prepare label encoders
    label_encoders = {}
    categorical_columns = ["person_home_ownership", "loan_intent", "loan_grade", "cb_person_default_on_file"]
    
    for column in categorical_columns:
        le = LabelEncoder()
        df[column] = le.fit_transform(df[column])
        label_encoders[column] = le
    
    # Prepare features and target
    y = df["loan_status"]
    X = df.drop(["loan_status"], axis=1)
    
    # Scale features
    scaler = StandardScaler()
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=6)
    X_train_scaled = scaler.fit_transform(X_train)
    
    # Train model
    model = MLPClassifier(
        hidden_layer_sizes=(32, 16, 8),
        activation="relu",
        max_iter=200,
        random_state=17,
        learning_rate_init=0.01,
        learning_rate="adaptive"
    )
    model.fit(X_train_scaled, y_train)
    
    # Save model and preprocessors
    joblib.dump(model, MODEL_PATH)
    joblib.dump(scaler, SCALER_PATH)
    joblib.dump(label_encoders, LABEL_ENCODERS_PATH)
    
    return model, scaler, label_encoders

def load_model():
    """Load the model and preprocessors"""
    if not os.path.exists(MODEL_PATH):
        return train_model()
    
    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    label_encoders = joblib.load(LABEL_ENCODERS_PATH)
    
    return model, scaler, label_encoders

@app.get("/")
def read_root():
    return {"message": "Credit Risk Prediction API is running"}

@app.post("/train")
def train_endpoint():
    try:
        train_model()
        return {"message": "Model trained and saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error training model: {str(e)}")

@app.post("/predict", response_model=PredictionResponse)
def predict(request: LoanPredictionRequest):
    try:
        # Load model and preprocessors
        model, scaler, label_encoders = load_model()
        
        # Convert request to dataframe
        input_data = pd.DataFrame([request.dict()])
        
        # Apply label encoding
        for column, encoder in label_encoders.items():
            input_data[column] = encoder.transform(input_data[column])
        
        # Scale the features
        input_scaled = scaler.transform(input_data)
        
        # Make prediction
        prediction = model.predict(input_scaled)[0]
        probability = model.predict_proba(input_scaled)[0][1]
        
        return {
            "loan_status": "Default" if prediction == 1 else "Non-Default",
            "default_probability": float(probability)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during prediction: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 