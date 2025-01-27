// All Players
let allPlayers = []
let remainingSpinnerPlayers = []
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

    remainingSpinnerPlayers = [...allPlayers]
}

// Clear Players
function clearPlayers() {
    allPlayers = []
    sidebarPlayerListEl.innerHTML = ""
}

let currentSpinnerIntervalId

// Set spinner
const playerTextContainer = document.getElementById("player-text-container")
let spinnerPlayers = []
function setSpinner() {
    spinnerPlayers = []
    if (remainingSpinnerPlayers.length === 0) return
    while (spinnerPlayers.length < 9) {
        spinnerPlayers = spinnerPlayers.concat(remainingSpinnerPlayers)
    }

    playerTextContainer.innerHTML = ""

    // Add first element to top invisible, elements 2-8 to display, then rest to bottom invisible
    for (let i = - 1; i < spinnerPlayers.length - 1; i++) {
        const playerDiv = document.createElement("div")
        playerDiv.innerText = spinnerPlayers[i + 1].username
        playerDiv.dataset.id = spinnerPlayers[i + 1].id
        switch (i + 1) {
            case 0:
            case -1:
                playerDiv.classList.add("invisible-player", "player-0")
                playerDiv.dataset.action="player-0"
                break
            case 1:
                playerDiv.classList.add("very-side-player", "player-1")
                playerDiv.dataset.action="player-1"
                break
            case 2:
                playerDiv.classList.add("somewhat-side-player", "player-2")
                playerDiv.dataset.action="player-2"
                break
            case 3:
                playerDiv.classList.add("somewhat-middle-player", "player-3")
                playerDiv.dataset.action="player-3"
                break
            case 4:
                playerDiv.classList.add("player-4")
                playerDiv.dataset.action="player-4"
                break
            case 5:
                playerDiv.classList.add("somewhat-middle-player", "player-5")
                playerDiv.dataset.action="player-5"
                break
            case 6:
                playerDiv.classList.add("somewhat-side-player", "player-6")
                playerDiv.dataset.action="player-6"
                break
            case 7:
                playerDiv.classList.add("very-side-player", "player-7")
                playerDiv.dataset.action="player-7"
                break
            default:
                playerDiv.classList.add("invisible-player", "player-8")
                playerDiv.dataset.action="player-8"
                break
        }
        
        playerTextContainer.append(playerDiv)
    }

    currentSpinnerIntervalId = setInterval(startIdleSpinner, 1500)
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

function startIdleSpinner() {
    const transitions = {
        "player-8": "player-0",
        "player-0": "player-1",
        "player-1": "player-2",
        "player-2": "player-3",
        "player-3": "player-4",
        "player-4": "player-5",
        "player-5": "player-6",
        "player-6": "player-7",
        "player-7": "player-8"
    }
 
    const classChanges = {
        "player-8": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "invisible-player", "player-8"], add: ["invisible-player", "player-0", "from-player-8-to-player-0"] },
        "player-0": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "invisible-player", "player-0"], add: ["very-side-player", "player-1", "from-player-0-to-player-1"] },
        "player-1": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "very-side-player", "player-1"], add: ["somewhat-side-player", "player-2", "from-player-1-to-player-2"] },
        "player-2": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "somewhat-side-player", "player-2"], add: ["somewhat-middle-player", "player-3", "from-player-2-to-player-3"] },
        "player-3": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "somewhat-middle-player", "player-3"], add: ["player-4", "from-player-3-to-player-4"] },
        "player-4": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "player-4"], add: ["somewhat-middle-player", "player-5", "from-player-4-to-player-5"] },
        "player-5": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "somewhat-middle-player", "player-5"], add: ["somewhat-side-player", "player-6", "from-player-5-to-player-6"] },
        "player-6": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "somewhat-side-player", "player-6"], add: ["very-side-player", "player-7", "from-player-6-to-player-7"] },
        "player-7": { remove: ["from-player-8-to-player-0", "from-player-0-to-player-1", "from-player-1-to-player-2", "from-player-2-to-player-3", "from-player-3-to-player-4", "from-player-4-to-player-5", "from-player-5-to-player-6", "from-player-6-to-player-7", "from-player-7-to-player-8", "very-side-player", "player-7"], add: ["invisible-player", "player-8", "from-player-7-to-player-8"] }
    }
 
    const children = Array.from(playerTextContainer.children);

    // First, find and transition the "player-0" right before "player-1"
    let primaryTargetIndex = children.findIndex((child, index) => 
        child.dataset.action === "player-0" && 
        children[(index + 1) % children.length].dataset.action === "player-1"
    );
 
    // Transition the primary target first
    if (primaryTargetIndex !== -1) {
        const primaryTarget = children[primaryTargetIndex];
        primaryTarget.dataset.action = "player-1";
        const changes = classChanges["player-0"];
        primaryTarget.classList.remove(...changes.remove);
        primaryTarget.classList.add(...changes.add);
    }

    // Then transition all other elements
    children.forEach((child, index) => {
        if (index === primaryTargetIndex) return

        const currentAction = child.dataset.action
        const nextAction = transitions[currentAction]

        console.log(currentAction)
        if (nextAction && currentAction !== "player-0") {
            child.dataset.action = nextAction
            const changes = classChanges[currentAction]
            child.classList.remove(...changes.remove)
            child.classList.add(...changes.add);
        }
    })
}

