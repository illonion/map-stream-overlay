const delay = async time => new Promise(resolve => setTimeout(resolve, time));

// Load osu! api
let osuApi
async function getApi() {
    const response = await fetch("../_data/osu-api.json")
    const responseJson = await response.json()
    osuApi = responseJson.api
}

// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!"); }
socket.onerror = error => console.log("Socket Error: ", error);

// TB card map idnividual
const tbCardMapIndividual = document.getElementById("tb-card-map-individual")

// Fetch data with Fetch API
const sideBarMappoolEl = document.getElementById("side-bar-mappool")
let currentBestOf = 0, currentFirstTo = 0, currentLeftStars = 0, currentRightStars = 0;
let allBeatmaps = [], allBeatmapsJson = []
async function getMappool() {
    const response = await fetch("../_data/beatmaps.json");
    const responseJson = await response.json();
    allBeatmaps = responseJson.beatmaps;

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
    await getMappool()
}
initialise()

// Map Click Event
const mappoolSectionEl = document.getElementById("mappool-section")
const mappoolSectionLeftEl = document.getElementById("mappool-section-left")
const mappoolSectionRightEl = document.getElementById("mappool-section-right")
let lastPickedTile
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

    // Make map card
    const mapCard = document.createElement("div")
    mapCard.classList.add("map-card")
    mapCard.dataset.mapSelectionId = this.dataset.id
    
    // Pick Image
    const pickImage = document.createElement("img")
    pickImage.setAttribute("src", `static/${team === "red" ? "left" : "right"}-pick.png`)

    // Map Card Background
    const mapCardBackground = document.createElement("div")
    mapCardBackground.classList.add("map-card-background")
    mapCardBackground.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${allBeatmapsJsonMap.beatmapset_id}/covers/cover.jpg")`

    // Map Details
    const mapDetails = document.createElement("div")
    mapDetails.classList.add("map-details")
    // Song Name
    const songName = document.createElement("div")
    songName.classList.add("song-name")
    songName.innerText = allBeatmapsJsonMap.title
    // Song Artist
    const songArtist = document.createElement("div")
    songArtist.classList.add("song-artist")
    songArtist.innerText = allBeatmapsJsonMap.artist
    mapDetails.append(songName, songArtist)

    // Mod ID
    const modId = document.createElement("div")
    modId.classList.add("mod-id")
    modId.classList.add(`mod-id-${allBeatmapsMap.mod.toLowerCase()}`)
    // Mod Mask
    const modMask = document.createElement("img")
    modMask.classList.add("mod-mask")
    modMask.setAttribute("src", "static/mask.png")
    // Mod Text
    const modText = document.createElement("div")
    modText.classList.add("mod-text")
    modText.innerText = `${allBeatmapsMap.mod.toUpperCase()}${allBeatmapsMap.order}`
    modId.append(modMask, modText)

    // Song Mapper
    const songMapper = document.createElement("div")
    songMapper.classList.add("song-mapper")
    // Song Mapper Name
    const songMapperName = document.createElement("span")
    songMapperName.classList.add("map-detail-lime-bold")
    songMapperName.innerText = allBeatmapsJsonMap.creator
    songMapper.append("mapped by ", songMapperName)

    // Star Rating
    const starRating = document.createElement("div")
    starRating.classList.add("star-rating")
    // Star Rating Number
    const starRatingNumber = document.createElement("span")
    starRatingNumber.classList.add("map-detail-lime-bold")
    starRatingNumber.innerText = `${Math.round(Number(allBeatmapsJsonMap.difficultyrating) * 100) / 100}`
    starRating.append("star rating // ", starRatingNumber)

    // Map Card Action
    const mapCardAction = document.createElement("div")
    mapCardAction.classList.add("map-card-action")
    // Map Card Action Tasks
    const mapActionText = document.createElement("div")
    if (action === "pick") {
        mapActionText.classList.add("map-card-win-text")
        mapActionText.innerText = "WIN"
        mapCardAction.style.display = "none"
    } else if (action === "ban") {
        mapActionText.classList.add("map-card-ban-text", `map-card-colour-${team === "red"? "pink" : "blue"}`)
        mapActionText.innerText = "B&"
    } else if (action === "protect") {
        mapActionText.classList.add("map-card-ban-text", `map-card-colour-${team === "red"? "pink" : "blue"}`)
        mapActionText.innerText = "P#"
    }
    mapCardAction.append(mapActionText)
    mapCard.append(pickImage, mapCardBackground, mapDetails, modId, songMapper, starRating, mapCardAction)
    
    const mappoolSectionElement = (team === "red")? mappoolSectionLeftEl : mappoolSectionRightEl
    mappoolSectionElement.append(mapCard)

    if (action === "pick") lastPickedTile = mapCard

    // Scroll the mappool section
    mappoolSectionEl.scrollTop = mappoolSectionEl.scrollHeight
}

// Change first pick bans
const sideBannerContainerLeft = document.getElementById("side-banner-container-left")
const sideBannerContainerRight = document.getElementById("side-banner-container-right")
function changeFirstPickBans() {
    // Get bans
    const selectedFirstBan = document.querySelector('input[name="first-ban"]:checked')
    sideBannerContainerLeft.children[0].style.display = "none"
    sideBannerContainerRight.children[0].style.display = "none"

    if (selectedFirstBan) {
        const selectedFirstBanValue = selectedFirstBan.value
        if (selectedFirstBanValue === "red-ban") {
            sideBannerContainerLeft.children[0].style.display = "block"
        } else if (selectedFirstBanValue === "blue-ban") {
            sideBannerContainerRight.children[0].style.display = "block"
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
        } else if (selectedFirstPickValue === "blue-pick") {
            sideBannerContainerRight.children[1].style.display = "block"
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
    if (lastPickedTile && winnerOfMap !== "none" && winnerOfMap) {
        lastPickedTile.children[6].style.display = "block"
        if (winnerOfMap === "left") {
            lastPickedTile.children[6].children[1].classList.add("map-card-colour-pink")
        } else {
            lastPickedTile.children[6].children[1].classList.add("map-card-colour-blue")
        }
        document.cookie = "currentWinner=none; path=/"
    }

    // Set tiebreaker
    if (currentLeftStars + currentRightStars >= currentBestOf - 1 &&
        currentLeftStars >= currentFirstTo - 1 &&
        currentRightStars >= currentFirstTo - 1
    ) {
        tbCardMapIndividual.style.display = "block"
    } else {
        tbCardMapIndividual.style.display = "none"
    }

}, 200)

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

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

// Map id
let mapId, mapMd5
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    
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
}