const delay = async time => new Promise(resolve => setTimeout(resolve, time));

// Load osu! api
let osuApi
async function getApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}

// Create socket
const socket = createTosuWsSocket()

// TB card map idnividual
const tbCardMapIndividual = document.getElementById("tb-card-map-individual")

// Fetch data with Fetch API
const sideBarMappoolEl = document.getElementById("side-bar-mappool")
let currentBestOf = 0, currentFirstTo = 0, currentLeftStars = 0, currentRightStars = 0, currentBanCount = 0, currentTotalActions = 0;
let allBeatmaps = [], allBeatmapsJson = []
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json");
    const responseJson = await response.json();
    allBeatmaps = responseJson.beatmaps;

    // Set best of and first to
    switch (responseJson.roundName) {
        case "ROUND OF 32": case "ROUND OF 16":
            currentBestOf = 9; currentBanCount = 2; break;
        case "QUARTERFINALS": case "SEMIFINALS":
            currentBestOf = 11; currentBanCount = 2; break;
        case "FINALS": case "GRAND FINALS":
            currentBestOf = 13; currentBanCount = 3; break;
    }
    currentFirstTo = Math.ceil(currentBestOf / 2);
    
    createStarDisplay();

    // Put all actions in there
    currentTotalActions = currentFirstTo + currentBanCount
    for (let i = 0; i < currentTotalActions * 2; i++) {
        createPanels(i % 2 === 0? "red" : "blue")
    }

    // Create side bar mappool buttons
    sideBarMappoolEl.innerHTML = ""
    for (let i = 0; i < allBeatmaps.length; i++) {
        // Set mod number
        let modNumber = 0
        if (allBeatmaps[i].mod === "HR") modNumber = 16
        else if (allBeatmaps[i].mod === "DT") modNumber = 64
        
        // Get API response
        const response = await fetch("https://corsproxy.io/?" + encodeURIComponent(`https://osu.ppy.sh/api/get_beatmaps?k=${osuApi}&b=${allBeatmaps[i].beatmapId}&mods=${modNumber}`))
        await delay(1000)
        let responseJson = await response.json()
        allBeatmapsJson.push(responseJson[0])

        const sideBarMappoolButton = document.createElement("button")
        sideBarMappoolButton.classList.add("side-bar-button", "side-bar-mappool-button")
        sideBarMappoolButton.setAttribute("data-id", allBeatmaps[i].beatmapId)
        sideBarMappoolButton.addEventListener("mousedown", mapClickEvent)
        sideBarMappoolButton.addEventListener("contextmenu", function(event) {event.preventDefault()})
        sideBarMappoolButton.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        sideBarMappoolEl.append(sideBarMappoolButton)
    }

    // Set tb map info directly
    const tbMap = findMapInAllBeatmapsJson(allBeatmaps[allBeatmaps.length - 1].beatmapId)
    console.log(tbMap)
    tbCardMapIndividual.children[1].style.backgroundImage = `url(https://assets.ppy.sh/beatmaps/${tbMap.beatmapset_id}/covers/cover.jpg)`
    tbCardMapIndividual.children[4].children[0].innerText = tbMap.title
    tbCardMapIndividual.children[4].children[1].innerText = tbMap.artist
    tbCardMapIndividual.children[6].children[0].innerText = tbMap.creator
    tbCardMapIndividual.children[7].children[0].innerText = `${Math.round(Number(tbMap.difficultyrating) * 100) / 100}*`
}

const findMapInAllBeatmaps = beatmapId => allBeatmaps.find(beatmap => beatmap.beatmapId == beatmapId)
const findMapInAllBeatmapsJson = beatmapId => allBeatmapsJson.find(beatmap => beatmap.beatmap_id == beatmapId)

