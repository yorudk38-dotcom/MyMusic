app.js
// ======================================================
// MYMUSIC - YOUTUBE MUSIC PLAYER
// ======================================================

// ======================================================
// DATA
// ======================================================

let songs = JSON.parse(
    localStorage.getItem("mymusic_songs") || "[]"
);

let currentIndex = -1;
let youtubePlayer = null;
let youtubeReady = false;

let isShuffle = false;
let isRepeat = false;

let lyrics = [];
let activeLyricIndex = -1;


// ======================================================
// DOM
// ======================================================

const $ = (id) => document.getElementById(id);


// Pages
const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-button");

// Home
const musicGrid = $("musicGrid");
const emptyState = $("emptyState");
const viewAllButton = $("viewAllButton");

// Search
const searchInput = $("searchInput");
const searchResults = $("searchResults");

// Library
const libraryList = $("libraryList");
const libraryCount = $("libraryCount");

// Modal
const uploadModal = $("uploadModal");
const openUploadButton = $("openUploadButton");
const heroAddButton = $("heroAddButton");
const emptyAddButton = $("emptyAddButton");
const closeUploadButton = $("closeUploadButton");
const musicForm = $("musicForm");

const youtubeUrlInput = $("youtubeUrl");
const songTitleInput = $("songTitle");
const songArtistInput = $("songArtist");

const lyricsFile = $("lyricsFile");
const lyricsFileName = $("lyricsFileName");

// Player
const playerCover = $("playerCover");
const playerTitle = $("playerTitle");
const playerArtist = $("playerArtist");

const playButton = $("playButton");
const previousButton = $("previousButton");
const nextButton = $("nextButton");

const shuffleButton = $("shuffleButton");
const repeatButton = $("repeatButton");

const progressBar = $("progressBar");
const currentTime = $("currentTime");
const duration = $("duration");

const volumeBar = $("volumeBar");

// Lyrics
const lyricsDrawer = $("lyricsDrawer");
const lyricsButton = $("lyricsButton");
const closeLyricsButton = $("closeLyricsButton");

const lyricsCover = $("lyricsCover");
const lyricsTitle = $("lyricsTitle");
const lyricsArtist = $("lyricsArtist");
const lyricsContent = $("lyricsContent");


// ======================================================
// DEFAULT COVER
// ======================================================

const DEFAULT_COVER =
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=700";


// ======================================================
// SAVE DATA
// ======================================================

function saveSongs() {

    localStorage.setItem(
        "mymusic_songs",
        JSON.stringify(songs)
    );

}


// ======================================================
// YOUTUBE VIDEO ID
// ======================================================

function getYouTubeId(url) {

    if (!url) {
        return null;
    }

    url = url.trim();

    try {

        const parsed = new URL(url);

        // youtube.com/watch?v=XXXX
        if (
            parsed.hostname.includes("youtube.com") &&
            parsed.searchParams.get("v")
        ) {

            return parsed.searchParams.get("v");

        }

        // youtu.be/XXXX
        if (
            parsed.hostname === "youtu.be"
        ) {

            return parsed.pathname
                .replace("/", "")
                .split("/")[0];

        }

        // youtube.com/shorts/XXXX
        if (
            parsed.hostname.includes("youtube.com") &&
            parsed.pathname.startsWith("/shorts/")
        ) {

            return parsed.pathname
                .split("/")[2];

        }

        // youtube.com/embed/XXXX
        if (
            parsed.hostname.includes("youtube.com") &&
            parsed.pathname.startsWith("/embed/")
        ) {

            return parsed.pathname
                .split("/")[2];

        }

        // youtube.com/live/XXXX
        if (
            parsed.hostname.includes("youtube.com") &&
            parsed.pathname.startsWith("/live/")
        ) {

            return parsed.pathname
                .split("/")[2];

        }

    } catch (error) {

        console.error(
            "URL YouTube tidak valid:",
            error
        );

    }

    return null;
}


// ======================================================
// YOUTUBE THUMBNAIL
// ======================================================

