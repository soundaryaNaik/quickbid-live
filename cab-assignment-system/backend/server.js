const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// ✅ DATABASE (NEON POSTGRES)
// ===============================
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Optional test connection log
db.connect()
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => {
    console.log("❌ DB Connection Failed:");
    console.log(err.message);
  });

// ===============================
// 🚗 ADD DRIVER API
// ===============================
app.post("/drivers", (req, res) => {
  const { name, location } = req.body;

  if (!name || location === undefined) {
    return res.status(400).json({ message: "Missing name or location" });
  }

  const query =
    "INSERT INTO drivers (name, location, is_available) VALUES ($1, $2, true) RETURNING id";

  db.query(query, [name, location], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: err.message });
    }

    res.json({
      message: "Driver added successfully",
      driverId: result.rows[0].id,
    });
  });
});

// ===============================
// 🚕 REQUEST RIDE API
// ===============================
app.post("/ride", (req, res) => {
  const { user_location } = req.body;

  if (user_location === undefined) {
    return res.status(400).json({ message: "Missing user_location" });
  }

  db.query(
    "SELECT * FROM drivers WHERE is_available = true",
    (err, driversResult) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
      }

      const drivers = driversResult.rows;

      if (drivers.length === 0) {
        return res.json({ message: "No drivers available" });
      }

      let nearestDriver = null;
      let minDistance = Infinity;

      drivers.forEach((driver) => {
        const distance = Math.abs(driver.location - user_location);

        if (distance < minDistance) {
          minDistance = distance;
          nearestDriver = driver;
        }
      });

      // Save ride
      db.query(
        "INSERT INTO rides (user_location, driver_id, status) VALUES ($1, $2, 'assigned')",
        [user_location, nearestDriver.id]
      );

      // Update driver
      db.query(
        "UPDATE drivers SET is_available = false WHERE id = $1",
        [nearestDriver.id]
      );

      res.json({
        message: "Driver assigned",
        driver: nearestDriver,
        distance: minDistance,
      });
    }
  );
});

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});