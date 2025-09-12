# SkinGlow Backend

Backend API for the SkinGlow skincare application.

## Getting Started

### Installation

```bash
cd backend
npm install
```

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration values.

### Development

Run the development server:
```bash
npm run dev
```

### Production

Run the production server:
```bash
npm start
```

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /api/health` - Health check endpoint
- `GET /api/products` - Products endpoint (placeholder)
- `GET /api/routines` - Routines endpoint (placeholder)
- `GET /api/analysis` - Analysis endpoint (placeholder)

The server runs on port 3000 by default.