// Create all panels
function createPanels(team) {
    // Make map card
    const mapCard = document.createElement("div")
    mapCard.classList.add("map-card")
    
    // Pick Image
    const pickImage = document.createElement("img")
    pickImage.setAttribute("src", `static/${team === "red" ? "left" : "right"}-pick.png`)

    // Map Card Background
    const mapCardBackground = document.createElement("div")
    mapCardBackground.classList.add("map-card-background")
    mapCardBackground.style.backgroundImage = `url("")`

    // Map Details
    const mapDetails = document.createElement("div")
    mapDetails.classList.add("map-details")
    // Song Name
    const songName = document.createElement("div")
    songName.classList.add("song-name")
    // Song Artist
    const songArtist = document.createElement("div")
    songArtist.classList.add("song-artist")
    mapDetails.append(songName, songArtist)

    // Mod ID
    const modId = document.createElement("div")
    modId.classList.add("mod-id")
    // Mod Mask
    const modMask = document.createElement("img")
    modMask.classList.add("mod-mask")
    modMask.setAttribute("src", "static/mask.png")
    // Mod Text
    const modText = document.createElement("div")
    modText.classList.add("mod-text")
    modId.append(modMask, modText)

    // Song Mapper
    const songMapper = document.createElement("div")
    songMapper.classList.add("song-mapper")
    // Song Mapper Name
    const songMapperName = document.createElement("span")
    songMapperName.classList.add("map-detail-lime-bold")
    songMapper.append("mapped by ", songMapperName)

    // Star Rating
    const starRating = document.createElement("div")
    starRating.classList.add("star-rating")
    // Star Rating Number
    const starRatingNumber = document.createElement("span")
    starRatingNumber.classList.add("map-detail-lime-bold")
    starRating.append("star rating // ", starRatingNumber)

    // Map Card Action
    const mapCardAction = document.createElement("div")
    mapCardAction.classList.add("map-card-action")
    // Map Card Action Tasks
    const mapActionText = document.createElement("div")

    mapCardAction.append(mapActionText)
    mapCard.append(pickImage, mapCardBackground, mapDetails, modId, songMapper, starRating, mapCardAction)
    mapCard.style.display = "none"
    
    const mappoolSectionElement = (team === "red")? mappoolSectionLeftEl : mappoolSectionRightEl
    mappoolSectionElement.append(mapCard)
}

// Create star display
const teamStarsContainerRightEl = document.getElementById("team-stars-container-right")
const teamStarsContainerLeftEl = document.getElementById("team-stars-container-left")
function createStarDisplay() {
    teamStarsContainerLeftEl.innerHTML = "";
    teamStarsContainerRightEl.innerHTML = "";
    let i = 0;
    for (i; i < currentLeftStars; i++) teamStarsContainerLeftEl.append(createStar(true, "left"));
    for (i; i < currentFirstTo; i++) teamStarsContainerLeftEl.append(createStar(false, "left"));
    i = 0;
    for (i; i < currentRightStars; i++) teamStarsContainerRightEl.append(createStar(true, "right"));
    for (i; i < currentFirstTo; i++) teamStarsContainerRightEl.append(createStar(false, "right"));

    // Create Star
    function createStar(fillStar, side) {
        const newStar = document.createElement("div");
        newStar.classList.add("team-star");
        if (fillStar) newStar.classList.add(side === "left"? "left-star" : "right-star");
        return newStar;
    }
}

// Initialise
async function initialise() {
    await getApi()
    await getTeams()
    await getMappool()
}
initialise()

