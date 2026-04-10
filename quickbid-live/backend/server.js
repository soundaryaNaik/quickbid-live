const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

// DB setup
const db = new sqlite3.Database("./bids.db");

db.run(`
  CREATE TABLE IF NOT EXISTS bids (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    amount INTEGER
  )
`);

let auctionEnded = false;

// Place bid
app.post("/bid", (req, res) => {
  if (auctionEnded) {
    return res.json({ message: "Auction ended" });
  }

  const { amount } = req.body;

  db.get("SELECT MAX(amount) as highest FROM bids", (err, row) => {
    const highest = row.highest || 0;

    if (amount > highest) {
      db.run("INSERT INTO bids(amount) VALUES(?)", [amount]);
      res.json({ message: "Bid accepted", highestBid: amount });
    } else {
      res.json({ message: "Bid too low", highestBid: highest });
    }
  });
});

// Get highest bid
app.get("/highest", (req, res) => {
  db.get("SELECT MAX(amount) as highest FROM bids", (err, row) => {
    res.json({ highestBid: row.highest || 0 });
  });
});

// End auction
app.post("/end", (req, res) => {
  auctionEnded = true;
  res.json({ message: "Auction Ended" });
});

// Auto end after 2 mins
setTimeout(() => {
  auctionEnded = true;
  console.log("Auction auto ended");
}, 120000);

app.listen(5000, () => console.log("Server running on port 5000"));