# Email Productivity Agent - MERN Stack

A full-stack **AI-powered Email Productivity Agent** built with **MongoDB, Express.js, React, Node.js**, and **Google Gemini AI** for intelligent email management.

---

## 🌟 Features

- **AI-Powered Email Categorization** – Auto-sorts emails using customizable prompt templates
- **Action Item Extraction** – Detects tasks, deadlines, and next steps
- **AI Reply Generation** – Generates professional responses
- **Interactive Chat Agent** – Ask questions like _“Show my urgent emails”_
- **Prompt Configuration Panel** – Full control over all AI prompts
- **Draft Management System** – Create, edit, and save drafts (never auto-sends)
- **Inbox Analytics Dashboard** – Visual charts and insights
- **Responsive UI Design** – Smooth and modern interface

---

## 🏗️ Technology Stack

### **Backend**

- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Google Gemini AI

### **Frontend**

- React
- React Router
- Axios
- Recharts

---

## 📋 Prerequisites

- Node.js (16+)
- MongoDB Atlas account
- Google Gemini API key

---

## 🚀 Installation

### **1. Clone Project**

```
mkdir email-productivity-agent
cd email-productivity-agent
```

---

### **2. Backend Setup**

```
mkdir -p backend/config backend/models backend/routes backend/services backend/data
cd backend
npm init -y
npm install express mongoose cors dotenv @google/generative-ai
npm install --save-dev nodemon
```

👉 Copy backend source files.

Create `.env` inside backend:

```
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
NODE_ENV=development
```

---

### **3. Frontend Setup**

```
cd ..
npx create-react-app frontend
cd frontend
npm install axios react-router-dom react-icons recharts
```

👉 Copy frontend files into `/src`.

---

## 🔑 API Keys Setup

### **MongoDB Atlas**

1. Go to https://cloud.mongodb.com
2. Create free cluster
3. Whitelist IP `0.0.0.0/0`
4. Copy connection string

### **Gemini API**

1. Visit: https://makersuite.google.com/app/apikey
2. Create API key
3. Add to backend `.env`

---

## 🎮 Running the App

### **Start Backend**

```
cd backend
npm run dev
```

Expected:

```
✅ Server running on port 5000
✅ MongoDB Connected
```

### **Start Frontend**

```
cd frontend
npm start
```

App opens at:
👉 http://localhost:3000

---

## 📊 How to Use

### **Step 1 — Load Inbox**

Click **“📤 Load Inbox”** (loads 15 sample emails)

### **Step 2 — Process Emails**

Click **“🔮 Process Emails”**  
AI categorizes all emails (30–60 sec)

### **Step 3 — Explore the App**

✔ View categorized inbox  
✔ See action items  
✔ Generate replies  
✔ Summaries  
✔ Create & edit drafts  
✔ Chat with the AI  
✔ Analyze statistics

---

## 🧠 Chat Agent Examples

Try:

- "Summarize my inbox"
- "Show urgent emails"
- "List all pending tasks"
- "How many unread emails do I have?"

---

## 🧩 API Endpoints

### **Emails**

- `GET /api/emails`
- `GET /api/emails/:emailId`
- `POST /api/emails/load-mock`
- `POST /api/emails/process-all`
- `POST /api/emails/:emailId/reply`
- `POST /api/emails/:emailId/summarize`
- `GET /api/emails/stats/overview`
- `POST /api/emails/chat`
- `DELETE /api/emails/reset`

### **Prompts**

- `GET /api/prompts`
- `GET /api/prompts/:name`
- `POST /api/prompts`
- `PUT /api/prompts/:name`
- `POST /api/prompts/load-defaults`

### **Drafts**

- `GET /api/drafts`
- `POST /api/drafts`
- `POST /api/drafts/generate`
- `PUT /api/drafts/:draftId`
- `DELETE /api/drafts/:draftId`

---

## 🗂 Folder Structure

```
email-productivity-agent/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── Email.js
│   │   ├── Prompt.js
│   │   └── Draft.js
│   ├── routes/
│   │   ├── emails.js
│   │   ├── prompts.js
│   │   └── drafts.js
│   ├── services/
│   │   ├── geminiService.js
│   │   └── emailProcessor.js
│   └── data/
│       ├── mockInbox.json
│       └── defaultPrompts.json
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── index.js
│       ├── index.css
│       ├── App.js
│       ├── App.css
│       ├── components/
│       │   ├── Inbox.js
│       │   ├── EmailDetail.js
│       │   ├── PromptConfig.js
│       │   ├── ChatAgent.js
│       │   ├── Drafts.js
│       │   └── Analytics.js
│       └── services/
│           └── api.js
├── .gitignore
└── README.md
```

---

## 🐛 Troubleshooting

### Backend not starting?

```
rm -rf node_modules package-lock.json
npm install
```

### MongoDB errors?

✔ Check creds  
✔ IP whitelist  
✔ Correct `.env`

### Gemini API errors?

✔ Regenerate key  
✔ Ensure no extra spaces

---

## 🚀 Deployment

### **Backend – Render / Railway / Heroku**

```
cd backend
deploy platform-specific commands...
```

### **Frontend – Netlify / Vercel**

```
cd frontend
npm run build
deploy commands...
```

---

## 📚 Resources

- MongoDB Docs
- Express.js Docs
- React Docs
- Gemini API Docs
