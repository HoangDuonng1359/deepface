from flask import Flask, request, jsonify
from deepface import DeepFace
import os

app = Flask(__name__)

def get_emotion(image_path):
    try:
        result = DeepFace.analyze(img_path=image_path, actions=['emotion'], enforce_detection=False)
        return result[0]['dominant_emotion']
    except Exception as e:
        print("Lỗi:", e)
        return None

@app.route('/analyze_emotion', methods=['POST'])
def analyze_emotion():
    if 'image' not in request.files:
        return jsonify({'error': 'Không có file ảnh'}), 400

    image = request.files['image']
    image_path = os.path.join("temp.jpg")
    image.save(image_path)

    emotion = get_emotion(image_path)
    os.remove(image_path)

    if emotion:
        return jsonify({'emotion': emotion})
    else:
        return jsonify({'error': 'Không nhận diện được khuôn mặt hoặc có lỗi xảy ra'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
