const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "DemoDB",
  password: "postgress",
  port: 5432,
});

// ========================= STUDENT ENDPOINTS =========================

// Create Student
app.post("/students", async (req, res) => {
  const { name, email, age } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO students (name, email, age) VALUES ($1, $2, $3) RETURNING *",
      [name, email, age]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Students with Pagination
app.get("/students", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const total = await pool.query("SELECT COUNT(*) FROM students");
    const students = await pool.query(
      "SELECT * FROM students ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );
    res.json({
      data: students.rows,
      meta: {
        total: parseInt(total.rows[0].count),
        page,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Student by ID with Marks
app.get("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const student = await pool.query("SELECT * FROM students WHERE id = $1", [id]);
    const marks = await pool.query("SELECT * FROM marks WHERE student_id = $1", [id]);

    if (student.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    res.json({
      student: student.rows[0],
      marks: marks.rows,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Student
app.put("/students/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  try {
    await pool.query(
      "UPDATE students SET name = $1, email = $2, age = $3 WHERE id = $4",
      [name, email, age, id]
    );
    res.json({ message: "Student updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Student
app.delete("/students/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM students WHERE id = $1", [id]);
    res.json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================= MARKS ENDPOINTS =========================

// Add Mark
app.post("/marks", async (req, res) => {
  const { student_id, subject, score } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO marks (student_id, subject, score) VALUES ($1, $2, $3) RETURNING *",
      [student_id, subject, score]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get Marks by Student ID (with Pagination)
app.get("/students/:id/marks", async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const offset = (page - 1) * limit;

  try {
    const total = await pool.query("SELECT COUNT(*) FROM marks WHERE student_id = $1", [id]);
    const marks = await pool.query(
      "SELECT * FROM marks WHERE student_id = $1 ORDER BY id LIMIT $2 OFFSET $3",
      [id, limit, offset]
    );
    res.json({
      data: marks.rows,
      meta: {
        total: parseInt(total.rows[0].count),
        page,
        limit,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Mark
app.put("/marks/:id", async (req, res) => {
  const { id } = req.params;
  const { subject, score } = req.body;
  try {
    await pool.query(
      "UPDATE marks SET subject = $1, score = $2 WHERE id = $3",
      [subject, score, id]
    );
    res.json({ message: "Mark updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Mark
app.delete("/marks/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM marks WHERE id = $1", [id]);
    res.json({ message: "Mark deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
