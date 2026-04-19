# Loan Approval System

AI-powered loan eligibility prediction with XGBoost, FastAPI, React and LLM explanations.

## Tech Stack
- Frontend: React (Vite)
- Backend: FastAPI
- ML: XGBoost + SHAP
- LLM: Groq (LLaMA 3.3 70B)

## Local Setup

### Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

### Frontend
cd client
npm install
npm start