// Map Click Event
const mappoolSectionEl = document.getElementById("mappool-section")
const mappoolSectionLeftEl = document.getElementById("mappool-section-left")
const mappoolSectionRightEl = document.getElementById("mappool-section-right")
let previousPickedTile
let currentPickedTile
function mapClickEvent(event) {
    // Team
    let team
    if (event.button === 0) team = "red"
    else if (event.button === 2) team = "blue"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"
    if (event.shiftKey) action = "protect"

    // Find map
    const allBeatmapsMap = findMapInAllBeatmaps(this.dataset.id)
    const allBeatmapsJsonMap = findMapInAllBeatmapsJson(this.dataset.id)

    console.log(this.dataset.id, allBeatmapsMap, allBeatmapsJsonMap)
    if (!allBeatmapsMap || !allBeatmapsJsonMap) return

    // Check which tile
    let currentTile
    if (team === "red") {
        for (let i = 0; i < mappoolSectionLeftEl.childElementCount; i++) {
            if (!mappoolSectionLeftEl.children[i].dataset.mappoolSectionId) {
                currentTile = mappoolSectionLeftEl.children[i]
                break
            }
        }
    } else {
        for (let i = 0; i < mappoolSectionRightEl.childElementCount; i++) {
            if (!mappoolSectionRightEl.children[i].dataset.mappoolSectionId) {
                currentTile = mappoolSectionRightEl.children[i]
                break
            }
        }
    }
    if (!currentTile) return

    // Set details of the tile
    currentTile.style.display = "block"
    currentTile.dataset.mappoolSectionId = allBeatmapsJsonMap.beatmap_id
    currentTile.children[1].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${allBeatmapsJsonMap.beatmapset_id}/covers/cover.jpg")`
    currentTile.children[2].children[0].innerText = allBeatmapsJsonMap.title
    currentTile.children[2].children[1].innerText = allBeatmapsJsonMap.artist
    currentTile.children[3].children[1].innerText = allBeatmapsMap.mod + allBeatmapsMap.order
    currentTile.children[4].children[0].innerText = allBeatmapsJsonMap.creator
    currentTile.children[5].children[0].innerText = `${Math.round(Number(allBeatmapsJsonMap.difficultyrating) * 100) / 100}`
    let mapActionText = currentTile.children[6].children[0]
    if (action === "pick") {
        mapActionText.classList.add("map-card-win-text")
        mapActionText.innerText = "WIN"
        currentTile.children[6].style.display = "none"
    } else if (action === "ban") {
        mapActionText.classList.add("map-card-ban-text", `map-card-colour-${team === "red"? "pink" : "blue"}`)
        mapActionText.innerText = "B&"
    } else if (action === "protect") {
        mapActionText.classList.add("map-card-ban-text", `map-card-colour-${team === "red"? "pink" : "blue"}`)
        mapActionText.innerText = "P#"
    }

    // Scroll the mappool section
    mappoolSectionEl.scrollTop = mappoolSectionEl.scrollHeight

    previousPickedTile = currentPickedTile
    currentPickedTile = currentTile
}

// Change first pick bans
const sideBannerContainerLeft = document.getElementById("side-banner-container-left")
const sideBannerContainerRight = document.getElementById("side-banner-container-right")
function changeFirstPickBans() {
    sideBannerContainerLeft.style.display = "none"
    sideBannerContainerRight.style.display = "none"

    // Get bans
    const selectedFirstBan = document.querySelector('input[name="first-ban"]:checked')
    sideBannerContainerLeft.children[0].style.display = "none"
    sideBannerContainerRight.children[0].style.display = "none"

    if (selectedFirstBan) {
        const selectedFirstBanValue = selectedFirstBan.value
        if (selectedFirstBanValue === "red-ban") {
            sideBannerContainerLeft.children[0].style.display = "block"
            sideBannerContainerLeft.style.display = "flex"
        } else if (selectedFirstBanValue === "blue-ban") {
            sideBannerContainerRight.children[0].style.display = "block"
            sideBannerContainerRight.style.display = "flex"
        }
    }

    // Get picks
    const selectedFirstPick = document.querySelector('input[name="first-pick"]:checked')
    sideBannerContainerLeft.children[1].style.display = "none"
    sideBannerContainerRight.children[1].style.display = "none"

    if (selectedFirstPick) {
        const selectedFirstPickValue = selectedFirstPick.value
        if (selectedFirstPickValue === "red-pick") {
            sideBannerContainerLeft.children[1].style.display = "block"
            sideBannerContainerLeft.style.display = "flex"
        } else if (selectedFirstPickValue === "blue-pick") {
            sideBannerContainerRight.children[1].style.display = "block"
            sideBannerContainerRight.style.display = "flex"
        }
    }
}
changeFirstPickBans()

