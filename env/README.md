# SamruddiSave Environment Directory (`env/`)

This directory contains environment variables configurations for different environments:

- **`.env.development`**: Local development configuration (Vite dev server & sandbox API credentials).
- **`.env.production`**: Production configuration (Staging & Live deployment credentials).
- **`.env.example`**: Template file showing required environment variable keys.

### Usage:
Copy `.env.development` or `.env.example` to the root project directory as `.env`:
```bash
cp env/.env.development .env
```
