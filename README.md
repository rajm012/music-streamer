# Flask Music Player 🎵

A web-based music streaming application built using **Flask**, **Bootstrap**, and **JavaScript**. It allows users to create playlists, and control playback with a simple and intuitive interface.

---

## Features ✨
- 🎶 **List of Songs**: Displays all available songs in a user-friendly list.
- ▶️ **Music Player**: Play/Pause, Next, Previous, Shuffle, and Repeat buttons.
- 🎛 **Progress & Volume Control**: Adjust playback position and volume.
- 📂 **Playlists**: Create and manage your playlists.
- 🔊 **Responsive UI**: Works across different screen sizes.

---

## Installation & Setup 🚀

### 1. Clone the Repository
```bash
git clone https://github.com/rajm012/music-streamer.git
cd music-streamer
```

### 2. Create a Virtual Environment (Recommended)
```bash
python -m venv venv
source venv/bin/activate   # On macOS/Linux
venv\Scripts\activate     # On Windows
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Setup the Database
```bash
python -c 'from app import db; db.create_all()'
```

### 5. Add Music Files 🎵
Place your `.mp3` or `.opus` files inside the `static/songs/` directory.

### 6. Run the Flask App
```bash
python app.py
```

The app will start running on `http://127.0.0.1:5000/` 🎧

---

## Project Structure 📂
```bash
flask-music-player/
│── static/
│   ├── css/styles.css  # Stylesheets
│   ├── js/app.js       # Frontend logic
│   ├── songs/          # Your music files
│── templates/
│   ├── index.html      # Main UI layout
│── app.py              # Flask backend
│── requirements.txt    # Dependencies
│── README.md           # Project documentation
```

---

## API Endpoints 📡
| Endpoint          | Method | Description               |
|------------------|--------|---------------------------|
| `/`              | GET    | Load the main UI page     |
| `/songs`         | GET    | Fetch all available songs |
| `/stream/<song>` | GET    | Stream a selected song    |
| `/playlists`     | GET/POST | Manage user playlists  |

---

## Troubleshooting 🛠
### 1. **App crashes on startup?**
- Ensure you have all dependencies installed: `pip install -r requirements.txt`
- Check Python version (`>= 3.7` recommended).

### 2. **Songs not appearing in the list?**
- Make sure your songs are placed in the `static/songs/` folder.
- Restart the server after adding new songs.

### 3. **No sound when playing a song?**
- Check if the song files are accessible via `/stream/songname.mp3`.
- Verify browser console logs for any errors.

---

## Contributing 🤝
1. Fork the repository 🍴
2. Create a new branch (`git checkout -b feature-branch`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to your fork (`git push origin feature-branch`)
5. Open a Pull Request 🚀

In future may be adding the login/signup along with search for songs along pirated sites and many more.

---

## License 📜
This project is licensed under the MIT License. Feel free to use and modify it as needed.
