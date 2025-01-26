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

// Set spinner
const playerTextContainer = document.getElementById("player-text-container")
let spinnerPlayers = []
function setSpinner() {
    spinnerPlayers = []
    if (allPlayers.length === 0) return
    while (spinnerPlayers.length < 9) {
        spinnerPlayers = spinnerPlayers.concat(allPlayers)
    }

    playerTextContainer.innerHTML = ""

    // Add first element to top invisible, elements 2-8 to display, then rest to bottom invisible
    for (let i = 0; i < spinnerPlayers.length; i++) {
        const playerDiv = document.createElement("div")
        playerDiv.innerText = spinnerPlayers[i].username
        switch (i) {
            case 0:
                playerDiv.classList.add("invisible-player", "player-0")
                break
            case 1:
                playerDiv.classList.add("very-side-player", "player-1")
                break
            case 2:
                playerDiv.classList.add("somewhat-side-player", "player-2")
                break
            case 3:
                playerDiv.classList.add("somewhat-middle-player", "player-3")
                break
            case 4:
                playerDiv.classList.add("player-4")
                break
            case 5:
                playerDiv.classList.add("somewhat-middle-player", "player-5")
                break
            case 6:
                playerDiv.classList.add("somewhat-side-player", "player-6")
                break
            case 7:
                playerDiv.classList.add("very-side-player", "player-7")
                break
            default:
                playerDiv.classList.add("invisible-player", "player-8")
                break
        }
        playerTextContainer.append(playerDiv)
    }
}