setInterval(() => {
    currentLeftStars = Number(getCookie("currentLeftStars"))
    currentRightStars = Number(getCookie("currentRightStars"))
    createStarDisplay()

    // Set winner of map
    const winnerOfMap = getCookie("currentWinner")
    if (currentPickedTile && winnerOfMap !== "none" && winnerOfMap) {
        currentPickedTile.children[6].style.display = "block"
        if (winnerOfMap === "left") {
            currentPickedTile.children[6].children[1].classList.add("map-card-colour-pink")
        } else {
            currentPickedTile.children[6].children[1].classList.add("map-card-colour-blue")
        }
        document.cookie = "currentWinner=none; path=/"
    }

    // Set tiebreaker
    if (currentLeftStars + currentRightStars >= currentBestOf - 1 &&
        currentLeftStars >= currentFirstTo - 1 &&
        currentRightStars >= currentFirstTo - 1
    ) {
        previousPickedTile = currentPickedTile
        currentPickedTile = tbCardMapIndividual
        tbCardMapIndividual.style.display = "block"
    } else {
        currentPickedTile = previousPickedTile
        tbCardMapIndividual.style.display = "none"
    }

}, 200)

// Set pick
const sidebarNextAction = document.getElementById("sidebar-next-action")
let nextAutoPicker
function setNextPick(side) {
    sidebarNextAction.innerText = `${side.toUpperCase()} PICK`
    nextAutoPicker = side
}

// Toggle Autopick
const togglePick = document.getElementById("toggle-pick")
let isAutopick = false
function isAutopickFunction() {
    isAutopick = !isAutopick
    if (isAutopick) {
        togglePick.innerText = "Toggle Autopick: On"
    } else {
        togglePick.innerText = "Toggle Autopick: Off"
    }
}

// Team information
const leftTeamBanner = document.getElementById("left-team-banner")
const rightTeamBanner = document.getElementById("right-team-banner")
const leftTeamName = document.getElementById("left-team-name")
const rightTeamName = document.getElementById("right-team-name")
let currentLeftTeamPlayers = {}
let currentRightTeamPlayers = {}
let currentLeftTeamName, currentRightTeamName

// Player lists
const leftTeamPlayerList = document.getElementById("left-team-player-list")
const rightTeamPlayerList = document.getElementById("right-team-player-list")

// Load teams
let allTeams
async function getTeams() {
    const response = await fetch("../_data/teams.json");
    const responseJson = await response.json();
    allTeams = responseJson;
}
const findTeam = teamName => allTeams.find(team => team.team_name.trim() === teamName.trim())

// Map id and md5
let mapId, mapMd5
let leftTeamPlayerCount = 0
let rightTeamPlayerCount = 0
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team Data
    if (currentLeftTeamName !== data.tourney.manager.teamName.left.trim()) {
        currentLeftTeamName = data.tourney.manager.teamName.left.trim()
        leftTeamName.innerText = currentLeftTeamName
        currentLeftTeamPlayers = findTeam(currentLeftTeamName)
        if (currentLeftTeamPlayers) leftTeamBanner.setAttribute("src", currentLeftTeamPlayers.team_icon)
    }
    if (currentRightTeamName !== data.tourney.manager.teamName.right.trim()) {
        currentRightTeamName = data.tourney.manager.teamName.right.trim()
        rightTeamName.innerText = currentRightTeamName
        currentRightTeamPlayers = findTeam(currentRightTeamName)
        if (currentRightTeamPlayers) rightTeamBanner.setAttribute("src", currentRightTeamPlayers.team_icon)
    }
    
    if (mapId !== data.menu.bm.id || mapMd5 !== data.menu.bm.md5) {
        mapId = data.menu.bm.id
        mapMd5 = data.menu.bm.md5
        let element = document.querySelector(`[data-id="${mapId}"]`)
        let elementMapSelection = document.querySelector(`[data-map-selection-id="${mapId}"]`)

        // Click Event
        if (isAutopick && !elementMapSelection) {
            // Check if autopicked already
            if (!element.hasAttribute("data-is-autopicked") || element.getAttribute("data-is-autopicked") !== "true") {
                const event = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    view: window,
                    button: (nextAutoPicker === "left")? 0 : 2
                })
                element.dispatchEvent(event)
                element.setAttribute("data-is-autopicked", "true")

                if (nextAutoPicker === "left") {
                    setNextPick("right")
                } else if (nextAutoPicker === "right") {
                    setNextPick("left")
                }
            }
        }
    }

    // Set Icons
    leftTeamPlayerCount = 0
    rightTeamPlayerCount = 0
    for (let i = 0; i < data.tourney.ipcClients.length; i++) {
        let currentUserId = data.tourney.ipcClients[i].spectating.userID
        let currentTeam

        if (!currentLeftTeamPlayers || !currentRightTeamPlayers) continue

        // Find which team this player is a part of
        if (currentLeftTeamPlayers.player_ids.includes(currentUserId)) {
            currentTeam = "left"
        } else if (currentRightTeamPlayers.player_ids.includes(currentUserId)) {
            currentTeam = "right"
        }

        if (!currentTeam) continue

        // Set current child
        let currentChild
        if (currentTeam === "left" && leftTeamPlayerCount < 4) {
            currentChild = leftTeamPlayerList.children[leftTeamPlayerCount]
        } else if (currentTeam === "right" && rightTeamPlayerCount < 4) {
            currentChild = rightTeamPlayerList.children[rightTeamPlayerCount]
        }

        // If no child
        if (!currentChild) continue

        // Set attributes
        currentChild.children[0].setAttribute("src", `https://a.ppy.sh/${currentUserId}`)
        currentChild.children[1].innerText = data.tourney.ipcClients[i].spectating.name
    }

    for (let i = leftTeamPlayerCount; i < 4; i++) {
        leftTeamPlayerList.children[i].style.display = "none"
    }
    for (let i = rightTeamPlayerCount; i < 4; i++) {
        rightTeamPlayerList.children[i].style.display = "none"
    }
}

