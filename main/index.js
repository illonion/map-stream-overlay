// Get mappool
const roundNameEl = document.getElementById("round-name");
let allBeatmaps;
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json");
    const responseJson = await response.json();
    allBeatmaps = responseJson.beatmaps;
    roundNameEl.innerText = responseJson.roundName;

    // Set best of and first to
    switch (responseJson.roundName) {
        case "ROUND OF 32": case "ROUND OF 16":
            currentBestOf = 9; break;
        case "QUARTERFINALS": case "SEMIFINALS":
            currentBestOf = 11; break;
        case "FINALS": case "GRAND FINALS":
            currentBestOf = 13; break;
    }
    currentFirstTo = Math.ceil(currentBestOf / 2);
    
    createStarDisplay();
}
getMappool();

// Update Star Count
function updateStarCount(side, operation) {
    // Do operation
    if (side === "left" && operation === "add") currentLeftStars++;
    if (side === "right" && operation === "add") currentRightStars++;
    if (side === "left" && operation === "minus") currentLeftStars--;
    if (side === "right" && operation === "minus") currentRightStars--;

    // Check boundary
    if (currentLeftStars < 0) currentLeftStars = 0;
    if (currentRightStars < 0) currentRightStars = 0;
    if (currentLeftStars > currentFirstTo) currentLeftStars = currentFirstTo;
    if (currentRightStars > currentFirstTo) currentRightStars = currentFirstTo;

    createStarDisplay()
}

