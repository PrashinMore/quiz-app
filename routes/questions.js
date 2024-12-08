const express = require("express");
const router = express.Router();
const Question = require("../models/Question");
const auth = require("../middleware/auth");
const User = require("../models/User");

router.get("/", auth, async (req, res) => {
  try {
    const { topics, limit = 10 } = req.query;
    let query = {};

    if (topics) {
      const topicsArray = topics.split(",");
      query.topic = { $in: topicsArray };
    }

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          topic: 1,
          question: 1,
          options: 1,
          difficulty: 1
        }
      }
    ]);

    res.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).send({ error: "Error fetching questions" });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).send({ error: "Question not found" });
    }
    res.json(question);
  } catch (error) {
    res.status(500).send({ error: "Error fetching question" });
  }
});

router.post("/check", auth, async (req, res) => {
  try {
    const { answers } = req.body;
    const results = {
      total: 0,
      correct: 0,
      answers: {}
    };

    const topicScores = {};

    for (const [questionId, selectedAnswer] of Object.entries(answers)) {
      const question = await Question.findById(questionId);
      if (question) {
        results.total++;
        const isCorrect = question.correctAnswer === selectedAnswer;
        if (isCorrect) {
          results.correct++;
        }

        if (!topicScores[question.topic]) {
          topicScores[question.topic] = {
            total: 0,
            correct: 0
          };
        }
        topicScores[question.topic].total++;
        if (isCorrect) {
          topicScores[question.topic].correct++;
        }

        results.answers[questionId] = {
          correct: isCorrect,
          correctAnswer: question.correctAnswer
        };
      }
    }

    results.score = (results.correct / results.total) * 100;

    const user = await User.findById(req.user._id);
    if (user) {
      for (const [topic, score] of Object.entries(topicScores)) {
        const percentage = (score.correct / score.total) * 100;
        user.scores.push({
          topic,
          score: percentage,
          date: new Date()
        });
      }

      const MAX_SCORES_PER_TOPIC = 5;
      const topicScoreMap = new Map();

      user.scores.sort((a, b) => b.date - a.date);
      user.scores = user.scores.filter((score) => {
        if (!topicScoreMap.has(score.topic)) {
          topicScoreMap.set(score.topic, 1);
          return true;
        }
        const count = topicScoreMap.get(score.topic);
        if (count < MAX_SCORES_PER_TOPIC) {
          topicScoreMap.set(score.topic, count + 1);
          return true;
        }
        return false;
      });

      await user.save();

      results.userProgress = {};
      for (const [topic, _] of Object.entries(topicScores)) {
        const topicScores = user.scores
          .filter((s) => s.topic === topic)
          .map((s) => s.score);

        results.userProgress[topic] = {
          average: topicScores.reduce((a, b) => a + b, 0) / topicScores.length,
          attempts: topicScores.length,
          history: topicScores
        };
      }
    }

    res.json(results);
  } catch (error) {
    console.error("Error checking answers:", error);
    res.status(500).send({ error: "Error checking answers" });
  }
});

router.get("/:topic", auth, async (req, res) => {
  try {
    const questions = await Question.find({
      topic: req.params.topic
    }).limit(10);

    res.send(questions);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
