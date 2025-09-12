const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SkinGlow Backend API',
    version: '1.0.0',
    status: 'Running'
  });
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Placeholder routes for future features
app.get('/api/products', (req, res) => {
  res.json({ message: 'Products endpoint - Coming soon' });
});

app.get('/api/routines', (req, res) => {
  res.json({ message: 'Routines endpoint - Coming soon' });
});

app.get('/api/analysis', (req, res) => {
  res.json({ message: 'Analysis endpoint - Coming soon' });
});

// Start server
app.listen(PORT, () => {
  console.log(`SkinGlow Backend running on port ${PORT}`);
});
