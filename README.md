# CUET Medico

A web-based mental health support platform for Chittagong University of Engineering & Technology (CUET). Students can book appointments with on-campus doctors, take interactive mental health screenings, chat in real-time, and receive AI-powered analysis using LIME-based explainable ML.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Three.js, Framer Motion |
| Backend | Express.js, Socket.io, MongoDB (native driver) |
| Auth | Firebase Authentication |
| ML Service | Flask, scikit-learn, LIME |

## Prerequisites

- **Node.js** >= 18
- **Python** >= 3.9 (for ML service)
- **MongoDB Atlas** account (or local MongoDB)
- **Firebase** project with Email/Password auth enabled

## Project Structure

```
CUET_Medico/
├── src/                  # React frontend
│   ├── components/       # Reusable components (charts, chat, screening, ml-analysis)
│   ├── pages/            # Page components (dashboard, doctor, student)
│   ├── firebase/         # Firebase config
│   └── constants/        # Shared constants
├── server/               # Express backend
│   ├── index.js          # API routes + Socket.io server
│   └── seed.js           # Database seeder
├── ml-service/           # Python ML service
│   ├── app.py            # Flask API (LIME explanations)
│   ├── train_model.py    # Model training script
│   └── models/           # Trained model artifacts
└── .env                  # Environment variables (not committed)
```

## Setup

### 1. Clone the repository

```bash
git clone git@github.com:SM-Shaan/CUET_Medico.git
cd CUET_Medico
```

### 2. Environment variables

Create a `.env` file in the project root:

```env
DB_USER_S=<your-mongodb-username>
DB_PASSWORD_S=<your-mongodb-password>
```

### 3. Firebase configuration

Update `src/firebase/firebase.js` with your Firebase project credentials. Enable **Email/Password** sign-in in the Firebase Console under Authentication > Sign-in method.

### 4. Install dependencies

```bash
# Frontend
npm install

# Backend
cd server
npm install
cd ..
```

### 5. Seed the database (optional)

Populates sample doctors, students, appointments, and chat sessions:

```bash
cd server
node seed.js
cd ..
```

### 6. Set up the ML service

```bash
cd ml-service
pip install -r requirements.txt

# Train the model (only needed once)
python train_model.py

# Start the Flask API (runs on port 5001)
python app.py
```

### 7. Start the application

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd server
node index.js

# Terminal 2 — Frontend (port 5173)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Features

- **Role-based dashboards** — Separate views for Admin, Doctor, and Student with Recharts analytics
- **Appointment booking** — Students select a doctor, date, and time slot
- **Real-time chat** — Socket.io powered doctor-patient messaging
- **Mental health screening** — 10-round interactive, game-based pre-appointment assessment featuring:
  - **Round 1 (Mood)**: Mood Color Picker & Mood Mixer (color psychology & emotional potion blending)
  - **Round 2 (Emotions)**: Emotion Word Cloud & Feeling Sorter (Tinder-style swipe emotion mechanics)
  - **Round 3 (Reflex & Attention)**: Reaction Time Test & Focus Catcher (cognitive response and sustained attention)
  - **Round 4 (Memory)**: Memory Pattern Game & Pathfinder Maze (working and spatial memory)
  - **Round 5 (Assessment)**: Free Text Quiz & Scenario Cards (gamified clinical daily-life scenarios)
  - **Results**: Dynamic Actionable Insights (immediate self-care & appointment recommendations based on composite risk)
- **AI text analysis** — LIME-based explainable classification of mental health text
- **3D visualization** — Interactive word importance plot with Three.js
- **Dashboard analytics** — Charts for appointments, screenings, and statistics

## Default Ports

| Service | Port |
|---------|------|
| Frontend (Vite) | 5173 |
| Backend (Express) | 5000 |
| ML Service (Flask) | 5001 |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature-name`)
5. Open a Pull Request
