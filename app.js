// college-management-system/index.js

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: 'college-secret',
  resave: false,
  saveUninitialized: true,
}));

// Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'college_management'
});

db.connect(err => {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});

// Middleware for Authentication
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.status(401).send('Unauthorized');
}

// Auth Routes
app.post('/register', async (req, res) => {
  const { username, password, role } = req.body;
  const hash = await bcrypt.hash(password, 10);
  db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], (err, result) => {
    if (err) return res.status(500).send(err);
    res.send('User registered');
  });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], async (err, results) => {
    if (err || results.length === 0) return res.status(401).send('Invalid credentials');
    const match = await bcrypt.compare(password, results[0].password);
    if (!match) return res.status(401).send('Invalid credentials');
    req.session.user = results[0];
    res.send('Login successful');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.send('Logged out');
});

// Student Management
app.post('/students', isAuthenticated, (req, res) => {
  const { name, roll_no, course_id } = req.body;
  db.query('INSERT INTO students (name, roll_no, course_id) VALUES (?, ?, ?)', [name, roll_no, course_id], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Student added');
  });
});

app.get('/students', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM students', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Faculty Management
app.post('/faculty', isAuthenticated, (req, res) => {
  const { name, department } = req.body;
  db.query('INSERT INTO faculty (name, department) VALUES (?, ?)', [name, department], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Faculty added');
  });
});

app.get('/faculty', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM faculty', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Course Management
app.post('/courses', isAuthenticated, (req, res) => {
  const { name, department } = req.body;
  db.query('INSERT INTO courses (name, department) VALUES (?, ?)', [name, department], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Course added');
  });
});

app.get('/courses', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM courses', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Attendance
app.post('/attendance', isAuthenticated, (req, res) => {
  const { student_id, course_id, date, status } = req.body;
  db.query('INSERT INTO attendance (student_id, course_id, date, status) VALUES (?, ?, ?, ?)', [student_id, course_id, date, status], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Attendance recorded');
  });
});

app.get('/attendance', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM attendance', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

// Grading
app.post('/grades', isAuthenticated, (req, res) => {
  const { student_id, course_id, grade } = req.body;
  db.query('INSERT INTO grades (student_id, course_id, grade) VALUES (?, ?, ?)', [student_id, course_id, grade], (err) => {
    if (err) return res.status(500).send(err);
    res.send('Grade recorded');
  });
});

app.get('/grades', isAuthenticated, (req, res) => {
  db.query('SELECT * FROM grades', (err, results) => {
    if (err) return res.status(500).send(err);
    res.json(results);
  });
});

app.listen(3000, () => {
  console.log('College Management System server running on port 3000');
});
