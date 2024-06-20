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
    $('#status').text('Well done! Waiting for other palayers to finish')
    typingReady = false
    control = false

    $('header').fadeIn()
    $('footer').fadeIn()

    typing = false
    clearInterval(timer)
}

function starTyping() {
    startTime = Date.now() + 5000

    $('#status').text('Get Ready...')

    $("#basic-info").animate({opacity: 1}, 400)

    $('header').fadeOut()
    $('footer').fadeOut()

    currentLetterIndex = 0
    currentWordIndex = 0
    resetStats()

    $('#time').text(-5)

    timer = setInterval(() => {
        let time = (getTimeMillis()) / 1000

        $('#time').text(Math.round(time))
        updateWPM()

        if (!typing && time >= 0) {
            typing = true

            $('#status').text('Type!')
        }
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