# Krino

An AI-powered loan default prediction application with neural network modeling.


## Deployment link: 
Try it now: [Krino Web App](https://krona-app.onrender.com)


## Project Structure

- **backend/** - FastAPI backend with ML model
- **frontend/** - React frontend with modern UI

## Features

- Neural network model for loan default prediction
- Beautiful interactive UI with WebGL aurora background
- Spotlight hover effects and gradient animations
- Real-time form validation and error handling
- Model training on-demand if not available

## Setup

### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install Python dependencies:
   ```
   pip install -r requirements.txt
   ```

3. Place the `credit_risk_dataset.csv` file in the backend directory.

4. Start the backend server:
   ```
   uvicorn app:app --reload
   ```

### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install Node.js dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm run dev
   ```

## Usage

1. Open your browser to [http://localhost:5173](http://localhost:5173)
2. Enter loan application details in the form
3. Click "Predict Loan Status" to get the prediction result
4. View the prediction result and default probability

## Technologies Used

### Backend
- FastAPI
- scikit-learn
- pandas
- joblib

### Frontend
- React
- Framer Motion
- OGL (WebGL)
- Tailwind CSS
- Axios 