import base64

def image_to_base64(image_path: str) -> str:
    """
    Convert image file to base64 encoded string.

    Args:
        image_path (str): Path to the image file.

    Returns:
        str: Base64 encoded string of the image.
    """
    with open(image_path, "rb") as img_file:
        encoded_string = base64.b64encode(img_file.read()).decode('utf-8')
    return encoded_string

if __name__ == '__main__':
    print(image_to_base64('backend\drivers\images\lda\lda_3.jpg'))
