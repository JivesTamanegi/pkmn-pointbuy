const express = require('express');
const cors = require('cors');
const { scrapeSmogonTiers, getSmogonFormats, getTiersForGen } = require('./services/smogonScraper');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;
const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Basic health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Pokemon Point Buy Server is running' });
});

// Endpoint to get available formats
app.get('/api/formats', async (req, res) => {
  try {
    const formats = await getSmogonFormats();
    res.json({ success: true, formats });
  } catch (error) {
    console.error('Error in /api/formats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to get tiers for a specific generation
app.get('/api/tiers/:gen', async (req, res) => {
  try {
    const { gen } = req.params;
    const tiers = await getTiersForGen(gen);
    res.json({ success: true, tiers });
  } catch (error) {
    console.error(`Error in /api/tiers/${gen}:`, error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endpoint to scrape Smogon tiers
app.post('/api/scrape-tiers', async (req, res) => {
  try {
    const { gen, tier, tierPoints } = req.body;
    const pointList = await scrapeSmogonTiers(gen || 'sv', tier, tierPoints);
    res.json({ success: true, pointList });
  } catch (error) {
    console.error('Error in /api/scrape-tiers:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Future routes for Pokemon database and config
// app.use('/api/pokemon', pokemonRouter);
// app.use('/api/config', configRouter);

app.listen(PORT, () => {
  console.log(`Pokemon Point Buy Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Formats endpoint: http://localhost:${PORT}/api/formats`);
});
