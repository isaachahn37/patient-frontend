# Patient Frontend (Angular)

- Consumes the backend API at `API_BASE` (default: `http://localhost:8080`).
- Dockerized Nginx serves the built SPA.
- UI: list/search/create/update/delete Patients with server-side pagination.

## Build & Run (Docker)
```bash
# Build image
docker build -t patient-frontend:1 .

# Run (detached)
docker run -d --name patient-frontend   --restart unless-stopped   -p 8081:80   -e API_BASE=http://localhost:8080   patient-frontend:1

# Logs
docker logs -f patient-frontend

# App: http://localhost:8081
```

## Environment
- `API_BASE` — backend base URL (e.g. `http://localhost:8080`).