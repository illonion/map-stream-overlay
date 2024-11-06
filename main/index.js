// Get mappool
const roundNameEl = document.getElementById("round-name");
let allBeatmaps;
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json");
    const responseJson = await response.json();
    allBeatmaps = responseJson.beatmaps;
    roundNameEl.innerText = responseJson.roundName;
}
getMappool()

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
socket.onopen = () => { console.log("Successfully Connected"); }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!"); }
socket.onerror = error => { console.log("Socket Error: ", error); }

// Team name information
const teamNameLeftEl = document.getElementById("team-name-left");
const teamNameRightEl = document.getElementById("team-name-right");
const teamNameHighlightLeftEl = document.getElementById("team-name-highlight-left");
const teamNameHighlightRightEl = document.getElementById("team-name-highlight-right");
let currentTeamNameLeft, currentTeamNameRight

// Star Information
const teamStarsContainerLeftEl = document.getElementById("team-stars-container-left")
const teamStarsContainerRightEl = document.getElementById("team-stars-container-right")
let currentBestOf, currentFirstTo, currnetLeftStars, currentRightStars

// Booleans
let scoreVisibility, starVisibility

// Play score information
const playScoreLeftEl = document.getElementById("play-score-left");
const playScoreRightEl = document.getElementById("play-score-right");
const scoreBarLeftFillEl = document.getElementById("score-bar-left-fill");
const scoreBarRightfillEl = document.getElementById("score-bar-right-fill");
const animationDuration = 300;
const fps = 24;
const frameTime = 1000 / fps;
let currentPlayScoreLeft = 0, currentPlayScoreRight = 0, animationFrame;
const baseScoreBarMaxScore = 4000000
let currentscoreBarMaxScore
const EZMultiplier = 2

// Stats
const nowPlayingStatsCSEl = document.getElementById("now-playing-stats-cs")
const nowPlayingStatsODEl = document.getElementById("now-playing-stats-od")
const nowPlayingStatsBPMEl = document.getElementById("now-playing-stats-bpm")
const nowPlayingStatsAREl = document.getElementById("now-playing-stats-ar")
let currentBeatmapId, currentBeatmapMd5, updateStats = false

// Now Playing Map Background
const nowPlayingMapBackgroundEl = document.getElementById("now-playing-map-background")

