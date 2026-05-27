# Build stage
FROM node:20-alpine AS builder

WORKDIR /frontend

# Copy package descriptors
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code files
COPY . .

# Set default API URL environment variable for production build
ARG VITE_API_BASE_URL=https://nexora-360r.onrender.com/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build production distribution bundles
RUN npm run build

# Runner stage - serve static assets with Nginx
FROM nginx:alpine AS runner

# Copy custom nginx configuration for SPA routing
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files \$uri \$uri/ /index.html;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF

# Copy static assets from build stage
COPY --from=builder /frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
