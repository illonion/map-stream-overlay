// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws")
socket.onopen = () => { console.log("Successfully Connected") }
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!") }
socket.onerror = error => { console.log("Socket Error: ", error) }

// Team name information
const teamNameLeftEl = document.getElementById("team-name-left");
const teamNameRightEl = document.getElementById("team-name-right");
const teamNameHighlightLeftEl = document.getElementById("team-name-highlight-left");
const teamNameHighlightRightEl = document.getElementById("team-name-highlight-right");
let currentTeamNameLeft, currentTeamNameRight

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    console.log(data);

    // Update team names
    currentTeamNameLeft = updateTeamName(currentTeamNameLeft, data.tourney.manager.teamName.left, teamNameLeftEl, teamNameHighlightLeftEl);
    currentTeamNameRight = updateTeamName(currentTeamNameRight, data.tourney.manager.teamName.right, teamNameRightEl, teamNameHighlightRightEl);
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