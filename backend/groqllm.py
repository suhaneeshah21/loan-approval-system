from groq import Groq
import os
from dotenv import load_dotenv


client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def get_llm_response(user_data, shap_explanation, prediction):
    # same prompt as before
    

    status = "approved" if prediction == 1 else "rejected"

    shap_text = "\n".join([
        f"- {k.replace('_', ' ').title()}: {'positive' if v > 0 else 'negative'} impact ({round(v, 2)})"
        for k, v in shap_explanation.items()
    ])

    prompt = f"""
    A loan applicant has been {status}.

    Applicant Profile:
    - Dependents: {user_data['no_of_dependents']}
    - Education: {'Graduate' if user_data['education'] == 1 else 'Not Graduate'}
    - Self Employed: {'Yes' if user_data['self_employed'] == 1 else 'No'}
    - Annual Income: ₹{user_data['income_annum']:,}
    - Loan Amount: ₹{user_data['loan_amount']:,}
    - Loan Term: {user_data['loan_term']} years
    - CIBIL Score: {user_data['cibil_score']}

    Top factors that influenced this decision:
    {shap_text}

    Respond in exactly this format:

    PROFILE SUMMARY:
    Write 2-3 lines summarizing this applicant's financial profile in simple, human-friendly language.

    DECISION REASON:
    In 1-2 lines explain why they were {status} based on the factors above.

    {"SUGGESTIONS:" if prediction == 0 else "TIPS:"}
    {"Give 3 specific actionable suggestions to improve their chances of approval." if prediction == 0 else "Give 2 tips to maintain good financial standing."}

    Address the applicant directly using 'you/your' instead of 'they/them'.
    Keep the tone friendly and practical.
    Do not use any markdown formatting like ** or ## in your response.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",  # free and powerful
        messages=[{"role": "user", "content": prompt}],
        max_tokens=400
    )

    
    return response.choices[0].message.content