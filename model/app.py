from flask import Flask, request, jsonify
from deepface import DeepFace
import base64
import cv2
import numpy as np
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

def read_base64_image(base64_string):
    img_data = base64.b64decode(base64_string.split(',')[-1])
    np_arr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

@app.route('/predict_age', methods=['POST'])
def predict_age():
    data = request.get_json()
    image = read_base64_image(data['image'])
    result = DeepFace.analyze(image, actions=['age'], enforce_detection=False)
    return jsonify({"age": result[0]['age']})

@app.route('/predict_emotion', methods=['POST'])
def predict_emotion():
    data = request.get_json()
    image = read_base64_image(data['image'])
    result = DeepFace.analyze(image, actions=['emotion'], enforce_detection=False)
    return jsonify({"emotion": result[0]['dominant_emotion']})

@app.route('/verify', methods=['POST'])
def verify():
    data = request.get_json()
    img1 = read_base64_image(data['image1'])
    img2 = read_base64_image(data['image2'])
    result = DeepFace.verify(img1, img2, enforce_detection=False)
    return jsonify({"same_person": result['verified']})

@app.route('/')
def home():
    return jsonify({"message": "DeepFace API is running"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
