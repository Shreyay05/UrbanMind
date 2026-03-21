# UrbanMind – Smart Complaint Management System

## Overview
**Civic Policy** is a digital platform that enables citizens to register civic complaints related to government departments (such as Health, Sanitation, Infrastructure, etc.) and automatically classifies these complaints based on their nature and urgency.

The platform integrates a modern frontend, backend API, database, and an AI module to provide a complete end-to-end complaint management system.

---

## Objectives
- Enable citizens to easily submit complaints  
- Automatically classify complaints using AI  
- Detect urgency and prioritize issues  
- Provide a centralized system for tracking complaints  

---

## Features

### Complaint Registration
- Submit complaints via text input  
- Optional image upload support  
- Location tagging for complaints  

### AI-Based Classification
- Automatically detects:
  - Complaint category  
  - Priority level (Low / Medium / High)  

### Multilingual & Voice Support 
- Support for multiple languages (English, Hindi, Malayalam)  
- Voice-based complaint submission (Speech-to-Text)  

### Map Visualization
- View complaints geographically using an interactive map  
- Hover to view complaint reference IDs

### Complaint Tracking
- Track complaint status using a reference ID  

---

## Tech Stack

### Frontend
- React.js  
- Axios (API calls)  
- Tailwind CSS  
- Leaflet.js (Map visualization)  

### Backend
- Node.js (Express.js)  
- MongoDB (Database)  
- CORS enabled  

### AI Module
- Python (FastAPI)  
- Scikit-learn  
- Sentence Transformers (BERT-based embeddings)  

---

## System Architecture

Frontend (React) -> Backend API (Node.js) -> Database (MongoDB) -> AI Module (FastAPI)


---

## Workflow

1. User submits a complaint through the frontend  
2. Frontend sends request to backend (`/api/complaints`)  
3. Backend forwards complaint text to AI module  
4. AI module:
   - Classifies category  
   - Determines priority  
5. Backend stores complaint in database  
6. Frontend displays classification results  

---

## Installation & Setup

### Clone the repository
```bash
git clone <your-repo-url>
cd UrbanMind
```

### Setup Backend
```bash
cd backend
npm install
```

Create .env file in backend:
MONGO_URI=mongodb://127.0.0.1:27017/urbanmind
PORT=5000

# Start backend server
```bash
node server.js
```

### Setup Frontend
```bash
cd scia-frontend

npm install

# Install dependencies
npm install axios leaflet react-leaflet
npm install react-router-dom
npm install recharts

# Tailwind setup
npm install -D tailwindcss @tailwindcss/vite
npm install autoprefixer postcss tailwindcss

# Run frontend
npm run dev
```

### Setup AI Module
```bash
cd AI-module

python3 -m venv venv
```

## Activate environment:

# Windows:

```bash
venv\Scripts\activate
```

# Mac/Linux:

```bash
source venv/bin/activate
pip install -r requirements.txt
```

# Run AI server
```bash
uvicorn app:app --reload --port 8000
```

### Set up Database
## Windows
Step 1: Install MongoDB
Go to: https://www.mongodb.com/try/download/community
Select:
  Platform: Windows
  Package: .msi
Download and run installer

Step 2: Install with Recommended Settings
Choose Complete Setup
Enable:
  "Install MongoDB as a Service"
  "Run service as Network Service user"
  "Install MongoDB Compass"

Step 3: Verify Installation
Open MongoDB Compass
Connect using:
  mongodb://localhost:27017
If you see databases like admin, config, local → success

## macOS
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

Verify Installation
```bash
mongodb://localhost:27017
```

### Database Schema
complaints:
- id
- text
- category
- priority
- location
- citizen name
- status
- latitude
- longitude
- createdAt
- updatedAt
- adminReply
- closedAt

### Run the Full Application

## Open 3 terminals:

# Terminal 1 (Backend)
```bash
cd backend
node server.js
```

# Terminal 2 (Frontend)
```bash
cd scia-frontend
npm run dev
```

# Terminal 3 (AI Module)
```bash
cd AI-module
venv\Scripts\activate   # or source venv/bin/activate
uvicorn app:app --reload --port 8000
```
