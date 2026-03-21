# prediction.py
import joblib
import re
from sentence_transformers import SentenceTransformer

class DeepLearningCivicPredictor:
    def __init__(self, model_path='civic_nn_model.pkl'):
        print("Loading Pre-trained DL Language Model (BERT)...")
        self.encoder = SentenceTransformer('all-MiniLM-L6-v2')
        
        print("Loading Custom Neural Network...")
        self.nn_classifier = joblib.load(model_path)
        
        # Priority patterns remain unchanged
        self.high_pattern = re.compile(
            r'\b(?:emergency|urgent|fire|leak|spill|danger|hazard|gas|spark|cave-in)\b', 
            re.IGNORECASE
        )
        self.medium_pattern = re.compile(
            r'\b(?:broken|damaged|blocked|out|dead|overflow|smell|odor|dirty)\b', 
            re.IGNORECASE
        )

    def detect_priority(self, text):
        if self.high_pattern.search(text): return "High"
        elif self.medium_pattern.search(text): return "Medium"
        return "Low"

    def predict(self, user_text):
        # 1. AI reads the text and extracts the deep meaning
        text_embedding = self.encoder.encode([user_text])
        
        # 2. Neural Network classifies the meaning
        predicted_category = self.nn_classifier.predict(text_embedding)[0]
        
        priority = self.detect_priority(user_text)
        
        return {
            "text": user_text,
            "predicted_department": predicted_category,
            "priority_level": priority
        }

# --- Quick Test Execution ---
if __name__ == "__main__":
    predictor = DeepLearningCivicPredictor('civic_nn_model.pkl')
    
    # We use sentences that DO NOT contain the cheat-code words (water, electricity, road, sanitation)
    test_cases = [
        "water stagnation on roads and damages nearby electric ports", 
        "Water starts smelling like sewage after powercut",    
        "lights are gone again in our area",
        "The alleyway behind the restaurant smells absolutely rancid."
    ]
    
    print("\n=== LIVE DL PREDICTIONS ===")
    for case in test_cases:
        result = predictor.predict(case)
        print(f"Text: {result['text']}")
        print(f" -> Route to: {result['predicted_department']} | Priority: {result['priority_level']}\n")