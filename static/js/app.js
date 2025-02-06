document.addEventListener('DOMContentLoaded', () => {
    
    const elements = {
        audioPlayer: document.getElementById('audio-player'),
        songList: document.getElementById('song-list'),
        playlistContainer: document.getElementById('playlists'),
        nowPlaying: document.getElementById('now-playing'),
        progressBar: document.getElementById('progress-bar'),
        currentTime: document.getElementById('current-time'),
        duration: document.getElementById('duration'),
        volumeControl: document.getElementById('volume'),
        playPauseButton: document.getElementById('play-pause-button'),
        prevButton: document.getElementById('prev-button'),
        nextButton: document.getElementById('next-button'),
        createPlaylistBtn: document.getElementById('create-playlist-btn')
    };

    // Validate required elements with kebab-case IDs
    const requiredElementIds = ['audio-player', 'song-list', 'now-playing'];
    for (const elementId of requiredElementIds) {
        if (!document.getElementById(elementId)) {
            console.error(`Required element with ID '${elementId}' not found.`);
            return;
        }
    }

    let currentPlaylist = [];
    let currentSongIndex = 0;
    let isPlaying = false;

    // Play/Pause Button Handler
    if (elements.playPauseButton) {
        elements.playPauseButton.addEventListener('click', togglePlayPause);
    }

    // Previous Button Handler
    if (elements.prevButton) {
        elements.prevButton.addEventListener('click', playPreviousSong);
    }

    // Next Button Handler
    if (elements.nextButton) {
        elements.nextButton.addEventListener('click', playNextSong);
    }

    // Volume Control
    if (elements.volumeControl) {
        elements.volumeControl.addEventListener('input', (e) => {
            if (elements.audioPlayer) {
                elements.audioPlayer.volume = e.target.value;
            }
        });
    }

    // Progress Bar
    if (elements.progressBar && elements.audioPlayer) {
        elements.progressBar.addEventListener('input', (e) => {
            const time = (elements.audioPlayer.duration * e.target.value) / 100;
            elements.audioPlayer.currentTime = time;
        });
    }

    function togglePlayPause() {
        if (elements.audioPlayer.paused) {
            elements.audioPlayer.play();
            elements.playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
        } else {
            elements.audioPlayer.pause();
            elements.playPauseButton.innerHTML = '<i class="bi bi-play-fill"></i>';
        }
    }

    function playNextSong() {
        if (currentPlaylist.length > 0) {
            currentSongIndex = (currentSongIndex + 1) % currentPlaylist.length;
            playSong(currentSongIndex);
        }
    }

    function playPreviousSong() {
        if (currentPlaylist.length > 0) {
            currentSongIndex = (currentSongIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
            playSong(currentSongIndex);
        }
    }

    function updateNowPlaying(song) {
        if (elements.nowPlaying) {
            elements.nowPlaying.innerHTML = `
                <div class="now-playing-info">
                    <h4>${song.title}</h4>
                    <p>${song.artist} - ${song.album}</p>
                </div>
            `;
        }
    }

    function playSong(index) {
        const song = currentPlaylist[index];
        if (elements.audioPlayer && song) {
            elements.audioPlayer.src = `/stream/${song.title}`;
            elements.audioPlayer.play()
                .then(() => {
                    currentSongIndex = index;
                    updateNowPlaying(song);
                    if (elements.playPauseButton) {
                        elements.playPauseButton.innerHTML = '<i class="bi bi-pause-fill"></i>';
                    }
                })
                .catch(error => console.error('Error playing song:', error));
        }
    }

    function attachSongEventListeners() {
        const playButtons = document.querySelectorAll('.play-btn');
        playButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.closest('.play-btn').dataset.index);
                playSong(index);
            });
        });
    }

    // Fetch and display songs with metadata
    async function fetchSongs() {
        try {
            const response = await fetch('/songs');
            const songs = await response.json();
            
            if (elements.songList) {
                elements.songList.innerHTML = '';
                songs.forEach((song, index) => {
                    const listItem = document.createElement('div');
                    listItem.className = 'song-item p-3 border-bottom';
                    listItem.innerHTML = `
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="song-info">
                                <h5 class="mb-0">${song.title}</h5>
                                <small class="text-muted">${song.artist} - ${song.album}</small>
                            </div>
                            <div class="song-controls">
                                <button class="btn btn-sm btn-outline-primary play-btn" data-index="${index}">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-secondary add-to-playlist-btn">
                                    <i class="bi bi-plus"></i>
                                </button>
                            </div>
                        </div>
                    `;
                    elements.songList.appendChild(listItem);
                });
                
                currentPlaylist = songs;
                attachSongEventListeners();
            }
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    }

    // Audio player event listeners
    if (elements.audioPlayer) {
        elements.audioPlayer.addEventListener('timeupdate', () => {
            if (elements.progressBar && elements.currentTime) {
                const progress = (elements.audioPlayer.currentTime / elements.audioPlayer.duration) * 100;
                elements.progressBar.value = progress;
                elements.currentTime.textContent = formatTime(elements.audioPlayer.currentTime);
            }
        });

        elements.audioPlayer.addEventListener('loadedmetadata', () => {
            if (elements.duration) {
                elements.duration.textContent = formatTime(elements.audioPlayer.duration);
            }
        });

        elements.audioPlayer.addEventListener('ended', playNextSong);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // Initialize
    fetchSongs();
});