# Civic Policy – Smart Complaint Management System

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

### 🧾 Complaint Registration
- Submit complaints via text input  
- Optional image upload support  
- Location tagging for complaints  

### AI-Based Classification
- Automatically detects:
  - Complaint category  
  - Priority level (Low / Medium / High)  

### Multilingual & Voice Support (Planned)
- Support for multiple languages (English, Hindi, Malayalam)  
- Voice-based complaint submission (Speech-to-Text)  

### Map Visualization
- View complaints geographically using an interactive map  
- Hover to view complaint details  

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

Frontend (React)
↓
Backend API (Node.js)
↓
Database (MongoDB)
↓
AI Module (FastAPI)


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

## Project Structure
UrbanMind/
│
├── scia-frontend/ # React frontend
├── backend/ # Node.js backend
├── AI-module/ # FastAPI AI service
│
├── package.json
├── requirements.txt
└── README.md


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
npm start
```

### Setup Frontend
```bash
cd scia-frontend
npm install
npm run dev
```

### Setup AI Module
```bash
cd AI-module
python3 -m venv venv
source venv/bin/activate

python3 -m uvicorn app:app --reload
```

### Database Schema
complaints:
- id
- text
- category
- priority
- location
- status
