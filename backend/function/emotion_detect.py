import cv2
from deepface import DeepFace

# Load face cascade classifier: frontal face detection.
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Start capturing video
cap = cv2.VideoCapture(0)

while True:
    # Capture frame-by-frame.
    ret, frame = cap.read()

    # Convert frame to grayscale
    gray_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Convert frame to RGB format
    rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)

    # Detect faces in the frame
    faces = face_cascade.detectMultiScale(gray_frame, scaleFactor=1.1, minNeighbors=3, minSize=(40, 40))

    for (x, y, w, h) in faces:
        # Extract the face ROI (Region of Interest)a
        face_roi = rgb_frame[y:y + h, x:x + w]
        
        # Perform emotion analysis on the face ROI
        result = DeepFace.analyze(face_roi, actions=["emotion"], enforce_detection=False)

        face_data = result[0]

        emotion = face_data['dominant_emotion']
        # age = face_data['age']
        # gender = face_data['dominant_gender']
        # race = face_data['dominant_race']

        # Draw rectangle around face and label with predicted emotion
        cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 0, 255), 2)

        # Print out the prediction
        # label = f'{emotion},{gender}'
        cv2.putText(frame, emotion, (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)

    # Display the resulting frame
    cv2.imshow('Real-time Emotion Detection', frame)

    # Press 'q' to exit
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

# Release the capture and close all windows
cap.release()
cv2.destroyAllWindows()