// Create star display
function createStarDisplay() {
    document.cookie = `currentLeftStars=${currentLeftStars}; path=/`
    document.cookie = `currentRightStars=${currentRightStars}; path=/`
    document.cookie = `currentBestOf=${currentBestOf}; path=/`
    if (currentLeftStars >= currentFirstTo) {
        document.cookie = `currentWinningTeamName=${currentTeamNameLeft}; path=/`
        document.cookie = `currentWinningTeamColour=RED; path=/`
    }
    else if (currentRightStars >= currentFirstTo) {
        document.cookie = `currentWinningTeamName=${currentTeamNameRight}; path=/`
        document.cookie = `currentWinningTeamColour=BLUE; path=/`
    }
    else {
        document.cookie = `currentWinningTeamName=none; path=/`
        document.cookie = `currentWinningTeamColour=; path=/`
    }

    teamStarsContainerLeftEl.innerHTML = "";
    teamStarsContainerRightEl.innerHTML = "";
    let i = 0;
    for (i; i < currentLeftStars; i++) teamStarsContainerLeftEl.append(createStar(true));
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

// Reset star count
function resetStars() {
    currentLeftStars = 0;
    currentRightStars = 0;

    createStarDisplay();
}

// Create socket
const socket = createTosuWsSocket()

// Team name information
const teamNameLeftEl = document.getElementById("team-name-left");
const teamNameRightEl = document.getElementById("team-name-right");
const teamNameHighlightLeftEl = document.getElementById("team-name-highlight-left");
const teamNameHighlightRightEl = document.getElementById("team-name-highlight-right");
let currentTeamNameLeft, currentTeamNameRight;

// Star Information
const teamStarsContainerLeftEl = document.getElementById("team-stars-container-left");
const teamStarsContainerRightEl = document.getElementById("team-stars-container-right");
let currentBestOf = 0, currentFirstTo = 0, currentLeftStars = 0, currentRightStars = 0;

// Booleans
let scoreVisibility, starVisibility;

// Play score information
const playScoreLeftEl = document.getElementById("play-score-left");
const playScoreRightEl = document.getElementById("play-score-right");
const scoreBarLeftFillEl = document.getElementById("score-bar-left-fill");
const scoreBarRightfillEl = document.getElementById("score-bar-right-fill");
const animationDuration = 300;
const fps = 24;
const frameTime = 1000 / fps;
let currentPlayScoreLeft = 0, currentPlayScoreRight = 0, animationFrame;
const baseScoreBarMaxScore = 4000000;
let currentScoreBarMaxScore;
const EZMultiplier = 1.8;

// Play Score Difference
const playScoreDifferenceLeftArrow = document.getElementById("player-score-difference-left-arrow");
const playScoreDifference = document.getElementById("play-score-difference");
const playScoreDifferenceRightArrow = document.getElementById("play-score-difference-right-arrow");
let currentPlayScoreDifference = 0, playScoreDifferenceAnimationFrame;

// Stats
const nowPlayingStatsCSEl = document.getElementById("now-playing-stats-cs");
const nowPlayingStatsODEl = document.getElementById("now-playing-stats-od");
const nowPlayingStatsBPMEl = document.getElementById("now-playing-stats-bpm");
const nowPlayingStatsAREl = document.getElementById("now-playing-stats-ar");
let currentBeatmapId, currentBeatmapMd5, updateStats = false;

// Now Playing Map Background
const nowPlayingMapBackgroundEl = document.getElementById("now-playing-map-background");

// Now Playing Metadata
const nowPlayingBottomLine = document.getElementById("now-playing-bottom-line")
const nowPlayingSongTitleEl = document.getElementById("now-playing-song-title");
const nowPlayingArtist = document.getElementById("now-playing-artist");
const nowPlayingMapperName = document.getElementById("now-playing-mapper-name");
const nowPlayingMapperDifficulty = document.getElementById("now-playing-mapper-difficulty")

// IPC State
let ipcState, pointAdded = false, updateStars = false;

// Star button toggle
const sidebarStarControlButtonToggleEl = document.getElementById("sidebar-star-control-button-toggle");
let warmupMode = false;
function starControlToggle() {
    warmupMode = !warmupMode;
    if (warmupMode) {
        teamStarsContainerLeftEl.style.display = "none";
        teamStarsContainerRightEl.style.display = "none";
        sidebarStarControlButtonToggleEl.innerText = "Toggle Stars: OFF";
    } else {
        teamStarsContainerLeftEl.style.display = "flex";
        teamStarsContainerRightEl.style.display = "flex";
        sidebarStarControlButtonToggleEl.innerText = "Toggle Stars: ON";
    }
}

// Team size 
const teamSize = 4;

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log(data);

    // Update team names
    currentTeamNameLeft = updateTeamName(currentTeamNameLeft, data.tourney.manager.teamName.left, teamNameLeftEl, teamNameHighlightLeftEl);
    currentTeamNameRight = updateTeamName(currentTeamNameRight, data.tourney.manager.teamName.right, teamNameRightEl, teamNameHighlightRightEl);
    
    // Star visibility
    if (starVisibility !== data.tourney.manager.bools.starsVisible) {
        starVisibility = data.tourney.manager.bools.starsVisible
        if (starVisibility) {
            teamStarsContainerLeftEl.style.display = "flex";
            teamStarsContainerRightEl.style.display = "flex";
        } else {
            teamStarsContainerLeftEl.style.display = "none";
            teamStarsContainerRightEl.style.display = "none";
        }
    }

    // Get scores for both sides
    let currentScoreLeft = 0;
    let currentScoreRight = 0;
    for (let i = 0; i < data.tourney.ipcClients.length; i++) {
        let score = data.tourney.ipcClients[i].gameplay.score;
        if (data.tourney.ipcClients[i].gameplay.mods.str.toUpperCase().includes('EZ')) score *= EZMultiplier;
        if (i < data.tourney.ipcClients.length / 2) currentScoreLeft += score;
        else currentScoreRight += score;
    }

    // Animate score
    animateScore("left", currentScoreLeft);
    animateScore("right", currentScoreRight);

    let currentPlayScoreDifference = Math.abs(currentScoreLeft - currentScoreRight);
    animateScoreDifference(currentPlayScoreDifference);

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
                case "HD": currentScoreBarMaxScore = baseScoreBarMaxScore * 1.06; break;
                case "HR": currentScoreBarMaxScore = baseScoreBarMaxScore * 1.1; break;
                case "DT": currentScoreBarMaxScore = baseScoreBarMaxScore * 1.2; break;
                default: currentScoreBarMaxScore = baseScoreBarMaxScore
            }
        } else {
            nowPlayingStatsCSEl.innerText = data.menu.bm.stats.memoryCS.toFixed(1);
            nowPlayingStatsODEl.innerText = data.menu.bm.stats.memoryOD.toFixed(1);
            nowPlayingStatsBPMEl.innerText = Math.round(data.menu.bm.stats.BPM.common).toString().padStart(3, "0");
            nowPlayingStatsAREl.innerText = data.menu.bm.stats.memoryAR.toFixed(1);

            currentScoreBarMaxScore = baseScoreBarMaxScore
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
        nowPlayingSongTitleEl.innerText = data.menu.bm.metadata.title;
        nowPlayingArtist.innerText = data.menu.bm.metadata.artist;
        nowPlayingMapperName.innerText = data.menu.bm.metadata.mapper;
        nowPlayingMapperDifficulty.innerText = `[${data.menu.bm.metadata.difficulty}]`;
        const nowPlayingMapperDifficultyStartLeft = nowPlayingBottomLine.getBoundingClientRect().width + 2738
        nowPlayingMapperDifficulty.style.left = `${nowPlayingMapperDifficultyStartLeft}px`
        nowPlayingMapperDifficulty.style.maxWidth = `${3300 - nowPlayingMapperDifficultyStartLeft}px`
        
        updateStats = false;
    }

    // Check IPC state
    if (ipcState !== data.tourney.manager.ipcState) {
        ipcState = data.tourney.manager.ipcState;
        if (ipcState === 4) setTimeout(() => updateStars = true, 500);
        else document.cookie = `currentWinner=none; path=/`
    }

    // Update stars
    if (updateStars) {
        if (warmupMode) return;
        if (currentPlayScoreLeft > currentPlayScoreRight) {
            updateStarCount("left", "add");
            document.cookie = `currentWinner=left; path=/`
        }
        else if (currentPlayScoreRight > currentPlayScoreLeft) {
            updateStarCount("right", "add");
            document.cookie = `currentWinner=right; path=/`
        }
        updateStars = false
    }
}

