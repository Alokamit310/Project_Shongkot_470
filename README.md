# 🌊 Shonkot

## AI-Powered Flood Crisis Intelligence Platform for Bangladesh

Shonkot is a centralized, AI-powered flood crisis intelligence platform designed to improve flood prediction, emergency response, communication, and resource coordination in Bangladesh.

The platform integrates real-time weather data, AI-based flood risk prediction, district-level monitoring, incident reporting, hospital recommendations, and authority-to-citizen emergency communication into a unified system.

---
## 👨‍💻 Development Team

| Name             | Role      | GitHub                                           |
| ---------------- | --------- | ------------------------------------------------ |
| Alok Sarker Amit | Developer | [GitHub Profile](https://github.com/Alokamit310) |
| Sumaiya Akhter Moon     | Developer | [ GitHub Profile](https://github.com/moon0391)                               |
| khandaker khairul Alam Himel    | Developer | [GitHub Profile](https://github.com/HimelKhandaker)                               |
| Mustakim Bin Ahmed    | Developer | [Add GitHub Profile](https://github.com/Safibaee)                               |



## 🎯 Project Objective

Bangladesh frequently faces severe flooding, which affects millions of people and creates major challenges in emergency response and resource management.

Shonkot aims to address these challenges by:

* Predicting flood risk using AI and environmental data
* Monitoring real-time weather conditions
* Providing district-wise flood risk information
* Connecting citizens with emergency services
* Helping authorities manage incidents efficiently
* Recommending nearby hospitals during emergencies
* Enabling fast and targeted emergency broadcasts
* Centralizing flood-related information in one platform

---

## ✨ Key Features

### 🤖 AI-Powered Flood Risk Prediction

Predicts flood risk levels using environmental and weather-related data.

### 🌦️ Live Weather Data Integration

Automatically fetches real-time weather data including:

* Rainfall
* Temperature
* Humidity
* Weather conditions

Weather data is periodically updated using scheduled background tasks.

### 🗺️ District-Wise Flood Risk Map

Provides a visual map of Bangladesh showing flood risk levels for different districts.

### 📊 District Information Dashboard

Each district has a dedicated dashboard containing:

* Current flood risk level
* Live weather information
* Nearby hospitals
* Active incidents
* Recent emergency broadcasts

### 🚨 Incident Reporting and Management

Citizens can report flood-related incidents, while authorities can monitor, update, and manage those incidents.

### 🏥 Smart Hospital Recommendation

Recommends nearby hospitals based on the user's location and emergency requirements.

### 📢 Emergency Broadcast System

Authorities can send targeted emergency messages to specific districts or affected areas.

### 📜 Broadcast History

Maintains a complete record of previously sent broadcasts, including:

* Message content
* Sender
* Target district
* Timestamp

### 🔔 Notifications

Users receive relevant updates about:

* Flood risks
* Emergency incidents
* Authority broadcasts
* Important weather conditions

### 👥 Role-Based Access Control

The system supports different user roles:

* **Citizen**
* **Authority**
* **Administrator**

Each role has access to different functionalities.

---

## 🏗️ System Architecture

Shonkot follows a modular full-stack architecture.

```text
┌─────────────────────────────────────────────┐
│                 Frontend                    │
│              React.js + Vite                │
└──────────────────────┬──────────────────────┘
                       │ REST API
                       ▼
┌─────────────────────────────────────────────┐
│                  Backend                    │
│           Node.js + Express.js              │
│                  MVC Pattern                │
└───────────────┬─────────────┬───────────────┘
                │             │
                ▼             ▼
       ┌──────────────┐  ┌──────────────┐
       │ MongoDB Atlas│  │ External APIs│
       │   Database   │  │ Weather Data │
       └──────────────┘  └──────────────┘
                │
                ▼
       ┌────────────────────┐
       │   AI Prediction    │
       │ Python + FastAPI   │
       │ Machine Learning   │
       └────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* JavaScript
* HTML5
* CSS3
* Leaflet.js
* Chart.js

### Backend

* Node.js
* Express.js
* REST API
* MVC Architecture
* JWT Authentication

### Database

* MongoDB Atlas
* Mongoose ODM

### AI and Machine Learning

* Python
* FastAPI
* Scikit-learn
* Random Forest

### External Services

* Open-Meteo API
* Map Services

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

## 📁 Project Structure

```text
Project_Shongkot_470/
│
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── .env
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
│
├── ai-service/
│   ├── models/
│   ├── routes/
│   ├── services/
│   └── main.py
│
├── .gitignore
├── README.md
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Alokamit310/Project_Shongkot_470.git
```

```bash
cd Project_Shongkot_470
```

---

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

---

### 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

⚠️ Never commit `.env` files to GitHub.

---

### 4. Start the Backend

```bash
npm run dev
```

The backend server will run on:

```text
http://localhost:5000
```

---

### 5. Install Frontend Dependencies

Open a new terminal:

```bash
cd frontend
npm install
```

---

### 6. Start the Frontend

```bash
npm run dev
```

The frontend will run on the Vite development server.

---

## 🔐 Environment Variables

The following variables are required for the project:

| Variable     | Description                     |
| ------------ | ------------------------------- |
| `PORT`       | Backend server port             |
| `MONGO_URI`  | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for authentication   |

Never upload sensitive credentials, passwords, API keys, or database connection strings to GitHub.

---

## 🌿 Git Branching Strategy

The `master` branch contains the stable version of the project.

Each team member should work on a separate feature branch.

```text
master
│
├── feature/weather-integration
├── feature/district-dashboard
├── feature/incident-management
└── feature/broadcast-system
```

### Recommended Workflow

```bash
git checkout master
git pull origin master
```

Create a new feature branch:

```bash
git checkout -b feature/your-feature-name
```

After completing your work:

```bash
git add .
git commit -m "Describe your changes"
git push -u origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

---

## 🤝 Contribution Guidelines

1. Always pull the latest changes before starting new work.
2. Never directly push unfinished features to `master`.
3. Create a separate branch for each feature.
4. Write meaningful commit messages.
5. Test your code before creating a Pull Request.
6. Do not commit `.env` files or sensitive credentials.
7. Communicate with the team before modifying shared core files.
8. Review Pull Requests before merging into `master`.

---


---

## 📌 Project Status

🚧 **Currently Under Development**

The project is being developed as part of a Software Engineering Project.

---

## 📄 License

This project is developed for academic and educational purposes.
