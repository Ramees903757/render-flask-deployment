# app.py (Flask Backend)

from flask import Flask, request, jsonify
import pickle
import pandas as pd
from flask_cors import CORS
import requests
import os
from pathlib import Path
import numpy as np
import json
from functools import lru_cache
import concurrent.futures
import time
import logging
from flask.json.provider import DefaultJSONProvider

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Use custom JSON encoder for numpy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer, np.floating, np.bool_)):
            return int(obj) if isinstance(obj, np.integer) else float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super().default(obj)

class CustomJSONProvider(DefaultJSONProvider):
    def dumps(self, obj, **kwargs):
        return super().dumps(obj, cls=NumpyEncoder, **kwargs)

    def loads(self, s, **kwargs):
        return super().loads(s, **kwargs)

app.json = CustomJSONProvider(app)

# Configuration
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = os.path.join(BASE_DIR, 'model')
TMDB_API_KEY = '8265bd1679663a7ea12ac168da84d2e8'

# Load data
movies = pd.read_pickle(os.path.join(MODEL_DIR, 'movies.pkl'))
with open(os.path.join(MODEL_DIR, 'similarity.pkl'), 'rb') as f:
    similarity = pickle.load(f)

@lru_cache(maxsize=1000)
def fetch_poster(title):
    try:
        search_url = f"https://api.themoviedb.org/3/search/movie?api_key={TMDB_API_KEY}&query={title}"
        search_data = requests.get(search_url, timeout=2).json()

        if search_data.get('results'):
            movie_id = search_data['results'][0]['id']
            movie_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key={TMDB_API_KEY}"
            movie_data = requests.get(movie_url, timeout=2).json()

            if movie_data.get('poster_path'):
                return f"https://image.tmdb.org/t/p/w500{movie_data['poster_path']}"
            else:
                return "https://via.placeholder.com/300x450?text=No+Poster"
            
    except Exception as e:
        print(f"Poster error for {title}: {str(e)[:100]}")

    # Always return fallback if there's an error or no poster
    return "https://via.placeholder.com/300x450?text=No+Poster"



def fetch_posters_parallel(titles):
    with concurrent.futures.ThreadPoolExecutor() as executor:
        return list(executor.map(fetch_poster, titles))

def warmup_cache():
    popular_titles = movies.head(12)['title'].tolist()
    fetch_posters_parallel(popular_titles)

warmup_cache()

@app.route('/popular_movies', methods=['GET'])
def get_popular_movies():
    try:
        popular = movies.head(12)
        posters = fetch_posters_parallel(popular['title'].tolist())
        return jsonify([{
            'title': row['title'],
            'id': int(row['id']),
            'poster': poster
        } for row, poster in zip(popular.to_dict('records'), posters)])
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/movies', methods=['GET'])
def get_movies():
    return jsonify(movies['title'].tolist())

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    if not data or 'title' not in data:
        return jsonify({'error': 'Invalid request format'}), 400

    title = data['title'].strip()
    if not title:
        return jsonify({'error': 'Movie title is required'}), 400

    try:
        matches = movies[movies['title'].str.lower() == title.lower()]
        if matches.empty:
            return jsonify({'error': f'Movie "{title}" not found'}), 404

        idx = matches.index[0]
        sim_scores = list(enumerate(similarity[idx]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)[1:6]

        recommendations = []
        for i, score in sim_scores:
            movie = movies.iloc[i]
            recommendations.append({
                'title': str(movie['title']),
                'id': int(movie['id']),
                'poster': fetch_poster(movie['title']),
                'similarity_score': float(score)
            })

        return jsonify({
            'selected_movie': {
                'title': title,
                'id': int(matches.iloc[0]['id']),
                'poster': fetch_poster(title)
            },
            'recommendations': recommendations
        })

    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000, threaded=True)
