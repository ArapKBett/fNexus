const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// Dashboard overview stats
router.get('/overview', (req, res) => {
  const db = getDb();

  const totalContacts = db.prepare('SELECT COUNT(*) as count FROM contacts').get().count;
  const whatsappActive = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE whatsapp_number IS NOT NULL AND whatsapp_number != ''").get().count;
  const telegramActive = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE telegram_handle IS NOT NULL AND telegram_handle != ''").get().count;
  const bothPlatforms = db.prepare("SELECT COUNT(*) as count FROM contacts WHERE whatsapp_number IS NOT NULL AND whatsapp_number != '' AND telegram_handle IS NOT NULL AND telegram_handle != ''").get().count;
  const totalSearches = db.prepare('SELECT COUNT(*) as count FROM search_history').get().count;
  const totalUploads = db.prepare('SELECT COUNT(*) as count FROM upload_history').get().count;

  const recentSearches = db.prepare(
    'SELECT * FROM search_history ORDER BY created_at DESC LIMIT 10'
  ).all();

  const recentUploads = db.prepare(
    'SELECT * FROM upload_history ORDER BY created_at DESC LIMIT 5'
  ).all();

  res.json({
    stats: {
      totalContacts,
      whatsappActive,
      telegramActive,
      bothPlatforms,
      noPlatform: totalContacts - whatsappActive - telegramActive + bothPlatforms,
      totalSearches,
      totalUploads
    },
    recentSearches,
    recentUploads
  });
});

// Contacts by city
router.get('/by-city', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT city, COUNT(*) as count,
      SUM(CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN 1 ELSE 0 END) as whatsapp_count,
      SUM(CASE WHEN telegram_handle IS NOT NULL AND telegram_handle != '' THEN 1 ELSE 0 END) as telegram_count
    FROM contacts
    WHERE city IS NOT NULL AND city != ''
    GROUP BY city ORDER BY count DESC LIMIT 20
  `).all();
  res.json(data);
});

// Contacts by company
router.get('/by-company', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT company, COUNT(*) as count,
      SUM(CASE WHEN whatsapp_number IS NOT NULL AND whatsapp_number != '' THEN 1 ELSE 0 END) as whatsapp_count,
      SUM(CASE WHEN telegram_handle IS NOT NULL AND telegram_handle != '' THEN 1 ELSE 0 END) as telegram_count
    FROM contacts
    WHERE company IS NOT NULL AND company != ''
    GROUP BY company ORDER BY count DESC LIMIT 20
  `).all();
  res.json(data);
});

// Contacts by source
router.get('/by-source', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT source, COUNT(*) as count
    FROM contacts
    WHERE source IS NOT NULL AND source != ''
    GROUP BY source ORDER BY count DESC LIMIT 20
  `).all();
  res.json(data);
});

// Platform coverage
router.get('/platform-coverage', (req, res) => {
  const db = getDb();

  const whatsappStatuses = db.prepare(`
    SELECT whatsapp_status as status, COUNT(*) as count
    FROM contacts GROUP BY whatsapp_status
  `).all();

  const telegramStatuses = db.prepare(`
    SELECT telegram_status as status, COUNT(*) as count
    FROM contacts GROUP BY telegram_status
  `).all();

  res.json({ whatsapp: whatsappStatuses, telegram: telegramStatuses });
});

// Growth over time (contacts added per day)
router.get('/growth', (req, res) => {
  const db = getDb();
  const data = db.prepare(`
    SELECT DATE(created_at) as date, COUNT(*) as count
    FROM contacts
    GROUP BY DATE(created_at)
    ORDER BY date DESC
    LIMIT 30
  `).all();
  res.json(data.reverse());
});

module.exports = router;
