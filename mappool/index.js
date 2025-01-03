// Socket Events
// Credits: VictimCrasher - https://github.com/VictimCrasher/static/tree/master/WaveTournament
const socket = new ReconnectingWebSocket("ws://" + location.host + "/ws");
socket.onopen = () => console.log("Successfully Connected");
socket.onclose = event => { console.log("Socket Closed Connection: ", event); socket.send("Client Closed!"); }
socket.onerror = error => console.log("Socket Error: ", error);

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
        sideBarMappoolButton.innerText = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        sideBarMappoolEl.append(sideBarMappoolButton)
    }
}
getMappool();

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