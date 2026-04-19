import joblib
import shap
import pandas as pd

model=joblib.load("xgboost_model.pkl")
explainer=shap.TreeExplainer(model)

FEATURE_NAMES = [
    'no_of_dependents', 'education', 'self_employed',
    'income_annum', 'loan_amount', 'loan_term', 'cibil_score',
    'residential_assets_value', 'commercial_assets_value',
    'luxury_assets_value', 'bank_asset_value'
]


def predict_and_explain(input_data):
  df=pd.DataFrame([input_data])[FEATURE_NAMES]

  prediction=int(model.predict(df)[0])

  shap_values=explainer.shap_values(df)

  explanation = {
        feature: float(shap_val)
        for feature, shap_val in zip(FEATURE_NAMES, shap_values[0])
    } 

  explanation=dict(sorted(
        explanation.items(),
        key=lambda x: abs(x[1]),
        reverse=True
    )[:4])


  return prediction,explanation
