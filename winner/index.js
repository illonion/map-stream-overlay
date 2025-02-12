// Load teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/teams.json");
    const responseJson = await response.json();
    allTeams = responseJson;
}
const findTeam = teamName => allTeams.find(team => team.team_name.trim() === teamName.trim())
getTeams()

const teamColour = document.getElementById("team-colour")
const teamName = document.getElementById("team-name")
const teamLogo = document.getElementById("team-logo")
const playerNames = document.getElementById("player-names")
let currentTeamName

setInterval(() => {
    if (currentTeamName !== getCookie("currentWinningTeamName")) {
        currentTeamName = getCookie("currentWinningTeamName")

        // Find team
        const currentTeam = findTeam(currentTeamName)
        if (currentTeam) {
            // Set details of team
            teamColour.innerText = `TEAM ${getCookie("currentWinningTeamColour").toUpperCase()}`
            teamName.innerText = currentTeamName
            teamLogo.setAttribute("src", currentTeam.team_icon)
            
            // Set player names
            playerNames.innerHTML = ""
            for (let i = 0; i < currentTeam.player_names.length; i++) {
                const player = document.createElement("div")
                player.classList.add("player-name")
                player.innerText = currentTeam.player_names[i]
                playerNames.append(player)
            }
        }
    }
}, 200)