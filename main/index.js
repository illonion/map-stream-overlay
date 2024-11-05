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
}

// Update team name
function updateTeamName(currentTeamName, newTeamName, teamNameEl, teamNameHighlightEl) {
    if (currentTeamName !== newTeamName) {
        currentTeamName = newTeamName;
        teamNameEl.innerText = currentTeamName;
        const newWidth = teamNameEl.getBoundingClientRect().width + 42.5;
        teamNameHighlightEl.style.width = `${Math.min(newWidth, 671)}px`;
    }
    return currentTeamName;
}