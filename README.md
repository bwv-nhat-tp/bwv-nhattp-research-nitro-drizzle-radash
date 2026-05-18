# bwv-nhattp-research-nitro-drizzle-radash

## Run with Docker Compose

Create a local `.env` if you want to override the defaults:

```env
POSTGRES_DB=intern_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_PORT=5432
APP_PORT=8080
JWT_ACCESS_SECRET=change_me_in_production
JWT_ACCESS_EXPIRES_IN=15m
```

Start the full stack:

```sh
docker compose up --build
```

The app is available at `http://localhost:8080`.

Services included:

- `nginx`: serves the Vue frontend and proxies `/api/v1` to the API.
- `api`: runs the Nitro server on port `8081` inside the compose network.
- `migrate`: runs Drizzle migrations once after Postgres is healthy.
- `postgres`: stores data in the `postgres-data` Docker volume.
