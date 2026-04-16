const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// IN-MEMORY STORAGE
let drivers = [];
let rides = [];

// ADD DRIVER
app.post("/drivers", (req, res) => {
  const { name, location } = req.body;

  const driver = {
    id: drivers.length + 1,
    name,
    location,
    is_available: true,
  };

  drivers.push(driver);

  res.json({
    message: "Driver added successfully",
    driverId: driver.id,
  });
});

// REQUEST RIDE
app.post("/ride", (req, res) => {
  const { user_location } = req.body;

  let nearest = null;
  let minDistance = Infinity;

  drivers.forEach((d) => {
    if (!d.is_available) return;

    const dist = Math.abs(d.location - user_location);

    if (dist < minDistance) {
      minDistance = dist;
      nearest = d;
    }
  });

  if (!nearest) {
    return res.json({ message: "No drivers available" });
  }

  nearest.is_available = false;

  rides.push({
    user_location,
    driver_id: nearest.id,
    status: "assigned",
  });

  res.json({
    message: "Driver assigned",
    driver: nearest,
    distance: minDistance,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});