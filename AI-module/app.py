# api.py
from fastapi import FastAPI
from pydantic import BaseModel
import time

# Import the inference class from your prediction.py file
from predictor import DeepLearningCivicPredictor

# Initialize the FastAPI application
app = FastAPI(title="Civic Issue AI Router Microservice")

print("BOOTING UP: Loading Deep Learning models into RAM (Please wait a few seconds)...")
# ==========================================
# GLOBAL INITIALIZATION (The Cold-Start Fix)
# We load the AI into memory exactly once when the server starts.
# ==========================================
try:
    ai_predictor = DeepLearningCivicPredictor('civic_nn_model.pkl')
    print("✅ AI is awake and ready to receive requests from Node.js!")
except Exception as e:
    print(f"❌ Error loading the AI model: {e}")
    print("Make sure you have run 'python training.py' first to generate the .pkl file.")

# Define the expected JSON structure from Node.js
class TicketRequest(BaseModel):
    text: str

# The actual endpoint Node.js will call (POST http://127.0.0.1:8000/predict)
@app.post("/predict")
def predict_ticket(request: TicketRequest):
    start_time = time.time()
    
    # Send the raw text to the awake AI model
    result = ai_predictor.predict(request.text)
    
    end_time = time.time()
    
    # Return the clean JSON response back to Node.js
    return {
        "success": True,
        "prediction": result,
        "inference_time_seconds": round(end_time - start_time, 4)
    }

# (Optional) A simple health-check endpoint
@app.get("/")
def health_check():
    return {"status": "AI Microservice is running perfectly."}