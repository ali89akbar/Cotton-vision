from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
from io import BytesIO
from PIL import Image
import tensorflow as tf
import os
import logging
import sys
import io
from tensorflow.keras.preprocessing.image import ImageDataGenerator # type: ignore



import tensorflow.keras.backend as K # type: ignore


# Force UTF-8 system-wide
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

app = FastAPI()

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler()],
)

# Check model path and load
model_path = "../Plant-Disease-Model.keras"
if not os.path.exists(model_path):
    logging.error(f"Model file '{model_path}' not found!")
    raise FileNotFoundError(f"Model file '{model_path}' not found!")

MODEL = tf.keras.models.load_model(model_path)
logging.info("Model loaded successfully.")

# Class names
class_names = [
    'Apple___Apple_scab', 'Apple___Black_rot', 'Apple___Cedar_apple_rust', 'Apple___healthy',
    'Blueberry___healthy', 'Cherry_(including_sour)___Powdery_mildew', 'Cherry_(including_sour)___healthy',
    'Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot', 'Corn_(maize)___Common_rust_',
    'Corn_(maize)___Northern_Leaf_Blight', 'Corn_(maize)___healthy', 'Grape___Black_rot',
    'Grape___Esca_(Black_Measles)', 'Grape___Leaf_blight_(Isariopsis_Leaf_Spot)', 'Grape___healthy',
    'Orange___Haunglongbing_(Citrus_greening)', 'Peach___Bacterial_spot', 'Peach___healthy',
    'Pepper,_bell___Bacterial_spot', 'Pepper,_bell___healthy', 'Potato___Early_blight',
    'Potato___Late_blight', 'Potato___healthy', 'Raspberry___healthy', 'Soybean___healthy',
    'Squash___Powdery_mildew', 'Strawberry___Leaf_scorch', 'Strawberry___healthy',
    'Tomato___Bacterial_spot', 'Tomato___Early_blight', 'Tomato___Late_blight', 'Tomato___Leaf_Mold',
    'Tomato___Septoria_leaf_spot', 'Tomato___Spider_mites Two-spotted_spider_mite', 'Tomato___Target_Spot',
    'Tomato___Tomato_Yellow_Leaf_Curl_Virus', 'Tomato___Tomato_mosaic_virus', 'Tomato___healthy'
]

# CORS
origins = ["http://localhost", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# def monte_carlo_predictions(model, img_batch, n_simulations=10):
#     @tf.function
#     def predict_with_dropout(inputs):
#         return model(inputs, training=True)

#     predictions = np.array([predict_with_dropout(img_batch).numpy() for _ in range(n_simulations)])
#     mean_prediction = predictions.mean(axis=0)
#     uncertainty = predictions.std(axis=0)
#     return mean_prediction, uncertainty

def augment_image(img_batch, n_augments=5):
    datagen = ImageDataGenerator(
        rotation_range=20,
        width_shift_range=0.1,
        height_shift_range=0.1,
        zoom_range=0.1,
        horizontal_flip=True
    )
    augmented_images = [img_batch[0]] + [datagen.random_transform(img_batch[0]) for _ in range(n_augments)]
    return np.array(augmented_images)



@app.get("/ping")
async def ping():
    return {"message": "Hello, I am alive"}

def preprocess_image(data: bytes) -> np.ndarray:
    image = Image.open(BytesIO(data)).convert("RGB")
    image = image.resize((128, 128))  # Match target_size
    image_array = np.array(image)  # Normalize as in the notebook
    return np.expand_dims(image_array, axis=0)  # Add batch dimension

print(MODEL.summary())

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        image_data = await file.read()
        img_batch = preprocess_image(image_data)

        augmented_images = augment_image(img_batch)
        predictions = MODEL.predict(augmented_images)
        mean_prediction = predictions.mean(axis=0)

        result_index = np.argmax(mean_prediction)
        confidence = float(mean_prediction[result_index])
        predicted_class = class_names[result_index]

        confidence_threshold = 0.5  # Adjust based on model behavior
        if confidence < confidence_threshold:
            return {"class": "Uncertain/Not a Leaf", "confidence": confidence}

        return {"class": predicted_class, "confidence": confidence}
    except Exception as e:
        logging.error(f"Error during prediction: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host='127.0.0.1', port=8000)
    print('model ',MODEL.output_shape)