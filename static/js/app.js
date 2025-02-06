document.addEventListener('DOMContentLoaded', async () => {
    const audioPlayer = document.getElementById('audio-player');
    const songList = document.getElementById('song-list');
    const playPauseButton = document.getElementById('play-pause-button');
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const shuffleButton = document.getElementById('shuffle-button');
    const repeatButton = document.getElementById('repeat-button');
    const progressBar = document.getElementById('progress-bar');
    const volumeControl = document.getElementById('volume');
    const nowPlaying = document.getElementById('now-playing');

    let songs = [];
    let currentSongIndex = 0;
    let isShuffling = false;
    let isRepeating = false;

    async function fetchSongs() {
        try {
            const response = await fetch('/songs');
            songs = await response.json();

            songList.innerHTML = '';
            songs.forEach((song, index) => {
                const listItem = document.createElement('div');
                listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
                listItem.innerHTML = `
                    <span>${song.title}</span>
                    <button class="btn btn-sm btn-outline-primary play-btn" data-index="${index}">
                        <i class="fa fa-play"></i>
                    </button>
                `;
                songList.appendChild(listItem);
            });

            document.querySelectorAll('.play-btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    currentSongIndex = parseInt(e.target.closest('.play-btn').dataset.index);
                    playSong(currentSongIndex);
                });
            });
        } catch (error) {
            console.error('Error fetching songs:', error);
        }
    }

    function playSong(index) {
        const song = songs[index];
        if (!song) return;

        audioPlayer.src = `/stream/${song.title}`;
        audioPlayer.play();
        nowPlaying.textContent = `Playing: ${song.title}`;

        playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
    }

    function togglePlayPause() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playPauseButton.innerHTML = '<i class="fa fa-pause"></i>';
        } else {
            audioPlayer.pause();
            playPauseButton.innerHTML = '<i class="fa fa-play"></i>';
        }
    }

    function playNextSong() {
        if (isShuffling) {
            currentSongIndex = Math.floor(Math.random() * songs.length);
        } else {
            currentSongIndex = (currentSongIndex + 1) % songs.length;
        }
        playSong(currentSongIndex);
    }

    function playPreviousSong() {
        currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
        playSong(currentSongIndex);
    }

    function toggleShuffle() {
        isShuffling = !isShuffling;
        shuffleButton.classList.toggle('btn-dark', isShuffling);
    }

    function toggleRepeat() {
        isRepeating = !isRepeating;
        repeatButton.classList.toggle('btn-dark', isRepeating);
    }

    audioPlayer.addEventListener('ended', () => {
        if (isRepeating) {
            playSong(currentSongIndex);
        } else {
            playNextSong();
        }
    });

    playPauseButton.addEventListener('click', togglePlayPause);
    nextButton.addEventListener('click', playNextSong);
    prevButton.addEventListener('click', playPreviousSong);
    shuffleButton.addEventListener('click', toggleShuffle);
    repeatButton.addEventListener('click', toggleRepeat);

    volumeControl.addEventListener('input', (e) => {
        audioPlayer.volume = e.target.value;
    });

    audioPlayer.addEventListener('timeupdate', () => {
        if (audioPlayer.duration) {
            progressBar.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        }
    });

    fetchSongs();
});
