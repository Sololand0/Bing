// server.js
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// إعداد محرك القوالب EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// إعداد ملفات الاستاتيكية والميدلوير
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// إنشاء قاعدة بيانات SQLite
const db = new sqlite3.Database('./quiz.db', (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log('Connected to the quiz database.');
  }
});

// إنشاء الجداول (إن لم تكن موجودة)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    image TEXT,
    options TEXT NOT NULL, -- يتم تخزين الاختيارات كنص بصيغة JSON
    correctIndex INTEGER NOT NULL,
    timesShown INTEGER DEFAULT 0,
    correctAnswers INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS client_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sessionId TEXT,
    name TEXT,           -- عمود الاسم الجديد
    score INTEGER,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// --- Routes --- //

// صفحة العميل الرئيسية (لعبة الأسئلة)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// صفحة الإدارة (admin) لإضافة اختبارات جديدة
app.get('/admin', (req, res) => {
  res.render('admin');
});

// API: استرجاع جميع الأسئلة
app.get('/api/questions', (req, res) => {
  db.all("SELECT * FROM questions", [], (err, rows) => {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    // تحويل نص الاختيارات (JSON) إلى مصفوفة
    const questions = rows.map(row => ({
      id: row.id,
      question: row.question,
      image: row.image,
      options: JSON.parse(row.options),
      correctIndex: row.correctIndex,
      timesShown: row.timesShown,
      correctAnswers: row.correctAnswers
    }));
    res.json(questions);
  });
});

// API: إضافة سؤال جديد (من صفحة الإدارة)
app.post('/api/add-question', (req, res) => {
  const { question, image, options, correctIndex } = req.body;
  // نتوقع أن يكون options مصفوفة؛ إذا كانت سلسلة مفصولة بفواصل يمكن تحويلها
  const optionsJSON = JSON.stringify(options);
  const sql = `INSERT INTO questions (question, image, options, correctIndex) VALUES (?,?,?,?)`;
  db.run(sql, [question, image, optionsJSON, correctIndex], function(err) {
    if (err) {
      console.error(err.message);
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "تم إضافة الاختبار بنجاح", questionId: this.lastID });
  });
});

// API: حفظ نتيجة العميل مع الاسم
app.post('/api/client-result', (req, res) => {
  const { sessionId, name, score } = req.body;
  const sql = `INSERT INTO client_results (sessionId, name, score) VALUES (?, ?, ?)`;
  db.run(sql, [sessionId, name, score], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ message: "تم حفظ نتيجة العميل", resultId: this.lastID });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