// Now Playing Metadata
const nowPlayingSongTitleEl = document.getElementById("now-playing-song-title")
const nowPlayingArtist = document.getElementById("now-playing-artist")
const nowPlayingMapperName = document.getElementById("now-playing-mapper-name")

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log(data);

    // Update team names
    currentTeamNameLeft = updateTeamName(currentTeamNameLeft, data.tourney.manager.teamName.left, teamNameLeftEl, teamNameHighlightLeftEl);
    currentTeamNameRight = updateTeamName(currentTeamNameRight, data.tourney.manager.teamName.right, teamNameRightEl, teamNameHighlightRightEl);

    // Set star information
    if (currentBestOf !== data.tourney.manager.bestOF || currnetLeftStars !== data.tourney.manager.stars.left ||
        currentRightStars !== data.tourney.manager.stars.right
    ) {
        currentBestOf = data.tourney.manager.bestOF;
        currentFirstTo = Math.ceil(currentBestOf / 2);
        currnetLeftStars = data.tourney.manager.stars.left;
        currentRightStars = data.tourney.manager.stars.right;

        teamStarsContainerLeftEl.innerHTML = "";
        teamStarsContainerRightEl.innerHTML = "";
        let i = 0;
        for (i; i < currnetLeftStars; i++) teamStarsContainerLeftEl.append(createStar(true));
        for (i; i < currentFirstTo; i++) teamStarsContainerLeftEl.append(createStar(false));
        i = 0;
        for (i; i < currentRightStars; i++) teamStarsContainerRightEl.append(createStar(true));
        for (i; i < currentFirstTo; i++) teamStarsContainerRightEl.append(createStar(false));

        // Create Star
        function createStar(fillStar) {
            const newStar = document.createElement("div");
            newStar.classList.add("team-star");
            if (fillStar) newStar.classList.add("team-star-fill");
            return newStar;
        }
    }

    // Score visibility
    if (scoreVisibility !== data.tourney.manager.bools.scoreVisible) {
        scoreVisibility = data.tourney.manager.bools.scoreVisible
    }
    
    // Star visibility
    if (starVisibility !== data.tourney.manager.bools.starsVisible) {
        starVisibility = data.tourney.manager.bools.starsVisible
        if (starVisibility) {
            teamStarsContainerLeftEl.style.display = "flex"
            teamStarsContainerRightEl.style.display = "flex"
        } else {
            teamStarsContainerLeftEl.style.display = "none"
            teamStarsContainerRightEl.style.display = "none"
        }
    }

    // Score animation
    if (scoreVisibility) {
        animateScore(currentPlayScoreLeft, data.tourney.manager.gameplay.score.left, playScoreLeftEl, scoreBarLeftFillEl);
        animateScore(currentPlayScoreRight, data.tourney.manager.gameplay.score.right, playScoreRightEl, scoreBarRightfillEl);
    }

    // Beatmap information
    if (currentBeatmapId !== data.menu.bm.id || currentBeatmapMd5 !== data.menu.bm.md5) {
        currentBeatmapId = data.menu.bm.id;
        currentBeatmapMd5 = data.menu.bm.md5;
        setTimeout(() => updateStats = true, 250);
    }

    // Update map
    if (updateStats) {
        const currentMap = allBeatmaps.find(map => currentBeatmapId === map.beatmapID)

        // Stats
        if (currentMap) {
            nowPlayingStatsCSEl.innerText = currentMap.cs.toFixed(1);
            nowPlayingStatsODEl.innerText = currentMap.od.toFixed(1);
            nowPlayingStatsBPMEl.innerText = Math.round(currentMap.bpm).toString().padStart(3, "0");
            nowPlayingStatsAREl.innerText = currentMap.ar.toFixed(1);

            // Set the base score max depending on the mod
            switch (currentMap.mod) {
                case "HD": currentscoreBarMaxScore = baseScoreBarMaxScore * 1.06; break;
                case "HR": currentscoreBarMaxScore = baseScoreBarMaxScore * 1.1; break;
                case "DT": currentscoreBarMaxScore = baseScoreBarMaxScore * 1.2; break;
                default: currentscoreBarMaxScore = baseScoreBarMaxScore
            }
        } else {
            nowPlayingStatsCSEl.innerText = data.menu.bm.stats.memoryCS.toFixed(1);
            nowPlayingStatsODEl.innerText = data.menu.bm.stats.memoryOD.toFixed(1);
            nowPlayingStatsBPMEl.innerText = Math.round(data.menu.bm.stats.BPM.common).toString().padStart(3, "0");
            nowPlayingStatsAREl.innerText = data.menu.bm.stats.memoryAR.toFixed(1);
        }

        // Background Image
        data.menu.bm.path.full = data.menu.bm.path.full.replace(/#/g, '%23').replace(/%/g, '%25').replace(/\\/g, '/');
    
        // Check if background image exists
        const imageURL = `http://${location.host}/Songs/${data.menu.bm.path.full}?a=${Math.random(10000)}`;
        function checkIfPathExists(url, callback) {
            const img = new Image();
            img.onload = () => callback(true); 
            img.onerror = () => callback(false);  
            img.src = url;  
        }

        // Check if the image exists
        checkIfPathExists(imageURL, (exists) => {
            if (exists) nowPlayingMapBackgroundEl.style.backgroundImage = `url('${imageURL}')`;
            else nowPlayingMapBackgroundEl.style.backgroundImage = `url('https://assets.ppy.sh/beatmaps/${data.menu.bm.set}/covers/cover.jpg')`;
        });

        // Metadata
        nowPlayingSongTitleEl.innerText = data.menu.bm.metadata.title
        nowPlayingArtist.innerText = data.menu.bm.metadata.artist
        nowPlayingMapperName.innerText = data.menu.bm.metadata.mapper
        
        updateStats = false
    }
}

// Update team name
function updateTeamName(currentTeamName, newTeamName, teamNameEl, teamNameHighlightEl) {
    if (currentTeamName !== newTeamName) {
        currentTeamName = newTeamName;
        teamNameEl.innerText = currentTeamNamef;
        teamNameHighlightEl.style.width = `${teamNameEl.getBoundingClientRect().width + 42.5}px`;
    }
    return currentTeamName;
}

// Function to animate score at 24fps
function animateScore(currentScore, targetScore, scoreElement, scoreBarElement) {
    // Calculate the difference and the number of frames
    const frames = animationDuration / frameTime;
    const scoreIncrement = (targetScore - currentScore) / frames;
    
    // Cancel any previous animation frame to reset the animation
    cancelAnimationFrame(animationFrame);

    // Define the function to update the score in each frame
    function updateScore() {
        currentScore += scoreIncrement;

        // Avoid small precision errors and update display
        if (currentScore >= targetScore) currentScore = targetScore;
        scoreElement.innerText = Math.round(currentScore).toLocaleString();

        // Set width of score bar
        scoreBarElement.style.width = `${Math.min(currentScore / currentscoreBarMaxScore * 1400, 1400)}px`

        // Continue or stop the animation
        if (currentScore !== targetScore) animationFrame = requestAnimationFrame(updateScore);
    }

    // Start the animation
    updateScore();
}