let currentAnimationDenominator = 2
let isStopping = false

// Start Spinner
function startSpinner() {
    if (playerTextContainer.childElementCount === 0) return

    clearInterval(currentSpinnerIntervalId)
    isStopping = false

    function adjustAndRunSpinner() {
        startIdleSpinner()
        if (currentAnimationDenominator < 60) currentAnimationDenominator += 2
        const intervalTime = (3 / currentAnimationDenominator) * 1000

        // Update animation duration
        const children = Array.from(playerTextContainer.children)
        children.forEach(child => {
            child.style.animationDuration = `${3 / currentAnimationDenominator}s`
        })

        clearInterval(currentSpinnerIntervalId)
        currentSpinnerIntervalId = setInterval(adjustAndRunSpinner, intervalTime)
    }

    // Start the first spinner loop
    currentSpinnerIntervalId = setInterval(adjustAndRunSpinner, (3 / currentAnimationDenominator) * 1000)
}

// Stop Spinner
async function stopSpinner() {
    clearInterval(currentSpinnerIntervalId)
    isStopping = true

    function slowDownSpinner() {
        startIdleSpinner()

        if (currentAnimationDenominator > 2) currentAnimationDenominator -= 2
        else {
            clearInterval(currentSpinnerIntervalId)
            return
        }

        const intervalTime = (3 / currentAnimationDenominator) * 1000

        // Update animation duration
        const children = Array.from(playerTextContainer.children)
        children.forEach(child => {
            child.style.animationDuration = `${3 / currentAnimationDenominator}s`
        })

        clearInterval(currentSpinnerIntervalId)
        currentSpinnerIntervalId = setInterval(slowDownSpinner, intervalTime)
    }

    // Start the slowing down loop
    currentSpinnerIntervalId = setInterval(slowDownSpinner, (3 / currentAnimationDenominator) * 1000)

    await sleep(9000)
    setWinner()
    await sleep(4000)
    setSpinner()
}

const winners = []

// Set winner for the display
const profileContainersEl = document.getElementById("profile-containers")
const osuBackgroundEl = document.getElementById("osu-background")

// Set winner
function setWinner() {
    // Whoever is player-4 at the time
    let player4 = document.querySelector('div[data-action="player-4"]')
    winners.push(player4.dataset.id)

    numberOfWinners = Math.min(winners.length, 2)
    for (let i = 0; i < numberOfWinners; i++) {
        // Find Winner
        const winnerPlayer = findPlayerUsingFind(winners[i])
        profileContainersEl.children[i].children[0].children[0].setAttribute("src", winnerPlayer.avatar_url)
        profileContainersEl.children[i].children[1].innerText = winnerPlayer.username
        profileContainersEl.children[i].style.display = "block"

        // Remove player from remaining players
        let index = remainingSpinnerPlayers.indexOf(winnerPlayer)
        if (index > -1) remainingSpinnerPlayers.splice(index, 1)
    }

    osuBackgroundEl.style.filter = "blur(81.5px)"
}