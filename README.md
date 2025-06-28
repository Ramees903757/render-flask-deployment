# 🎬 Movie Recommendation Engine

A simple full-stack movie recommendation system that suggests similar movies using content-based filtering. Built with **React** (frontend) and **Flask** (backend), powered by a precomputed similarity model and enriched with **TMDB** poster images.

---

## 📸 Screenshots

### 🔍 Search + Selected Movie
![Search Screenshot](Screenshot-2025-06-27-190030.png)

### 🎥 Recommended Movies
![Recommendation Screenshot](Screenshot-2025-06-27-190050.png)

---

## 🚀 Features

- Movie recommendation system (content-based)
- Fetches posters using the TMDB API
- React-based modern UI
- Backend powered by Flask & Pandas
- Caches similarity data with pre-trained `.pkl` file

---

## ⚙️ How to Run Locally

### 🔧 Prerequisites

- Python 3.8+
- Node.js & npm
- A TMDB API Key (free to generate from [https://www.themoviedb.org/](https://www.themoviedb.org/))

---

### 🧠 Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate      # On Windows
source venv/bin/activate   # On macOS/Linux

pip install -r requirements.txt

# Create a `.env` file and add your TMDB API key
echo TMDB_API_KEY=your_actual_key_here > .env

# Start the Flask backend
python app.py

🌐 Frontend Setup
cd frontend
npm install
npm start

App runs at: http://localhost:3000
Backend must run at: http://localhost:5000

📦 File Structure
├── backend/
│   ├── app.py
│   ├── model/
│   │   └── similarity.pkl
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── Search.png
├── Recommend.png
└── README.md

❗ TMDB API Issues on Jio Network
⚠️ If you're using Jio network (mobile or JioFiber), the TMDB image API may not load posters properly due to connectivity issues.
This is a known network-level problem — please try switching to another WiFi provider (like Airtel, BSNL, etc.) if you experience missing images.

🧾 Requirements
Here's what's in backend/requirements.txt:

flask
flask-cors
numpy
pandas
scikit-learn
requests
python-dotenv

📌 Notes
Ensure .env is listed in .gitignore

Never share your TMDB API key publicly

Restart the backend after any .env or model file changes

📬 Contributions
Feel free to fork, improve or open issues!