function getYouTubeThumbnail(videoId) {

    return (
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    );

}


// ======================================================
// YOUTUBE API
// ======================================================

window.onYouTubeIframeAPIReady = function () {

    console.log(
        "YouTube API berhasil dimuat."
    );

    youtubePlayer = new YT.Player(
        "youtubePlayer",
        {

            width: "200",
            height: "200",

            playerVars: {

                autoplay: 0,
                controls: 0,
                rel: 0,
                playsinline: 1

            },

            events: {

                onReady: handleYouTubeReady,

                onStateChange:
                    handleYouTubeStateChange,

                onError:
                    handleYouTubeError

            }

        }
    );

};


// ======================================================
// YOUTUBE READY
// ======================================================

function handleYouTubeReady(event) {

    youtubeReady = true;

    event.target.setVolume(
        Number(volumeBar.value)
    );

    console.log(
        "YouTube player ready."
    );

}


// ======================================================
// YOUTUBE STATE
// ======================================================

function handleYouTubeStateChange(event) {

    if (!youtubeReady) {
        return;
    }

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        setPlayIcon(true);

    }


    if (
        event.data ===
        YT.PlayerState.PAUSED
    ) {

        setPlayIcon(false);

    }


    if (
        event.data ===
        YT.PlayerState.ENDED
    ) {

        if (isRepeat) {

            youtubePlayer.seekTo(
                0,
                true
            );

            youtubePlayer.playVideo();

        } else {

            playNext();

        }

    }

}


// ======================================================
// YOUTUBE ERROR
// ======================================================

function handleYouTubeError(event) {

    console.error(
        "YouTube Error:",
        event.data
    );

    setPlayIcon(false);

    alert(
        "Lagu ini tidak dapat diputar melalui YouTube."
    );

}


// ======================================================
// MODAL
// ======================================================

function openModal() {

    uploadModal.classList.add(
        "show"
    );

}


function closeModal() {

    uploadModal.classList.remove(
        "show"
    );

}


if (openUploadButton) {

    openUploadButton.addEventListener(
        "click",
        openModal
    );

}


if (heroAddButton) {

    heroAddButton.addEventListener(
        "click",
        openModal
    );

}


if (emptyAddButton) {

    emptyAddButton.addEventListener(
        "click",
        openModal
    );

}


if (closeUploadButton) {

    closeUploadButton.addEventListener(
        "click",
        closeModal
    );

}


const modalBackdrop =
    uploadModal?.querySelector(
        ".modal-backdrop"
    );


if (modalBackdrop) {

    modalBackdrop.addEventListener(
        "click",
        closeModal
    );

}


// ======================================================
// LRC FILE
// ======================================================

if (lyricsFile) {

    lyricsFile.addEventListener(
        "change",
        () => {

            if (
                lyricsFile.files &&
                lyricsFile.files.length > 0
            ) {

                lyricsFileName.textContent =
                    lyricsFile.files[0].name;

            } else {

                lyricsFileName.textContent =
                    "Choose .lrc file";

            }

        }
    );

}


// ======================================================
// ADD SONG
// ======================================================

if (musicForm) {

    musicForm.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();

            const url =
                youtubeUrlInput.value.trim();

            const videoId =
                getYouTubeId(url);

            if (!videoId) {

                alert(
                    "Link YouTube tidak valid."
                );

                return;

            }


            const title =
                songTitleInput.value.trim();


            if (!title) {

                alert(
                    "Masukkan judul lagu."
                );

                return;

            }


            const artist =
                songArtistInput.value.trim()
                || "Unknown Artist";


            let lrcText = "";


            if (
                lyricsFile.files &&
                lyricsFile.files.length > 0
            ) {

                try {

                    lrcText =
                        await lyricsFile
                            .files[0]
                            .text();

                } catch (error) {

                    console.error(
                        error
                    );

                }

            }


            const newSong = {

                id:
                    Date.now(),

                youtubeId:
                    videoId,

                title:
                    title,

                artist:
                    artist,

                cover:
                    getYouTubeThumbnail(
                        videoId
                    ),

                lyrics:
                    lrcText

            };


            songs.unshift(
                newSong
            );


            saveSongs();


            renderAll();


            closeModal();


            musicForm.reset();


            if (lyricsFileName) {

                lyricsFileName.textContent =
                    "Choose .lrc file";

            }


            // Play lagu yang baru ditambahkan
            playSong(0);

        }
    );

}


