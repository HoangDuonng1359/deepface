from deepface import DeepFace

# Replace with your image paths
image1_path = "model/Data/duong/duong_happy.jpg"
image2_path = "model/Data/duong/duong_neutral.jpg"

result = DeepFace.verify(img1_path=image1_path, img2_path=image2_path, enforce_detection=False)
print(result)

# Access the verification result
if result["verified"]:
    print("The faces are the same person.")
else:
    print("The faces are different people.")