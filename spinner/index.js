// All Players
let allPlayers = []
const findPlayerUsingSome = id => allPlayers.some(player => player.id == id)
const findPlayerUsingFind = id => allPlayers.find(player => player.id == id)

// Add players
const playerIdsInputEl = document.getElementById("player-ids-input")
const sidebarPlayerListEl = document.getElementById("sidebar-player-list")
async function addPlayers() {
    const allIds = playerIdsInputEl.value.split("\n")

    for (let i = 0; i < allIds.length; i++) {
        allIds[i] = allIds[i].trim()
        if (findPlayerUsingSome(allIds[i]) || allIds[i] === "") continue
        
        const response = await fetch(`https://tryz.vercel.app/api/u/${allIds[i]}`)
        const responseJson = await response.json()
        console.log(responseJson)
        
        // Add player
        if (responseJson.username) {
            const playerDiv = document.createElement("div")
            playerDiv.innerText = responseJson.username
            playerDiv.classList.add("sidebar-title", "sidebar-text")
            sidebarPlayerListEl.append(playerDiv)

            // Add player to allPlayers object
            allPlayers.push({
                id: Number(allIds[i]),
                username: responseJson.username,
                avatar_url: responseJson.avatar_url
            })
        }
    }
}

// Clear Players
function clearPlayers() {
    allPlayers = []
    sidebarPlayerListEl.innerHTML = ""
}