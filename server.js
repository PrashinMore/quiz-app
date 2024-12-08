const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const questionsRoute = require("./routes/questions");
const usersRoute = require("./routes/users");
const User = require("./models/User");
const auth = require("./middleware/auth");
const helmet = require("helmet");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use(
  cors({
    origin: [
      "https://quiz-app-frontend-imu1j0xaq-prashins-projects-41222466.vercel.app",
      "http://localhost:3000"
    ],
    credentials: true
  })
);

app.use(helmet());

const rateLimit = require("express-rate-limit");
app.use(
  rateLimit({
    windowMs: 15 * 60 * 10000,
    max: 10000
  })
);

app.post("/api/topics/select", auth, async (req, res) => {
  try {
    const { topics } = req.body;
    req.user.selectedTopics = topics;
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.post("/api/scores", auth, async (req, res) => {
  try {
    const { topic, score } = req.body;
    req.user.scores.push({ topic, score });
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    const leaderboard = await User.aggregate([
      { $unwind: "$scores" },
      {
        $group: {
          _id: "$username",
          totalScore: { $sum: "$scores.score" },
          averageScore: { $avg: "$scores.score" }
        }
      },
      { $sort: { totalScore: -1 } },
      { $limit: 10 }
    ]);

    res.send(leaderboard);
  } catch (error) {
    res.status(500).send(error);
  }
});
app.use("/api/questions", questionsRoute);
app.use("/api/users", usersRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
