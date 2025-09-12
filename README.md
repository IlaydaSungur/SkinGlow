# SkinGlow

A modern full-stack application for skincare management with Angular frontend and Node.js backend.

## Project Structure

```
SkinGlow/
├── frontend/          # Angular application
│   ├── src/
│   │   ├── app/
│   │   │   ├── pages/
│   │   │   │   ├── shelf/
│   │   │   │   ├── analyse/
│   │   │   │   └── routines/
│   │   │   ├── app.component.*
│   │   │   ├── app.config.ts
│   │   │   └── app-routing.module.ts
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── package.json
│   ├── angular.json
│   └── tsconfig*.json
├── backend/           # Node.js API server
│   ├── server.js
│   ├── package.json
│   └── README.md
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)

## Frontend (Angular)

### Installation

```bash
cd frontend
npm install
```

### Development Server

```bash
cd frontend
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

```bash
cd frontend
npm run build
```

## Backend (Node.js)

### Installation

```bash
cd backend
npm install
```

### Development Server

```bash
cd backend
npm run dev
```

The API server runs on `http://localhost:3000/`.

### Production

```bash
cd backend
npm start
```

## Features

### Frontend
- **Routing**: Navigate between Shelf, Analyse, and Routines pages
- **Responsive Design**: Clean, modern interface
- **Active Tab Highlighting**: Blue outline pill for the currently selected tab

### Backend
- **RESTful API**: Express.js server with CORS support
- **Health Check**: API endpoint monitoring
- **Modular Structure**: Ready for feature expansion

## API Endpoints

- `GET /` - Root endpoint with API information
- `GET /api/health` - Health check endpoint
- `GET /api/products` - Products endpoint (placeholder)
- `GET /api/routines` - Routines endpoint (placeholder)
- `GET /api/analysis` - Analysis endpoint (placeholder)

## Routes (Frontend)

- `/shelf` - Default landing page
- `/analyse` - Analysis tools and features
- `/routines` - Skincare routine management
