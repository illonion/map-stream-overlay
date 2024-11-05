const chatEl = document.getElementById("chat")
const badgeTypes = ["broadcaster", "mod", "vip", "founder", "subscriber"]

// Set up bright twitch colours
let twitchColours = []

ComfyJS.onChat = ( user, message, flags, self, extra ) => {

    // Get rid of nightbot messages
    if (user === "Nightbot") return

    // Set up message container
    const twitchChatMessageContainer = document.createElement("div")
    twitchChatMessageContainer.classList.add("chatMessageContainer")
    twitchChatMessageContainer.setAttribute("id", extra.id)
    twitchChatMessageContainer.setAttribute("data-twitch-id", extra.userId)

    // Check if twitch colours is empty, of if the extra.userId is in the twitch Colours
    let currentChatter = twitchColours.find(item => item.userId === extra.userId)
    let currentColour
    if (currentChatter) {
        currentColour = `rgb(${currentChatter.r},${currentChatter.g},${currentChatter.b})`
    } else {
        // Make new chatter colour
        const newChatter = {
            userId: extra.userId,
            r: Math.floor(Math.random() * (255 - 127 + 1)) + 127,
            g: Math.floor(Math.random() * (255 - 127 + 1)) + 127,
            b: Math.floor(Math.random() * (255 - 127 + 1)) + 127
        }
        currentColour = `rgb(${newChatter.r},${newChatter.g},${newChatter.b})`
        twitchColours.push(newChatter)
    }

    // Message user
    const messageUser = document.createElement("div")
    messageUser.classList.add("messageUser")
    messageUser.style.color = currentColour
    messageUser.innerText = `${user}:`

    // Message
    const chatMessage = document.createElement("div")
    chatMessage.classList.add("chatMessage")
    chatMessage.innerText = message

    // Append everything together
    twitchChatMessageContainer.append(messageUser, chatMessage)
    chatEl.append(twitchChatMessageContainer)
    chatEl.scrollTop = chatEl.scrollHeight
}

// Delete message
ComfyJS.onMessageDeleted = (id, extra) => document.getElementById(id).remove()

// Timeout
ComfyJS.onTimeout = ( timedOutUsername, durationInSeconds, extra ) => deleteAllMessagesFromUser(extra.timedOutUserId)

// Ban
ComfyJS.onBan = (bannedUsername, extra) => deleteAllMessagesFromUser(extra.bannedUserId)

// Delete all messages from user
function deleteAllMessagesFromUser(twitchId) {
    const allTwitchChatMessages = Array.from(document.getElementsByClassName("twitchChatMessage"))
    allTwitchChatMessages.forEach((message) => {
        if (message.dataset.twitchId === twitchId) {
            message.remove()
        }
    })
}

ComfyJS.Init( "map_osu" )