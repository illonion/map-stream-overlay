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
let allBeatmaps;
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
        const sideBarMappoolButton = document.createElement("button")
        sideBarMappoolButton.classList.add("side-bar-button", "side-bar-mappool-button")
        sideBarMappoolButton.setAttribute("data-id", allBeatmaps[i].beatmapID)
        sideBarMappoolButton.addEventListener("mousedown", mapClickEvent)
        sideBarMappoolButton.addEventListener("contextmenu", function(event) {event.preventDefault()})
        sideBarMappoolButton.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        sideBarMappoolEl.append(sideBarMappoolButton)
    }

    // Set tb map info directly
    const tbMap = findMapInMappool(2109961)
    tbCardMapIndividual.children[1].style.backgroundImage = `url(${tbMap.imgURL})`
    tbCardMapIndividual.children[4].children[0].innerText = tbMap.songName
    tbCardMapIndividual.children[4].children[1].innerText = tbMap.artist
    tbCardMapIndividual.children[6].children[0].innerText = tbMap.mapper
    tbCardMapIndividual.children[7].children[0].innerText = `${Math.round(Number(tbMap.difficultyrating) * 100) / 100}*`
}
getMappool()
const findMapInMappool = beatmapId => allBeatmaps.find(beatmap => beatmap.beatmapID == beatmapId)

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
    const map = findMapInMappool(this.dataset.id)
    if (!map) return

    // Make map card
    const mapCard = document.createElement("div")
    mapCard.classList.add("map-card")
    
    // Pick Image
    const pickImage = document.createElement("img")
    pickImage.setAttribute("src", `static/${team === "red" ? "left" : "right"}-pick.png`)

    // Map Card Background
    const mapCardBackground = document.createElement("div")
    mapCardBackground.classList.add("map-card-background")
    mapCardBackground.style.backgroundImage = `url("${map.imgURL}")`

    // Map Details
    const mapDetails = document.createElement("div")
    mapDetails.classList.add("map-details")
    // Song Name
    const songName = document.createElement("div")
    songName.classList.add("song-name")
    songName.innerText = map.songName
    // Song Artist
    const songArtist = document.createElement("div")
    songArtist.classList.add("song-artist")
    songArtist.innerText = map.artist
    mapDetails.append(songName, songArtist)

    // Mod ID
    const modId = document.createElement("div")
    modId.classList.add("mod-id")
    modId.classList.add(`mod-id-${map.mod.toLowerCase()}`)
    // Mod Mask
    const modMask = document.createElement("img")
    modMask.classList.add("mod-mask")
    modMask.setAttribute("src", "static/mask.png")
    // Mod Text
    const modText = document.createElement("div")
    modText.classList.add("mod-text")
    modText.innerText = `${map.mod.toUpperCase()}${map.order}`
    modId.append(modMask, modText)

    // Song Mapper
    const songMapper = document.createElement("div")
    songMapper.classList.add("song-mapper")
    // Song Mapper Name
    const songMapperName = document.createElement("span")
    songMapperName.classList.add("map-detail-lime-bold")
    songMapperName.innerText = map.mapper
    songMapper.append("mapped by ", songMapperName)

    // Star Rating
    const starRating = document.createElement("div")
    starRating.classList.add("star-rating")
    // Star Rating Number
    const starRatingNumber = document.createElement("span")
    starRatingNumber.classList.add("map-detail-lime-bold")
    starRatingNumber.innerText = `${Math.round(Number(map.difficultyrating) * 100) / 100}`
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