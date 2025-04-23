from deepface import DeepFace

def get_emotion(image_path: str) -> str:
    try:
        result = DeepFace.analyze(img_path=image_path, actions=['emotion'], enforce_detection=False)
        dominant_emotion = result[0]['dominant_emotion']
        return dominant_emotion
    except Exception as e:
        print(f"Lỗi khi phân tích ảnh: {e}")
        return "Không xác định được cảm xúc"
