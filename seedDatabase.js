const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB for seeding"))
  .catch((err) => console.error("MongoDB connection error:", err));

const questionSchema = new mongoose.Schema({
  topic: String,
  question: String,
  options: [String],
  correctAnswer: String,
  difficulty: String
});

const Question = mongoose.model("Question", questionSchema);

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  selectedTopics: [String],
  scores: [
    {
      topic: String,
      score: Number,
      date: Date
    }
  ]
});

const User = mongoose.model("User", userSchema);

const questions = [
  {
    topic: "Mathematics",
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
    difficulty: "easy"
  },
  {
    topic: "Mathematics",
    question: "What is 7 x 8?",
    options: ["54", "56", "58", "60"],
    correctAnswer: "56",
    difficulty: "medium"
  },
  {
    topic: "Science",
    question: "What is the chemical symbol for water?",
    options: ["H2O", "CO2", "O2", "N2"],
    correctAnswer: "H2O",
    difficulty: "easy"
  },
  {
    topic: "Science",
    question: "What is the largest planet in our solar system?",
    options: ["Mars", "Saturn", "Jupiter", "Neptune"],
    correctAnswer: "Jupiter",
    difficulty: "easy"
  },
  {
    topic: "History",
    question: "Who was the first President of the United States?",
    options: [
      "John Adams",
      "Thomas Jefferson",
      "George Washington",
      "Benjamin Franklin"
    ],
    correctAnswer: "George Washington",
    difficulty: "easy"
  },
  {
    topic: "History",
    question: "In which year did World War II end?",
    options: ["1943", "1944", "1945", "1946"],
    correctAnswer: "1945",
    difficulty: "medium"
  },
  {
    topic: "Geography",
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Madrid", "Paris"],
    correctAnswer: "Paris",
    difficulty: "easy"
  },
  {
    topic: "Geography",
    question: "Which is the largest ocean on Earth?",
    options: [
      "Atlantic Ocean",
      "Indian Ocean",
      "Pacific Ocean",
      "Arctic Ocean"
    ],
    correctAnswer: "Pacific Ocean",
    difficulty: "easy"
  },
  {
    topic: "Literature",
    question: 'Who wrote "Romeo and Juliet"?',
    options: [
      "Charles Dickens",
      "William Shakespeare",
      "Jane Austen",
      "Mark Twain"
    ],
    correctAnswer: "William Shakespeare",
    difficulty: "easy"
  },
  {
    topic: "Literature",
    question: 'What is the first book in "The Chronicles of Narnia" series?',
    options: [
      "Prince Caspian",
      "The Lion, the Witch and the Wardrobe",
      "The Magician's Nephew",
      "The Last Battle"
    ],
    correctAnswer: "The Lion, the Witch and the Wardrobe",
    difficulty: "medium"
  }
];

const users = [
  {
    username: "testuser1",
    email: "test1@example.com",
    password: "password123",
    selectedTopics: ["Mathematics", "Science"],
    scores: [
      { topic: "Mathematics", score: 80, date: new Date() },
      { topic: "Science", score: 90, date: new Date() }
    ]
  },
  {
    username: "testuser2",
    email: "test2@example.com",
    password: "password123",
    selectedTopics: ["History", "Geography"],
    scores: [
      { topic: "History", score: 70, date: new Date() },
      { topic: "Geography", score: 85, date: new Date() }
    ]
  }
];

async function seedDatabase() {
  try {
    await Question.deleteMany({});
    await User.deleteMany({});

    await Question.insertMany(questions);
    console.log("Questions seeded successfully");

    const hashedUsers = await Promise.all(
      users.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    await User.insertMany(hashedUsers);
    console.log("Users seeded successfully");

    mongoose.connection.close();
  } catch (error) {
    console.error("Error seeding database:", error);
    mongoose.connection.close();
  }
}

seedDatabase();
