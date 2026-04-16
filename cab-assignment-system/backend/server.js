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

// Test DB connection
db.connect()
  .then(() => console.log("✅ Database Connected"))
  .catch((err) => {
    console.log("❌ Database Connection Failed:");
    console.log(err.message);
  });

// ===============================
// 🚗 ADD DRIVER API
// ===============================
app.post("/drivers", async (req, res) => {
  const { name, location } = req.body;

  if (!name || location === undefined) {
    return res.status(400).json({ message: "Missing name or location" });
  }

  try {
    const result = await db.query(
      "INSERT INTO drivers (name, location, is_available) VALUES ($1, $2, true) RETURNING id",
      [name, location]
    );

    res.json({
      message: "Driver added successfully",
      driverId: result.rows[0].id,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 🚕 REQUEST RIDE API
// ===============================
app.post("/ride", async (req, res) => {
  const { user_location } = req.body;

  if (user_location === undefined) {
    return res.status(400).json({ message: "Missing user_location" });
  }

  try {
    const driversResult = await db.query(
      "SELECT * FROM drivers WHERE is_available = true"
    );

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
    await db.query(
      "INSERT INTO rides (user_location, driver_id, status) VALUES ($1, $2, 'assigned')",
      [user_location, nearestDriver.id]
    );

    // Update driver
    await db.query(
      "UPDATE drivers SET is_available = false WHERE id = $1",
      [nearestDriver.id]
    );

    res.json({
      message: "Driver assigned",
      driver: nearestDriver,
      distance: minDistance,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

// ===============================
// 🚀 START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});