from flask import Flask, render_template, send_from_directory, jsonify, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import os
from mutagen import File as MusicFile

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change this to a secure secret key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///music.db'
CORS(app)
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

SONG_DIR = "static/songs"

# User Model
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    playlists = db.relationship('Playlist', backref='user', lazy=True)

# Playlist Model
class Playlist(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    songs = db.relationship('PlaylistSong', backref='playlist', lazy=True)

# PlaylistSong Model
class PlaylistSong(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    playlist_id = db.Column(db.Integer, db.ForeignKey('playlist.id'), nullable=False)
    song_path = db.Column(db.String(200), nullable=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

def get_song_metadata(song_path):
    """Extract metadata from music file."""
    full_path = os.path.join(SONG_DIR, song_path)
    audio = MusicFile(full_path)
    metadata = {
        'title': song_path,
        'duration': round(audio.info.length) if audio else 0,
        'artist': '',
        'album': ''
    }
    
    if hasattr(audio, 'tags'):
        metadata['title'] = audio.tags.get('title', [song_path])[0]
        metadata['artist'] = audio.tags.get('artist', ['Unknown'])[0]
        metadata['album'] = audio.tags.get('album', ['Unknown'])[0]
    
    return metadata

@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html")

@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        
        if user and check_password_hash(user.password_hash, password):
            login_user(user)
            return redirect(url_for('index'))
        flash('Invalid username or password')
    return render_template('login.html')

@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        email = request.form.get('email')
        password = request.form.get('password')
        
        if User.query.filter_by(username=username).first():
            flash('Username already exists')
            return redirect(url_for('register'))
            
        user = User(
            username=username,
            email=email,
            password_hash=generate_password_hash(password)
        )
        db.session.add(user)
        db.session.commit()
        return redirect(url_for('login'))
    return render_template('register.html')

@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route("/songs")
def list_songs():
    """Returns a list of available songs with metadata."""
    songs = []
    for song in os.listdir(SONG_DIR):
        if song.endswith((".mp3", ".opus")):
            metadata = get_song_metadata(song)
            songs.append(metadata)
    return jsonify(songs)

@app.route("/stream/<song>")
def stream_song(song):
    """Streams the requested song file."""
    return send_from_directory(SONG_DIR, song)

@app.route("/playlists", methods=['GET', 'POST'])
@login_required
def playlists():
    if request.method == 'POST':
        name = request.form.get('name')
        playlist = Playlist(name=name, user_id=current_user.id)
        db.session.add(playlist)
        db.session.commit()
    return jsonify([{'id': p.id, 'name': p.name} for p in current_user.playlists])

@app.route("/playlist/<int:playlist_id>/songs", methods=['GET', 'POST'])
@login_required
def playlist_songs(playlist_id):
    playlist = Playlist.query.get_or_404(playlist_id)
    if request.method == 'POST':
        song_path = request.form.get('song_path')
        playlist_song = PlaylistSong(playlist_id=playlist_id, song_path=song_path)
        db.session.add(playlist_song)
        db.session.commit()
    return jsonify([song.song_path for song in playlist.songs])

@app.route("/settings", methods=['GET', 'POST'])
@login_required
def settings():
    if request.method == 'POST':
        current_user.email = request.form.get('email', current_user.email)
        if request.form.get('new_password'):
            current_user.password_hash = generate_password_hash(request.form.get('new_password'))
        db.session.commit()
        flash('Settings updated successfully')
    return render_template('settings.html')

@app.route("/contact", methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        # Here you would typically send an email or save the contact form data
        flash('Thank you for your message! We will get back to you soon.')
    return render_template('contact.html')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5000)

    