const express = require('express');
const cors = require('cors');
const path = require('path');
const contactsRouter = require('./routes/contacts');
const uploadRouter = require('./routes/upload');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'data', 'uploads')));

app.use('/api/contacts', contactsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'online', service: 'NEXUS API', version: '1.0' });
});

app.listen(PORT, () => {
  console.log(`[NEXUS] Server operational on port ${PORT}`);
});
