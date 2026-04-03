const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const path = require('path');
const fs = require('fs');
const { getDb } = require('../database');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '..', 'data', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.csv', '.json'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only CSV and JSON files are allowed'));
  }
});

// Field mapping for flexible CSV headers
const FIELD_MAP = {
  'first_name': ['first_name', 'firstname', 'prenom', 'prénom', 'first', 'given_name'],
  'last_name': ['last_name', 'lastname', 'nom', 'last', 'family_name', 'surname'],
  'email': ['email', 'e-mail', 'mail', 'courriel'],
  'phone': ['phone', 'telephone', 'téléphone', 'tel', 'mobile', 'portable'],
  'company': ['company', 'entreprise', 'société', 'societe', 'organization', 'organisation'],
  'position': ['position', 'poste', 'title', 'titre', 'job_title', 'role'],
  'city': ['city', 'ville', 'location', 'localisation'],
  'country': ['country', 'pays'],
  'whatsapp_number': ['whatsapp', 'whatsapp_number', 'wa_number', 'wa'],
  'telegram_handle': ['telegram', 'telegram_handle', 'tg_handle', 'tg'],
  'source': ['source', 'origine'],
  'tags': ['tags', 'etiquettes', 'labels'],
  'notes': ['notes', 'remarques', 'commentaires']
};

function mapHeaders(rawHeaders) {
  const mapping = {};
  for (const raw of rawHeaders) {
    const normalized = raw.toLowerCase().trim().replace(/\s+/g, '_');
    for (const [field, aliases] of Object.entries(FIELD_MAP)) {
      if (aliases.includes(normalized)) {
        mapping[raw] = field;
        break;
      }
    }
  }
  return mapping;
}

// Upload and import contacts
router.post('/', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const db = getDb();
  const ext = path.extname(req.file.originalname).toLowerCase();

  let records;
  try {
    const content = fs.readFileSync(req.file.path, 'utf-8');
    if (ext === '.csv') {
      const parsed = parse(content, { columns: true, skip_empty_lines: true, trim: true, bom: true });
      if (parsed.length === 0) return res.status(400).json({ error: 'CSV file is empty' });

      const headerMap = mapHeaders(Object.keys(parsed[0]));
      records = parsed.map(row => {
        const mapped = {};
        for (const [rawCol, value] of Object.entries(row)) {
          const field = headerMap[rawCol];
          if (field) mapped[field] = value;
        }
        return mapped;
      });
    } else {
      const jsonData = JSON.parse(content);
      records = Array.isArray(jsonData) ? jsonData : [jsonData];
    }
  } catch (err) {
    return res.status(400).json({ error: `Failed to parse file: ${err.message}` });
  }

  const uploadRecord = db.prepare(
    'INSERT INTO upload_history (filename, records_total, status) VALUES (?, ?, ?)'
  ).run(req.file.originalname, records.length, 'processing');

  const insertStmt = db.prepare(`
    INSERT INTO contacts (id, first_name, last_name, email, phone, company, position,
      city, country, whatsapp_number, whatsapp_status, telegram_handle, telegram_status,
      source, tags, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let imported = 0;
  let skipped = 0;
  const errors = [];

  const insertMany = db.transaction((records) => {
    for (const rec of records) {
      if (!rec.first_name || !rec.last_name) {
        skipped++;
        errors.push(`Skipped: missing name for record ${JSON.stringify(rec).substring(0, 80)}`);
        continue;
      }

      try {
        insertStmt.run(
          uuidv4(),
          rec.first_name, rec.last_name,
          rec.email || null, rec.phone || null,
          rec.company || null, rec.position || null,
          rec.city || null, rec.country || 'France',
          rec.whatsapp_number || rec.phone || null,
          rec.whatsapp_number ? 'active' : 'unknown',
          rec.telegram_handle || null,
          rec.telegram_handle ? 'active' : 'unknown',
          rec.source || req.file.originalname,
          rec.tags || null, rec.notes || null
        );
        imported++;
      } catch (err) {
        skipped++;
        errors.push(`Error: ${err.message}`);
      }
    }
  });

  insertMany(records);

  db.prepare(
    'UPDATE upload_history SET records_imported = ?, records_skipped = ?, status = ? WHERE id = ?'
  ).run(imported, skipped, 'completed', uploadRecord.lastInsertRowid);

  res.json({
    success: true,
    filename: req.file.originalname,
    total: records.length,
    imported,
    skipped,
    errors: errors.slice(0, 10)
  });
});

// Get upload history
router.get('/history', (req, res) => {
  const db = getDb();
  const history = db.prepare(
    'SELECT * FROM upload_history ORDER BY created_at DESC LIMIT 50'
  ).all();
  res.json(history);
});

module.exports = router;
