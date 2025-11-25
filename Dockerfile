# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

# Copy manifests (package.json and, if present, package-lock.json)
COPY package*.json ./

# Faster, reproducible installs if lockfile exists; otherwise fall back
RUN npm set fund false && npm set audit false
RUN npm install -g @angular/cli@17.3.3
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source and build
COPY . .
RUN npm run build

# --- Runtime stage ---
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist/patient-frontend/ ./
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY src/assets/config.js ./assets/config.js
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENV API_BASE=https://patientbackend.isaachahn.my.id
EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx","-g","daemon off;"]
