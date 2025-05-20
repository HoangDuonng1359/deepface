"""
Note:
    Định dạng compare_images:
    [
        {"student_id": "23020326", "image": "base64_image_1"},
        {"student_id": "23020326", "image": "base64_image_2"},
        {"student_id": "23020326", "image": "base64_image_3"},
        {"student_id": "23020327", "image": "base64_image_1"},
        {"student_id": "23020327", "image": "base64_image_2"}
    ]

"""


class AIDriver:

    @staticmethod
    def find(
        target_image: str,
        compare_images: list
    ) -> str:
        """
            Tìm kiếm sinh viên

            Parameters:
                target_image (str): Mã hóa base64 cho bức ảnh mục tiêu
                compare_images (list[dict]): Danh sách các ảnh lấy được trong cơ sở dữ liệu

            Returns:
                str: Mã sinh viên
        
        """

        pass