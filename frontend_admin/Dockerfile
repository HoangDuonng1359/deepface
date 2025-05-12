# Sử dụng image Nginx nhỏ gọn, hiệu suất cao
FROM nginx:stable-alpine

# Xoá nội dung mặc định trong thư mục gốc của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy toàn bộ frontend tĩnh vào nơi Nginx phục vụ
COPY public/ /usr/share/nginx/html/

# (Tuỳ chọn) Nếu bạn có file cấu hình nginx riêng:
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Mở cổng 80 (mặc định của Nginx)
EXPOSE 80

# Nginx sẽ tự động khởi động khi container chạy (ENTRYPOINT mặc định)

