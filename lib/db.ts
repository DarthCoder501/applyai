import mysql from "mysql2";

// Creates connection with mysql database on AWS RDS
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  connectionLimit: 10,
});

// Creates table
async function initDB() {
  const createSQLTable = `
    CREATE TABLE IF NOT EXISTS resume_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_email TEXT,
      resume_text LONGTEXT,
      job_description TEXT,
      match_score INT,
      feedback LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    `;

  // Attempts creation
  try {
    const conn = await pool.promise().getConnection();
    await conn.query(createSQLTable);
    conn.release();
    console.log("Table has been created");
  } catch (error) {
    console.error("Error creating table: ", error);
  }
}

initDB(); // Calls function when app loads