// ======================================================
// RENDER ALL
// ======================================================

function renderAll() {

    renderHome();

    renderLibrary();

    renderSearch(
        searchInput?.value || ""
    );

}


// ======================================================
// RENDER HOME
// ======================================================

function renderHome() {

    if (!musicGrid) {
        return;
    }

    musicGrid.innerHTML = "";


    if (songs.length === 0) {

        emptyState?.classList.add(
            "show"
        );

        return;

    }


    emptyState?.classList.remove(
        "show"
    );


    songs.slice(0, 8).forEach(
        (song) => {

            const index =
                songs.findIndex(
                    item =>
                        item.id === song.id
                );


            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "music-card";


            card.innerHTML = `

                <div class="cover-wrapper">

                    <img
                        src="${escapeHTML(song.cover)}"
                        alt="${escapeHTML(song.title)}"
                    >

                    <button class="card-play">

                        <i class="fa-solid fa-play"></i>

                    </button>

                </div>

                <h3>
                    ${escapeHTML(song.title)}
                </h3>

                <p>
                    ${escapeHTML(song.artist)}
                </p>

            `;


            card.addEventListener(
                "click",
                () => {

                    playSong(index);

                }
            );


            musicGrid.appendChild(
                card
            );

        }
    );

}


// ======================================================
// RENDER LIBRARY
// ======================================================

function renderLibrary() {

    if (!libraryList) {
        return;
    }


    libraryList.innerHTML = "";


    if (libraryCount) {

        libraryCount.textContent =
            `${songs.length} song${songs.length !== 1 ? "s" : ""}`;

    }


    if (songs.length === 0) {

        libraryList.innerHTML = `

            <div class="empty-state show">

                <div class="empty-icon">

                    <i class="fa-solid fa-music"></i>

                </div>

                <h3>
                    No music yet
                </h3>

                <p>
                    Add a YouTube song to your library.
                </p>

            </div>

        `;

        return;

    }


    songs.forEach(
        (song, index) => {

            const row =
                createSongRow(
                    song,
                    index
                );

            libraryList.appendChild(
                row
            );

        }
    );

}


// ======================================================
// SONG ROW
// ======================================================

function createSongRow(
    song,
    index
) {

    const row =
        document.createElement(
            "div"
        );


    row.className =
        "song-row";


    row.innerHTML = `

        <img
            class="song-cover"
            src="${escapeHTML(song.cover)}"
            alt="${escapeHTML(song.title)}"
        >

        <div class="song-info">

            <div class="song-title">
                ${escapeHTML(song.title)}
            </div>

            <div class="song-artist">
                ${escapeHTML(song.artist)}
            </div>

        </div>

        <div class="song-duration">
            YouTube
        </div>

        <button
            class="delete-button"
            title="Delete"
        >

            <i class="fa-solid fa-trash"></i>

        </button>

    `;


    row.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest(
                    ".delete-button"
                )
            ) {

                return;

            }

            playSong(index);

        }
    );


    const deleteButton =
        row.querySelector(
            ".delete-button"
        );


    deleteButton.addEventListener(
        "click",
        (event) => {

            event.stopPropagation();

            deleteSong(index);

        }
    );


    return row;

}


// ======================================================
// SEARCH
// ======================================================

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            renderSearch(
                searchInput.value
            );

        }
    );

}