// Mappool Management Select
const sidebarMappoolSection = document.getElementById("sidebar-mappool-section")
let currentSidebarAction
function mappoolManagementSelect(element) {
    while (sidebarMappoolSection.childElementCount > 2) {
        sidebarMappoolSection.removeChild(sidebarMappoolSection.lastElementChild)
    }
    
    currentSidebarAction = element.value
    currentSidebarTeam = undefined
    currentSidebarTileNumber = undefined
    currentSidebarModId = undefined

    // Set and remove tile
    if (currentSidebarAction === "setTile" || currentSidebarAction === "removeTile") {
        // Which tile?
        const whichTileHeader = createHeader("tile")

        // Create Tile
        const tileContainer = document.createElement("div")
        tileContainer.classList.add("side-bar-tile-container")
        
        createTileOptions(mappoolSectionLeftEl, "R", tileContainer)
        createTileOptions(mappoolSectionRightEl, "B", tileContainer)

        sidebarMappoolSection.append(whichTileHeader, tileContainer)

        if (currentSidebarAction === "setTile") {
            // Which pick?
            const whichPickHeader = createHeader("pick")

            // Which pick container
            const whichPickConttainer = document.createElement("div")
            whichPickConttainer.classList.add("side-bar-tile-container")
            for (let i = 0; i < allBeatmaps.length; i++) {
                const button = document.createElement("button")
                button.classList.add("tile-mod-id-button")
                button.setAttribute("onclick", `selectModId(${allBeatmaps[i].beatmapId},this)`)
                button.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
                whichPickConttainer.append(button)
            }

            // Which action?
            const whichActionHeader = createHeader("action")

            // Which action container
            const setTileSelect = document.createElement("select")
            setTileSelect.classList.add("mappool-management-select")
            setTileSelect.setAttribute("id", "set-action-select")
            setTileSelect.setAttribute("size", 3)
            // Set Options
            setTileSelect.append(createSetOption('setProtect','Set Protect'))
            setTileSelect.append(createSetOption('setBan','Set Ban'))
            setTileSelect.append(createSetOption('setPick','Set Pick'))

            sidebarMappoolSection.append(whichPickHeader, whichPickConttainer, whichActionHeader, setTileSelect)
        }
    }

    if (currentSidebarAction === "setWinner" || currentSidebarAction === "removeWinner" ) {
        // Which tile?
        const whichTileHeader = createHeader("tile")

        // Create Tile
        const tileContainer = document.createElement("div")
        tileContainer.classList.add("side-bar-tile-container")
        createPickOnlyTileOption(mappoolSectionLeftEl, "R", tileContainer)
        createPickOnlyTileOption(mappoolSectionRightEl, "B", tileContainer)

        sidebarMappoolSection.append(whichTileHeader, tileContainer)

        if (currentSidebarAction === "setWinner") {
            // Which team?
            const whichTeamHeader = createHeader("team")

            // Create teams
            const setTeamSelect = document.createElement("select")
            setTeamSelect.classList.add("mappool-management-select")
            setTeamSelect.setAttribute("id", "set-team-select")
            setTeamSelect.setAttribute("size", 2)
            // Team Options
            setTeamSelect.append(createSetOption('red','Red'))
            setTeamSelect.append(createSetOption('blue','Blue'))

            sidebarMappoolSection.append(whichTeamHeader, setTeamSelect)
        }
    }

    // Apply changes button
    const applyChanges = document.createElement("button")
    applyChanges.classList.add("side-bar-button", "side-bar-full-length-button")
    applyChanges.innerText = "APPLY CHANGES"
    applyChanges.style.height = "calc(var(--side-bar-mappool-button-height) * 2)"

    switch (currentSidebarAction) {
        case "setTile":
            applyChanges.setAttribute("onclick", "setTile()")
            break
        case "removeTile":
            applyChanges.setAttribute("onclick", "removeTile()")
            break
        case "setWinner":
            applyChanges.setAttribute("onclick", "setWinner()")
            break
        case "removeWinner":
            applyChanges.setAttribute("onclick", "removeWinner()")
            break
    }

    sidebarMappoolSection.append(applyChanges)
}

