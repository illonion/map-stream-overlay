function registerSocketEventLoggers(socket) {
    socket.onopen = () => { console.log('Successfully Connected'); };
    socket.onclose = event => { console.log('Socket Closed Connection: ', event); socket.send('Client Closed!'); };
    socket.onerror = error => { console.log('Socket Error: ', error); };
}

function createTosuWsSocket(path = "/ws") {
    let socket = new ReconnectingWebSocket('ws://' + location.host + path);
    registerSocketEventLoggers(socket);
    return socket;
}

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