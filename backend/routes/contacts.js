const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');

// Search contacts with filters
router.get('/search', (req, res) => {
  const db = getDb();
  const {
    q, platform, status, city, company, country, tags,
    page = 1, limit = 20, sort = 'updated_at', order = 'DESC'
  } = req.query;

  const conditions = [];
  const params = [];

  if (q) {
    conditions.push(`(
      first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR
      phone LIKE ? OR company LIKE ? OR telegram_handle LIKE ? OR
      whatsapp_number LIKE ? OR notes LIKE ?
    )`);
    const term = `%${q}%`;
    params.push(term, term, term, term, term, term, term, term);
  }

  if (platform === 'whatsapp') {
    conditions.push("whatsapp_number IS NOT NULL AND whatsapp_number != ''");
  } else if (platform === 'telegram') {
    conditions.push("telegram_handle IS NOT NULL AND telegram_handle != ''");
  } else if (platform === 'both') {
    conditions.push("whatsapp_number IS NOT NULL AND whatsapp_number != '' AND telegram_handle IS NOT NULL AND telegram_handle != ''");
  }

  if (status) {
    if (platform === 'telegram') {
      conditions.push('telegram_status = ?');
    } else {
      conditions.push('whatsapp_status = ?');
    }
    params.push(status);
  }

  if (city) { conditions.push('city LIKE ?'); params.push(`%${city}%`); }
  if (company) { conditions.push('company LIKE ?'); params.push(`%${company}%`); }
  if (country) { conditions.push('country LIKE ?'); params.push(`%${country}%`); }
  if (tags) { conditions.push('tags LIKE ?'); params.push(`%${tags}%`); }

  const allowedSorts = ['first_name', 'last_name', 'company', 'city', 'created_at', 'updated_at'];
  const safeSort = allowedSorts.includes(sort) ? sort : 'updated_at';
  const safeOrder = order === 'ASC' ? 'ASC' : 'DESC';

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const countQuery = `SELECT COUNT(*) as total FROM contacts ${whereClause}`;
  const dataQuery = `SELECT * FROM contacts ${whereClause} ORDER BY ${safeSort} ${safeOrder} LIMIT ? OFFSET ?`;

  const total = db.prepare(countQuery).get(...params).total;
  const contacts = db.prepare(dataQuery).all(...params, parseInt(limit), offset);

  // Log search
  db.prepare('INSERT INTO search_history (query, filters, results_count) VALUES (?, ?, ?)').run(
    q || '', JSON.stringify({ platform, status, city, company }), total
  );

  res.json({
    contacts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    }
  });
});

// Get single contact
router.get('/:id', (req, res) => {
  const db = getDb();
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
});

// Create contact
router.post('/', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const {
    first_name, last_name, email, phone, company, position,
    city, country, whatsapp_number, whatsapp_status,
    telegram_handle, telegram_status, source, tags, notes
  } = req.body;

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'First name and last name are required' });
  }

  db.prepare(`
    INSERT INTO contacts (id, first_name, last_name, email, phone, company, position,
      city, country, whatsapp_number, whatsapp_status, telegram_handle, telegram_status,
      source, tags, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, first_name, last_name, email, phone, company, position,
    city, country || 'France', whatsapp_number, whatsapp_status || 'unknown',
    telegram_handle, telegram_status || 'unknown', source, tags, notes);

  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(id);
  res.status(201).json(contact);
});

// Update contact
router.put('/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Contact not found' });

  const fields = [
    'first_name', 'last_name', 'email', 'phone', 'company', 'position',
    'city', 'country', 'whatsapp_number', 'whatsapp_status',
    'telegram_handle', 'telegram_status', 'source', 'tags', 'notes'
  ];

  const updates = [];
  const params = [];
  for (const field of fields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  updates.push('updated_at = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  db.prepare(`UPDATE contacts SET ${updates.join(', ')} WHERE id = ?`).run(...params);
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  res.json(contact);
});

// Delete contact
router.delete('/:id', (req, res) => {
  const db = getDb();
  const result = db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Contact not found' });
  res.json({ success: true });
});

// Bulk delete
router.post('/bulk-delete', (req, res) => {
  const db = getDb();
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Provide an array of contact IDs' });
  }

  const placeholders = ids.map(() => '?').join(',');
  const result = db.prepare(`DELETE FROM contacts WHERE id IN (${placeholders})`).run(...ids);
  res.json({ deleted: result.changes });
});

module.exports = router;
