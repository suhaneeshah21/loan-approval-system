from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from model import predict_and_explain
from groqllm import get_llm_response

app=FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class LoanApplication(BaseModel):
    no_of_dependents: int
    education: int          # 1 = Graduate, 0 = Not Graduate
    self_employed: int      # 1 = Yes, 0 = No
    income_annum: float
    loan_amount: float
    loan_term: int
    cibil_score: int
    residential_assets_value: float
    commercial_assets_value: float
    luxury_assets_value: float
    bank_asset_value: float


@app.post("/predict")
async def predict(application:LoanApplication):
    input_data=application.model_dump()

    prediction,shap_explanation=predict_and_explain(input_data)
    llm_response=get_llm_response(input_data,shap_explanation,prediction)

    return{
        "prediction": prediction,
        "shap_explanation": shap_explanation,
        "llm_response": llm_response 
    }

