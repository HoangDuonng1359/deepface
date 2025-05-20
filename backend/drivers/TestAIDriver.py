import pybase64
from AIDriver import AIDriver

def decode_image(image_path):
    with open(image_path, "rb") as f:
        img_data = f.read()
        base64_str = pybase64.b64encode(img_data).decode('utf-8')
    return base64_str

def test_with_person(who="trump"):
    
    compare_images = []
    target_image = None
    
    people = ["lda", "ronaldo", "messi", "trump"]
    for person in people:
        for i in range(1, 4):
            path = f"backend/drivers/images/{person}/{person}_{i}.jpg"
            image = decode_image(path)
            compare_images.append({
                "student_id": person,
                "image": image
            })

    target_image = decode_image(f"backend/drivers/images/{who}/{who}.jpg")

    result = AIDriver.find(target_image=target_image, compare_images=compare_images)
    
    print(f"Result: {result}")
    print(f"Expected: {who}")

if __name__ == "__main__":
    test_with_person("trump")
    test_with_person("lda")
    test_with_person("ronaldo")
    test_with_person("messi")
    test_with_person("none")