// Create Header
function createHeader(text) {
    const header = document.createElement("div")
    header.classList.add("side-bar-title")
    header.innerText = `WHICH ${text.toUpperCase()}?`
    return header
}

// Create tile options
function createTileOptions(element, colour, tileContainer) {
    for (let i = 0; i < element.childElementCount; i++) {
        const button = document.createElement("button")
        button.classList.add("tile-action-button")
        button.setAttribute("onclick",`selectTile("${colour}",${i}, this)`)

        // Set text
        if (element.children[i].dataset.mappoolSectionId) {
            const action = element.children[i].children[6].children[0].innerText
            const text = element.children[i].children[3].children[1].innerText
            if (action === "P#") button.innerText = `${colour} P# ${text}`
            else if (action === "B&") button.innerText = `${colour} B& ${text}`
            else button.innerText = `${colour} Pi ${text}`
        } else button.innerText = `${colour} Act ${i + 1}`

        tileContainer.append(button)
    }
}

// Create pick only tile options
function createPickOnlyTileOption(element, colour, tileContainer) {
    for (let i = 0; i < element.childElementCount; i++) {
        // Get action
        const action = element.children[i].children[6].children[0].innerText
        if (!element.children[i].dataset.mappoolSectionId || action === "P#" || action === "B&") continue

        // Create button
        const button = document.createElement("button")
        button.classList.add("tile-action-button")
        button.setAttribute("onclick",`selectTile("${colour}",${i}, this)`)

        // Set text
        const text = element.children[i].children[3].children[1].innerText
        button.innerText = `${colour} Pi ${text}`

        tileContainer.append(button)
    }
}

// Select tile button
const tileActionButtons = document.getElementsByClassName("tile-action-button")
let currentSidebarTeam, currentSidebarTileNumber
function selectTile(colour, number, element) {
    currentSidebarTeam = colour
    currentSidebarTileNumber = number

    for (let i = 0; i < tileActionButtons.length; i++) {
        tileActionButtons[i].style.backgroundColor = "transparent"
    }
    element.style.backgroundColor = "#CECECE"
}

// Create set option
function createSetOption(value, text) {
    const setOption = document.createElement("option")
    setOption.setAttribute("value", value)
    setOption.innerText = text
    return setOption
}

