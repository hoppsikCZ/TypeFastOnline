const socket = io();
console.log(nickname)

$(document).ready(() => {
    socket.emit('join room', { room: serverData.room, name: serverData.nickname });   
    console.log('joined room')
})

let text

let players = []

function stopTyping() {
    socket.emit('update info', { wpm: getWPM(), progress: 100 });
    $('#status').text('Well done!')
    typingReady = false
    control = false

    $('header').fadeIn()
    $('footer').fadeIn()

    typing = false
    clearInterval(timer)
}

function starTyping() {
    currentLetterIndex = 0
    currentWordIndex = 0
    resetStats()
    $("#basic-info").animate({opacity: 1}, 400)

    typing = true
    $('header').fadeOut()
    $('footer').fadeOut()
    
    $('#status').text('Type!')

    startTime = Date.now()

    timer = setInterval(() => {
        $('#time').text(Math.round((getTimeMillis()) / 1000))
        updateWPM()
    }, 1000)
}

socket.on('start game', (data) => {
    typingReady = true
    text = data.text
    loadText(text)
    starTyping()
})

socket.on('update players', (data) => {
    players = data.players
    players.sort((a, b) => b.wpm - a.wpm)
    $('#players').empty()
    players.forEach((player, i) => {
        if (i > 2) 
            return;
        $('#players').append(`<li>${player.name} - ${player.wpm} WPM ${Math.floor(player.progress)}%</li>`)
    })
})

socket.on('end game', (data) => {
    $('#status').text('Waiting for other players...')
    showStats()
})

function updateWPM() {
    let wpm = getWPM()
    $('#wpm').text(wpm)
    socket.emit('update info', { wpm: wpm, progress: $('.passed').length / $('.letter').length * 100 });
    console.log($('.passed').length / $('.letter').length * 100)
}