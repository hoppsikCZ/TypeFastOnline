let wordCount = 20

fetchWords(wordCount).then(data => { textBuffer = data }).then(() => { loadText(textBuffer) })
renewBuffer()

async function fetchWords(count) {
    const response = await fetch(`https://random-word-api.vercel.app/api?words=${count}`);
    return await response.json();
}

function renewBuffer() {
    fetchWords(wordCount).then(data => { textBuffer = data})
}

function stopTyping() {
    $("#basic-info").animate({opacity: 0}, 400)
    resetStats()

    $('#text-div').empty()
    
    loadText(textBuffer)
    renewBuffer()
    currentLetterIndex = 0
    currentWordIndex = 0
    currentMistakes = 0
    control = false

    $('header').fadeIn()
    $('footer').fadeIn()

    typing = false
    clearInterval(timer)
}

function starTyping() { 
    resetStats()
    $("#basic-info").animate({opacity: 1}, 400)

    typing = true
    $('header').fadeOut()
    $('footer').fadeOut()
    
    startTime = Date.now()

    timer = setInterval(() => {
        $('#time').text(Math.round((getTimeMillis()) / 1000))
        updateWPM()
    }, 1000)
}

function updateWPM() {
    $('#wpm').text(getWPM())
}

$('#stats').on('hidden.bs.modal', () => {
    typingReady = true
})

$('#roomModal').on('shown.bs.modal', () => {
    typingReady = false
})

$('#roomModal').on('hidden.bs.modal', () => {
    typingReady = true
})