// Select Mod Id
const tileModIdButtons = document.getElementsByClassName("tile-mod-id-button")
let currentSidebarModId
function selectModId(modId, element) {
    currentSidebarModId = modId

    for (let i = 0; i < tileModIdButtons.length; i++) {
        tileModIdButtons[i].style.backgroundColor = "transparent"
    }
    element.style.backgroundColor = "#CECECE"
}

// Set tile
function setTile() {
    const setActionSelect = document.getElementById("set-action-select")
    if (!currentSidebarModId || !currentSidebarTeam || currentSidebarTileNumber === undefined || !setActionSelect.value) return

    // Find map and tile
    console.log(currentSidebarModId, currentSidebarTeam, currentSidebarTileNumber, setActionSelect.value)
    const currentMap = findMapInAllBeatmaps(currentSidebarModId)
    const currentMapJson = findMapInAllBeatmapsJson(currentSidebarModId)
    const currentTile = (currentSidebarTeam === "R")? mappoolSectionLeftEl.children[currentSidebarTileNumber] : mappoolSectionRightEl.children[currentSidebarTileNumber]
    
    // Apply information
    currentTile.style.display = "block"
    currentTile.dataset.mappoolSectionId = currentMapJson.beatmap_id
    currentTile.children[1].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMapJson.beatmapset_id}/covers/cover.jpg")`
    currentTile.children[2].children[0].innerText = currentMapJson.title
    currentTile.children[2].children[1].innerText = currentMapJson.artist
    currentTile.children[3].children[1].innerText = currentMap.mod + currentMap.order
    currentTile.children[4].children[0].innerText = currentMapJson.creator
    currentTile.children[5].children[0].innerText = `${Math.round(Number(currentMapJson.difficultyrating) * 100) / 100}`
    let mapActionText = currentTile.children[6].children[0]
    if (setActionSelect.value === "setPick") {
        mapActionText.classList.add("map-card-win-text")
        mapActionText.classList.remove("map-card-ban-text")
        mapActionText.innerText = "WIN"
        currentTile.children[6].style.display = "none"
    } else if (setActionSelect.value === "setBan") {
        mapActionText.classList.add("map-card-ban-text", `map-card-colour-${currentSidebarTeam === "R"? "pink" : "blue"}`)
        mapActionText.innerText = "B&"
        currentTile.children[6].style.display = "block"
    } else if (setActionSelect.value === "setProtect") {
        mapActionText.classList.add("map-card-ban-text", `map-card-colour-${currentSidebarTeam === "R"? "pink" : "blue"}`)
        mapActionText.innerText = "P#"
        currentTile.children[6].style.display = "block"
    }
}

// Remove Tile
function removeTile() {
    if (!currentSidebarTeam || currentSidebarTileNumber === undefined) return
    const currentTile = (currentSidebarTeam === "R")? mappoolSectionLeftEl.children[currentSidebarTileNumber] : mappoolSectionRightEl.children[currentSidebarTileNumber]

    // Apply information
    currentTile.style.display = "none"
    currentTile.removeAttribute("data-mappool-section-id")
}

// Set Winner
function setWinner() {
    const setTeamSelect = document.getElementById("set-team-select")
    if (!currentSidebarTeam || currentSidebarTileNumber === undefined || !setTeamSelect.value) return

    const currentTile = (currentSidebarTeam === "R")? mappoolSectionLeftEl.children[currentSidebarTileNumber] : mappoolSectionRightEl.children[currentSidebarTileNumber]
    currentTile.children[6].style.display = "block"
    currentTile.children[6].children[0].classList.add(`map-card-colour-${setTeamSelect.value === "red"? "pink" : "blue"}`)
}

// Remove winner
function removeWinner() {
    const setTeamSelect = document.getElementById("set-team-select")
    if (!currentSidebarTeam || currentSidebarTileNumber === undefined || !setTeamSelect.value) return

    const currentTile = (currentSidebarTeam === "R")? mappoolSectionLeftEl.children[currentSidebarTileNumber] : mappoolSectionRightEl.children[currentSidebarTileNumber]
    currentTile.children[6].style.display = "none"
}