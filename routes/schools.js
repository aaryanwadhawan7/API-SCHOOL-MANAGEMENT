const express = require("express");
const router = express.Router();
const db = require("../db");


const isValidSchool = (payload) => {
  const { name, address, latitude, longitude } = payload;

  if (!name || !address) return false;
  if (typeof latitude !== "number" || typeof longitude !== "number")
    return false;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180)
    return false;
  return true;
};

router.post("/addSchool", async (req, res) => {
  const { name, address, latitude, longitude } = req.body;
  if (!isValidSchool(req.body)) {
    return res.status(400).json({ error: "Invalid input data" });
  }

  try {
    await db.query(
      "INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)",
      [name, address, latitude, longitude]
    );
    res.json({
       message: "School added successfully" 
      });
  } catch (err) {
    res.status(500).json({ 
      error: "Database error" 
    });
  }
});

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

router.get("/listSchools", async (req, res) => {
  const userLat = parseFloat(req.query.latitude);
  const userLon = parseFloat(req.query.longitude);

  if (
    isNaN(userLat) ||
    isNaN(userLon) ||
    userLat < -90 ||
    userLat > 90 ||
    userLon < -180 ||
    userLon > 180
  ) {
    return res.status(400).json({ 
      error: "Invalid latitude or longitude" 
    });
  }

  try {
    const [schools] = await db.query("SELECT * FROM schools");
    const sortedSchools = schools
      .map((school) => ({
        ...school,
        distance: getDistanceFromLatLonInKm(
          userLat,
          userLon,
          school.latitude,
          school.longitude
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
    res.json({ schools: sortedSchools });
  } catch (err) {
    res.status(500).json({ 
      error: "Database error" 
    });
  }
});

module.exports = router;
