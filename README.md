Project Architecture

Backend (Node.js + Express + MongoDB)

quiz-backend/
  models/
  routes/
  middleware/
  utils/
  server.js
  package.json

API Endpoints

Authentication
- `POST /api/users/register`
  - Register new user
  - Body: `{ username, email, password }`
  - Returns: User object and JWT token

- `POST /api/users/login`
  - User login
  - Body: `{ email, password }`
  - Returns: User object and JWT token

Quiz Management
- `GET /api/questions`
  - Get random questions by topics
  - Query params: `topics` (comma-separated), `limit`
  - Requires: Authentication token
  - Returns: Array of questions

- `POST /api/questions/check`
  - Submit quiz answers
  - Body: `{ answers: { questionId: selectedAnswer } }`
  - Requires: Authentication token
  - Returns: Score results and user progress

Local Development Setup

Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm (v6 or higher)

Backend Setup
1. Clone repository and install dependencies:
git clone https://github.com/PrashinMore/quiz-app
cd quiz-backend
npm install


2. Create `.env` file:
MONGODB_URI=mongodb://localhost:27017/quiz-app
JWT_SECRET=your_jwt_secret
PORT=5000


3. Start MongoDB:
sudo systemctl start mongodb

4. Seed the database:
node seedDatabase.js

5. Start the server:
npm start

Dependencies

Backend
- express: Web framework
- mongoose: MongoDB ODM
- jsonwebtoken: JWT authentication
- bcryptjs: Password hashing
- cors: Cross-origin resource sharing
- dotenv: Environment configuration

Security Features
- Password strength validation
- JWT authentication
- Rate limiting
- CORS protection
- Input validation
- Secure password storage

Common Issues and Solutions
1. MongoDB Connection:
   - Verify MongoDB is running
   - Check connection string
   - Ensure network access

2. JWT Authentication:
   - Check token expiration
   - Verify secret key
   - Ensure proper token format

3. CORS Issues:
   - Check API URL configuration
   - Verify CORS settings
   - Ensure proper headers