function renderSearch(
    query
) {

    if (!searchResults) {
        return;
    }


    searchResults.innerHTML = "";


    const search =
        query
            .trim()
            .toLowerCase();


    const filtered =
        songs.filter(
            song => {

                return (

                    song.title
                        .toLowerCase()
                        .includes(search)

                    ||

                    song.artist
                        .toLowerCase()
                        .includes(search)

                );

            }
        );


    if (filtered.length === 0) {

        searchResults.innerHTML = `

            <div class="empty-state show">

                <div class="empty-icon">

                    <i class="fa-solid fa-magnifying-glass"></i>

                </div>

                <h3>
                    No songs found
                </h3>

                <p>
                    Try another search.
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(
        song => {

            const index =
                songs.findIndex(
                    item =>
                        item.id === song.id
                );


            searchResults.appendChild(
                createSongRow(
                    song,
                    index
                )
            );

        }
    );

}


// ======================================================
// PLAY SONG
// ======================================================

function playSong(index) {

    if (
        index < 0 ||
        index >= songs.length
    ) {

        return;

    }


    if (!youtubeReady || !youtubePlayer) {

        alert(
            "YouTube player masih loading. Tunggu sebentar."
        );

        return;

    }


    currentIndex =
        index;


    const song =
        songs[currentIndex];


    // Player information

    playerTitle.textContent =
        song.title;


    playerArtist.textContent =
        song.artist;


    playerCover.src =
        song.cover;


    // Lyrics information

    lyricsTitle.textContent =
        song.title;


    lyricsArtist.textContent =
        song.artist;


    lyricsCover.src =
        song.cover;


    // Load lyrics

    loadLyrics(
        song.lyrics || ""
    );


    // Load YouTube

    youtubePlayer.loadVideoById(
        song.youtubeId
    );


    setPlayIcon(true);

}


// ======================================================
// PLAY / PAUSE
// ======================================================

if (playButton) {

    playButton.addEventListener(
        "click",
        () => {

            if (
                currentIndex === -1
            ) {

                if (songs.length > 0) {

                    playSong(0);

                }

                return;

            }


            if (
                !youtubeReady ||
                !youtubePlayer
            ) {

                return;

            }


            const state =
                youtubePlayer.getPlayerState();


            if (
                state ===
                YT.PlayerState.PLAYING
            ) {

                youtubePlayer.pauseVideo();

            } else {

                youtubePlayer.playVideo();

            }

        }
    );

}


// ======================================================
// PLAY ICON
// ======================================================

function setPlayIcon(
    playing
) {

    if (!playButton) {
        return;
    }


    playButton.innerHTML =
        playing

            ? `<i class="fa-solid fa-pause"></i>`

            : `<i class="fa-solid fa-play"></i>`;

}


// ======================================================
// PREVIOUS
// ======================================================

if (previousButton) {

    previousButton.addEventListener(
        "click",
        playPrevious
    );

}


function playPrevious() {

    if (songs.length === 0) {
        return;
    }


    let index =
        currentIndex - 1;


    if (index < 0) {

        index =
            songs.length - 1;

    }


    playSong(index);

}


// ======================================================
// NEXT
// ======================================================

if (nextButton) {

    nextButton.addEventListener(
        "click",
        playNext
    );

}


function playNext() {

    if (songs.length === 0) {
        return;
    }


    let index;


    if (isShuffle) {

        index =
            Math.floor(
                Math.random() *
                songs.length
            );

    } else {

        index =
            currentIndex + 1;


        if (
            index >= songs.length
        ) {

            index = 0;

        }

    }


    playSong(index);

}


// ======================================================
// SHUFFLE
// ======================================================

if (shuffleButton) {

    shuffleButton.addEventListener(
        "click",
        () => {

            isShuffle =
                !isShuffle;


            shuffleButton.style.color =
                isShuffle
                    ? "var(--accent)"
                    : "";

        }
    );

}


// ======================================================
// REPEAT
// ======================================================

if (repeatButton) {

    repeatButton.addEventListener(
        "click",
        () => {

            isRepeat =
                !isRepeat;


            repeatButton.style.color =
                isRepeat
                    ? "var(--accent)"
                    : "";

        }
    );

}


// ======================================================
// PROGRESS BAR
// ======================================================

if (progressBar) {

    progressBar.addEventListener(
        "input",
        () => {

            if (
                !youtubeReady ||
                !youtubePlayer ||
                currentIndex === -1
            ) {

                return;

            }


            const total =
                youtubePlayer.getDuration();


            if (!total) {
                return;
            }


            const percent =
                Number(
                    progressBar.value
                );


            const target =
                (percent / 100) * total;


            youtubePlayer.seekTo(
                target,
                true
            );

        }
    );

}


// ======================================================
// VOLUME
// ======================================================

if (volumeBar) {

    volumeBar.addEventListener(
        "input",
        () => {

            if (
                !youtubeReady ||
                !youtubePlayer
            ) {

                return;

            }


            youtubePlayer.setVolume(
                Number(
                    volumeBar.value
                )
            );

        }
    );

}


// ======================================================
// PLAYER UPDATE LOOP
// ======================================================

setInterval(
    () => {

        if (
            !youtubeReady ||
            !youtubePlayer ||
            currentIndex === -1
        ) {

            return;

        }


        try {

            const current =
                youtubePlayer.getCurrentTime();


            const total =
                youtubePlayer.getDuration();


            if (
                !total ||
                total <= 0
            ) {

                return;

            }


            progressBar.value =
                (
                    current /
                    total
                ) * 100;


            currentTime.textContent =
                formatTime(current);


            duration.textContent =
                formatTime(total);


            updateLyrics(
                current
            );

        } catch (error) {

            // Player belum siap sepenuhnya.

        }

    },
    250
);


// ======================================================
// FORMAT TIME
// ======================================================

function formatTime(
    seconds
) {

    if (
        !seconds ||
        isNaN(seconds)
    ) {

        return "0:00";

    }


    const mins =
        Math.floor(
            seconds / 60
        );


    const secs =
        Math.floor(
            seconds % 60
        )
        .toString()
        .padStart(2, "0");


    return `${mins}:${secs}`;

}


// ======================================================
// LYRICS DRAWER
// ======================================================

if (lyricsButton) {

    lyricsButton.addEventListener(
        "click",
        () => {

            lyricsDrawer.classList.add(
                "open"
            );

        }
    );

}


if (closeLyricsButton) {

    closeLyricsButton.addEventListener(
        "click",
        () => {

            lyricsDrawer.classList.remove(
                "open"
            );

        }
    );

}


// ======================================================
// PARSE LRC
// ======================================================

function parseLRC(
    text
) {

    if (!text) {
        return [];
    }


    const result = [];


    const lines =
        text.split(
            /\r?\n/
        );


    lines.forEach(
        line => {

            const timestamps =
                [
                    ...line.matchAll(
                        /\[(\d{1,2}):(\d{2}(?:\.\d+)?)\]/g
                    )
                ];


            if (
                timestamps.length === 0
            ) {

                return;

            }


            const lyricText =
                line
                    .replace(
                        /\[\d{1,2}:\d{2}(?:\.\d+)?\]/g,
                        ""
                    )
                    .trim();


            timestamps.forEach(
                match => {

                    const minutes =
                        Number(
                            match[1]
                        );


                    const seconds =
                        Number(
                            match[2]
                        );


                    result.push({

                        time:
                            minutes * 60 +
                            seconds,

                        text:
                            lyricText || "♪"

                    });

                }
            );

        }
    );


    result.sort(
        (a, b) =>
            a.time - b.time
    );


    return result;

}


// ======================================================
// LOAD LYRICS
// ======================================================

function loadLyrics(
    lrcText
) {

    lyrics =
        parseLRC(
            lrcText
        );


    activeLyricIndex =
        -1;


    lyricsContent.innerHTML = "";


    if (lyrics.length === 0) {

        lyricsContent.innerHTML = `

            <div class="lyrics-empty">

                <i class="fa-solid fa-microphone-lines"></i>

                <p>
                    No synchronized lyrics.
                </p>

            </div>

        `;

        return;

    }


    lyrics.forEach(
        (line, index) => {

            const element =
                document.createElement(
                    "button"
                );


            element.className =
                "lyric-line";


            element.textContent =
                line.text;


            element.addEventListener(
                "click",
                () => {

                    if (
                        youtubeReady &&
                        youtubePlayer
                    ) {

                        youtubePlayer.seekTo(
                            line.time,
                            true
                        );

                    }

                }
            );


            lyricsContent.appendChild(
                element
            );

        }
    );

}


// ======================================================
// UPDATE LYRICS
// ======================================================

function updateLyrics(
    current
) {

    if (
        lyrics.length === 0
    ) {

        return;

    }


    let index = -1;


    for (
        let i = 0;
        i < lyrics.length;
        i++
    ) {

        if (
            current >=
            lyrics[i].time
        ) {

            index = i;

        } else {

            break;

        }

    }


    if (
        index === activeLyricIndex
    ) {

        return;

    }


    activeLyricIndex =
        index;


    const elements =
        lyricsContent.querySelectorAll(
            ".lyric-line"
        );


    elements.forEach(
        element => {

            element.classList.remove(
                "active"
            );

        }
    );


    if (
        index >= 0 &&
        elements[index]
    ) {

        elements[index].classList.add(
            "active"
        );


        elements[index].scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

    }

}


// ======================================================
// DELETE SONG
// ======================================================

function deleteSong(
    index
) {

    const song =
        songs[index];


    if (!song) {
        return;
    }


    const confirmed =
        confirm(
            `Hapus "${song.title}" dari library?`
        );


    if (!confirmed) {
        return;
    }


    // Kalau yang dihapus sedang diputar

    if (
        index === currentIndex
    ) {

        if (
            youtubeReady &&
            youtubePlayer
        ) {

            youtubePlayer.stopVideo();

        }


        currentIndex = -1;


        playerTitle.textContent =
            "No song selected";


        playerArtist.textContent =
            "Choose a song";


        playerCover.src =
            DEFAULT_COVER;


        lyricsTitle.textContent =
            "No song playing";


        lyricsArtist.textContent =
            "—";


        lyricsCover.src =
            DEFAULT_COVER;


        lyricsContent.innerHTML = `

            <div class="lyrics-empty">

                <i class="fa-solid fa-microphone-lines"></i>

                <p>
                    No lyrics available.
                </p>

            </div>

        `;

        setPlayIcon(false);

    }


    songs.splice(
        index,
        1
    );


    if (
        currentIndex > index
    ) {

        currentIndex--;

    }


    saveSongs();

    renderAll();

}


// ======================================================
// NAVIGATION
// ======================================================

navButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                const target =
                    button.dataset.page;


                navButtons.forEach(
                    item => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                button.classList.add(
                    "active"
                );


                pages.forEach(
                    page => {

                        page.classList.remove(
                            "active"
                        );

                    }
                );


                const targetPage =
                    document.getElementById(
                        `${target}Page`
                    );


                if (targetPage) {

                    targetPage.classList.add(
                        "active"
                    );

                }

            }
        );

    }
);


// ======================================================
// VIEW ALL
// ======================================================

if (viewAllButton) {

    viewAllButton.addEventListener(
        "click",
        () => {

            const libraryButton =
                document.querySelector(
                    '[data-page="library"]'
                );


            if (libraryButton) {

                libraryButton.click();

            }

        }
    );

}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(
    value
) {

    const element =
        document.createElement(
            "div"
        );


    element.textContent =
        String(value ?? "");


    return element.innerHTML;

}


// ======================================================
// INITIAL PLAYER UI
// ======================================================

playerCover.src =
    DEFAULT_COVER;


lyricsCover.src =
    DEFAULT_COVER;


// ======================================================
// INITIAL RENDER
// ======================================================

renderAll();


console.log(
    "MyMusic app berhasil dijalankan."
);

