🗂️ Task Manager Web Application (MERN)

A Full-Stack Task Management System built using the MERN stack with user authentication, CRUD operations, task prioritization, productivity insights, and AI integration for note summarization.

🔍 Overview

This project is a responsive web application that allows users to create, update, delete, and track tasks efficiently. It includes JWT-based authentication, a Node/Express backend, a React + Tailwind frontend, and MongoDB for secure data storage.
Additionally, it integrates AI-powered summarization to generate concise key points from long notes.

🚀 Features

User registration and login with JWT authentication

Create, Read, Update, Delete (CRUD) operations for tasks

Task prioritization (Low / Medium / High)

Task status tracking (Pending / In Progress / Completed)

AI integration for summarizing long notes and generating key points

Productivity insights such as task completion rate and priority analytics

Responsive UI built with React.js and Tailwind CSS

🧩 Tech Stack

Frontend: React.js, Tailwind CSS, JavaScript
Backend: Node.js, Express.js
Database: MongoDB with Mongoose ODM
Authentication: JSON Web Token (JWT)
AI Integration: (e.g., OpenAI API or any custom summarization API)
Tools: npm / yarn, Postman, Git

📁 Folder Structure
/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   └── package.json
└── README.md

⚙️ Installation & Setup
Prerequisites

Node.js (>=14)

npm or yarn

MongoDB (local or MongoDB Atlas)

AI API key (if AI integration is used)

Backend Setup
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create a .env file and add:
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
AI_API_KEY=your_ai_api_key
AI_API_URL=https://api.example.com/summarize

# Run server
npm run dev

Frontend Setup
cd frontend
npm install

# Create .env file and add:
REACT_APP_API_URL=http://localhost:5000/api

# Start the React app
npm start

🔌 API Endpoints
🔐 Authentication
Method	Endpoint	Description
POST	/api/auth/register	Register a new user
POST	/api/auth/login	User login (returns JWT token)
GET	/api/auth/me	Get current user details (requires token)
📝 Tasks
Method	Endpoint	Description
GET	/api/tasks	Get all tasks
POST	/api/tasks	Create a new task
GET	/api/tasks/:id	Get single task
PUT	/api/tasks/:id	Update a task
DELETE	/api/tasks/:id	Delete a task
🤖 AI Summarization
Method	Endpoint	Description
POST	/api/notes/summarize	Summarize a long note and return key points
🔐 Authentication Flow

After login, the backend sends a JWT token.

The frontend stores it in localStorage or cookies.

Subsequent requests include Authorization: Bearer <token> in the header.

Protected routes validate tokens through middleware.

🧠 AI Integration

When a user enters a long note in a task, the frontend sends it to /api/notes/summarize.
The backend calls an external AI API (like OpenAI or a custom service) and returns a summary + key points.
This helps users quickly review important information from lengthy notes.

🧪 Testing

Backend Testing: Use Postman or Insomnia to test APIs.

Frontend Testing: Jest and React Testing Library (optional).

Integration Testing: Verify CRUD operations, authentication, and AI summarization.

☁️ Deployment

Backend: Render / Railway / Heroku / DigitalOcean

Frontend: Vercel / Netlify

Database: MongoDB Atlas

Configure CORS and environment variables for production.

📸 Screenshots

You can include screenshots of your app interface (add a screenshots/ folder in your repo):

![Dashboard](./screenshots/dashboard.png)
![Task Page](./screenshots/task-page.png)

🤝 Contributing

Fork the repo

Create a feature branch (git checkout -b feature-name)

Commit your changes (git commit -m 'Add new feature')

Push to your branch and open a Pull Request

🧾 License

This project is licensed under the MIT License — see the LICENSE file for details.

📬 Contact

Developer: Your Name
Email: your.email@example.com

GitHub: https://github.com/your-username

✨ Short Version (Optional)

If you prefer a minimal README section:

# Task Manager (MERN Stack)

Full-stack Task Manager with JWT auth, CRUD features, task prioritization, and AI-powered note summarization.

### Tech Stack
React, TailwindCSS, Node, Express, MongoDB, Mongoose, JWT, OpenAI

### Run
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm start
