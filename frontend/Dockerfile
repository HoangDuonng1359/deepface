# Stage 1: Build React App
FROM node:18-alpine as build

# Tạo thư mục làm việc trong container
WORKDIR /app

# Copy file khai báo dependencies
COPY package*.json ./

# Cài đặt dependencies (Tailwind, Ant Design, v.v.)
RUN npm install

# Copy toàn bộ mã nguồn (bao gồm tailwind.config.js, postcss.config.js, src/)
COPY . .

# Build ứng dụng ReactJS
RUN npm run build

# ------------------------------------------------------

# Stage 2: Serve bằng NGINX
FROM nginx:stable-alpine

# Xóa default config của nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copy nginx config tùy chỉnh (nếu có)
COPY nginx.conf /etc/nginx/conf.d

# Copy build output từ stage 1 vào thư mục public của NGINX
COPY --from=build /app/build /usr/share/nginx/html

# Expose cổng 80 (port mặc định của NGINX)
EXPOSE 80

# Khởi chạy NGINX
CMD ["nginx", "-g", "daemon off;"]
