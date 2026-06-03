# Bước 1: Build file tĩnh bằng Node.js
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Bước 2: Phục vụ file tĩnh bằng Nginx
FROM nginx:alpine

# Xóa cấu hình mặc định của Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy file build từ Bước 1 sang thư mục html của Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy file cấu hình Nginx riêng cho SPA (Single Page Application)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
