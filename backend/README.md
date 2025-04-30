# Credit Risk Prediction API

Backend API built with FastAPI for credit risk prediction.

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Place the `credit_risk_dataset.csv` file in the root of the backend directory.

## Running the API

Start the API server:

```
uvicorn app:app --reload
```

The API will be available at http://localhost:8000

## API Endpoints

- `GET /` - Check if API is running
- `POST /train` - Train or retrain the model
- `POST /predict` - Make a prediction

## API Documentation

Once the server is running, you can access the interactive API documentation at:

- http://localhost:8000/docs (Swagger UI)
- http://localhost:8000/redoc (ReDoc) 