# SkinGlow

A modern Angular web application for skincare management with three main sections: Shelf, Analyse, and Routines.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm (comes with Node.js)
- Angular CLI (optional, for development)

### Installation

1. Clone or download this project
2. Navigate to the project directory
3. Install dependencies:

```bash
npm install
```

### Development Server

Run the development server:

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

### Build

Build the project for production:

```bash
npm run build
```

The build artifacts will be stored in the `dist/` directory.

### Testing

Run the unit tests:

```bash
npm test
```

## Project Structure

```
src/
├── app/
│   ├── pages/
│   │   ├── shelf/
│   │   ├── analyse/
│   │   └── routines/
│   ├── app.component.*
│   ├── app.config.ts
│   └── app-routing.module.ts
├── assets/
├── index.html
├── main.ts
└── styles.css
```

## Features

- **Routing**: Navigate between Shelf, Analyse, and Routines pages
- **Responsive Design**: Clean, modern interface
- **Active Tab Highlighting**: Blue outline pill for the currently selected tab

## Routes

- `/shelf` - Default landing page
- `/analyse` - Analysis tools and features
- `/routines` - Skincare routine management
