# Patient Frontend (Angular + Docker)
Build:
  docker build -t patient-frontend:1 ./frontend
Run (local test):
  docker run -e API_BASE=http://localhost:8080 -p 8081:80 patient-frontend:1

Compose service example:
  patient-frontend:
    build: ./frontend
    environment:
      API_BASE: "http://localhost:8080"
    ports: ["8081:80"]