// Update team name
function updateTeamName(currentTeamName, newTeamName, teamNameEl, teamNameHighlightEl) {
    if (currentTeamName !== newTeamName) {
        currentTeamName = newTeamName;
        teamNameEl.innerText = currentTeamName;
        teamNameHighlightEl.style.width = `${teamNameEl.getBoundingClientRect().width + 42.5}px`;
    }
    return currentTeamName;
}

// Function to animate score at 24fps
function animateScore(side, score) {
    // Determine which variables to use based on the side
    const currentScore = side === "left" ? currentPlayScoreLeft : currentPlayScoreRight;
    const targetScore = score
    const scoreElement = side === "left" ? playScoreLeftEl : playScoreRightEl;
    const scoreBarElement = side === "left" ? scoreBarLeftFillEl : scoreBarRightfillEl;
    
    // Calculate the difference and the number of frames
    const frames = animationDuration / frameTime;
    const scoreIncrement = (targetScore - currentScore) / frames;

    // Cancel any previous animation frame to reset the animation
    cancelAnimationFrame(animationFrame);

    // Define the function to update the score in each frame
    function updateScore() {
        // Update the current score and reassign to the global variable
        if (side === "left") {
            currentPlayScoreLeft += scoreIncrement;
            if (currentPlayScoreLeft >= targetScore) currentPlayScoreLeft = targetScore;
            scoreElement.innerText = Math.round(currentPlayScoreLeft).toLocaleString();
        } else {
            currentPlayScoreRight += scoreIncrement;
            if (currentPlayScoreRight >= targetScore) currentPlayScoreRight = targetScore;
            scoreElement.innerText = Math.round(currentPlayScoreRight).toLocaleString();
        }

        // Set width of score bar
        const barWidth = side === "left" 
            ? Math.min(currentPlayScoreLeft / currentScoreBarMaxScore * 1400, 1400) 
            : Math.min(currentPlayScoreRight / currentScoreBarMaxScore * 1400, 1400);
        scoreBarElement.style.width = `${barWidth}px`;

        // Continue or stop the animation
        if ((side === "left" && currentPlayScoreLeft !== targetScore) ||
            (side === "right" && currentPlayScoreRight !== targetScore)) {
            animationFrame = requestAnimationFrame(updateScore);
        }
    }

    // Start the animation
    updateScore();
}

function animateScoreDifference(score) {
    // Calculate the difference and the number of frames
    const frames = animationDuration / frameTime;
    targetScore = score
    const scoreIncrement = (targetScore - currentPlayScoreDifference) / frames;

    // Cancel any previous animation frame to reset the animation
    cancelAnimationFrame(playScoreDifferenceAnimationFrame);
    
    // Define function to update the score difference each frame
    function updateScoreDifference() {
        currentPlayScoreDifference += scoreIncrement;
        if (currentPlayScoreDifference > targetScore) currentPlayScoreDifference = targetScore
        playScoreDifference.innerText = Math.round(currentPlayScoreDifference).toLocaleString();

        // Set arrow display
        if (currentPlayScoreLeft > currentPlayScoreRight) {
            playScoreDifferenceLeftArrow.style.opacity = 1
            playScoreDifferenceRightArrow.style.opacity = 0
        } else if (currentPlayScoreLeft === currentPlayScoreRight) {
            playScoreDifferenceLeftArrow.style.opacity = 0
            playScoreDifferenceRightArrow.style.opacity = 0
        } else if (currentPlayScoreLeft < currentPlayScoreRight) {
            playScoreDifferenceLeftArrow.style.opacity = 0
            playScoreDifferenceRightArrow.style.opacity = 1
        }

        // Continue animation
        if (currentPlayScoreDifference !== targetScore) {
            playScoreDifferenceAnimationFrame = requestAnimationFrame(updateScoreDifference)
        }
    }

    updateScoreDifference()
}