# Krino API

Backend API built with FastAPI for loan default prediction.

## Features

- Neural network model for loan default prediction
- REST API endpoints for prediction and training
- Automatic model training if not available
- CORS support for frontend integration

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Place the `credit_risk_dataset.csv` in this directory

3. Run the server:
   ```
   uvicorn app:app --reload
   ```

## API Endpoints

- `GET /` - Check API status
- `POST /train` - Train the model
- `POST /predict` - Make a loan default prediction

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc)

## Technologies

- FastAPI
- scikit-learn (MLPClassifier)
- pandas
- joblib 