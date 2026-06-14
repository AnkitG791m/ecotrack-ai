# Stage 1: Build React static assets
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Serve with Nginx and setup template config
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
# Copy Nginx template to templates folder for envsubst support
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
EXPOSE 8080
