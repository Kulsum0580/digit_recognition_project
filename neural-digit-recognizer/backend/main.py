"""
Neural Digit Recognizer – FastAPI Backend
Serves predictions from a TensorFlow CNN trained on MNIST.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import base64
import numpy as np
from PIL import Image
import io
import os

app = FastAPI(title="Neural Digit Recognizer API", version="1.0.0")

# Allow requests from the React dev server and any local origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load model once at startup ────────────────────────────────────────────────
model = None

@app.on_event("startup")
async def load_model():
    global model
    model_path = os.path.join(os.path.dirname(__file__), "model", "mnist_cnn.h5")
    if os.path.exists(model_path):
        import tensorflow as tf
        model = tf.keras.models.load_model(model_path)
        print("✅ Model loaded from", model_path)
    else:
        print("⚠️  No saved model found – run train_model.py first, or predictions will use dummy data.")

# ── Schemas ───────────────────────────────────────────────────────────────────
class PredictRequest(BaseModel):
    image: str  # base64-encoded PNG/JPEG


class PredictResponse(BaseModel):
    digit: int
    confidence: float
    probabilities: list[float]


# ── Helpers ───────────────────────────────────────────────────────────────────
def preprocess(image_b64: str) -> np.ndarray:
    """Decode base64 image → 1×28×28×1 float32 array ready for the model."""
    # Strip optional data-URL header
    if "," in image_b64:
        image_b64 = image_b64.split(",", 1)[1]

    raw = base64.b64decode(image_b64)
    img = Image.open(io.BytesIO(raw)).convert("L")   # grayscale
    img = img.resize((28, 28), Image.LANCZOS)

    arr = np.array(img, dtype=np.float32)

    # MNIST convention: white digit on black background
    # If the image is black-on-white (dark background already handled), invert if needed
    if arr.mean() > 127:
        arr = 255.0 - arr

    arr = arr / 255.0
    return arr.reshape(1, 28, 28, 1)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"status": "ok", "message": "Neural Digit Recognizer API is running"}


@app.get("/health")
def health():
    return {"model_loaded": model is not None}


@app.post("/predict", response_model=PredictResponse)
async def predict(req: PredictRequest):
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Run `python train_model.py` first."
        )

    try:
        x = preprocess(req.image)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decode error: {e}")

    probs: np.ndarray = model.predict(x, verbose=0)[0]
    digit = int(np.argmax(probs))
    confidence = float(probs[digit])

    return PredictResponse(
        digit=digit,
        confidence=round(confidence, 4),
        probabilities=[round(float(p), 4) for p in probs],
    )
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
