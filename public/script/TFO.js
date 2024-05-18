let text = 'Kniha strom měsíc káva deštník hory auto kočka písnička květina čokoláda moře letadlo brýle dech hodiny cesta zámek bouřka pláž sníh počítač kabelka les pes telefon most víno dům vlak.'
loadText(text)

function loadText(textToLoad) {
    textToLoad.split(' ').forEach((word, wordIndex) => {
        $('#text-div').append(`<div class="word" id="word-${wordIndex}"></div>`)
        for (let i = 0; i <= word.length; i++) {
            if (i === word.length) $(`#word-${wordIndex}`).append(`<span class="letter" id="letter-${wordIndex}-${i}">&nbsp;</span>`)
            else $(`#word-${wordIndex}`).append(`<span class="letter" id="letter-${wordIndex}-${i}">${word[i]}</span>`)
        }
    })

    $(`#letter-0-0`).addClass('caret')
}

let currentLetterIndex = 0
let currentWord = 0
let totalMistakes = 0
let currentMistakes = 0
let control = false
let typing = false
let charCount = 0
let deletedCount = 0
let startTime

$(document).on('keydown', (e) => {
    let currentLetter = $(`#letter-${currentWord}-${currentLetterIndex}`)
    if (!/^(.|Control|Backspace|Escape)$/.test(e.key)) {
        return
    }
    
    if (e.key === 'Control') {
        control = true
        return
    }

    if (e.key === 'Escape') { 
        if (typing) stopTyping()
        return
    }
    
    if (!typing) {
        starTypingt()
    }
    
    if (e.key === 'Backspace') {
        if (control) {
            console.log(currentLetterIndex, currentWord)
            if (currentLetterIndex === 0 && currentWord !== 0 && currentMistakes === 0) {
                currentWord--
                currentLetterIndex = $(`#word-${currentWord}`).children().length - 1
                deletedCount++
            }

            while (currentMistakes > 0) {
                $(`#mistake-${currentMistakes - 1}`).remove()
                currentMistakes--
            }
            
            while (currentLetterIndex > 0) {
                currentLetterIndex--
                $(`#letter-${currentWord}-${currentLetterIndex}`).removeClass('passed')
                deletedCount++
            }

            currentLetterIndex = 0
        }
        else if (currentMistakes > 0) {
            $(`#mistake-${currentMistakes - 1}`).remove()
            currentMistakes--
        }
        else {
            if (currentLetterIndex === 0) {
                if (currentWord !== 0) 
                {
                    currentWord--
                    currentLetterIndex = $(`#word-${currentWord}`).children().length - 1

                    deletedCount++
                }
            }
            else {
                currentLetterIndex--
                $(`#letter-${currentWord}-${currentLetterIndex}`).removeClass('passed')
                deletedCount++
            }
        }
    }
    else if ((e.key === currentLetter.text() || (e.key === ' ' && currentLetter.text() == " ")) && currentMistakes === 0){
        currentLetter.addClass('passed')
        currentLetterIndex++
        if (currentLetterIndex === $(`#word-${currentWord}`).children().length) {
            currentWord++
            currentLetterIndex = 0
        }

        charCount++
    }
    else {
        currentLetter.before(`<span class="letter mistake" id="mistake-${currentMistakes}">${e.key === ' ' ? "&nbsp;" : e.key}</span>`)
        currentMistakes++
    }

    $(".caret").removeClass('caret')
    if (currentWord === $('#text-div').children().length - 1 && currentLetterIndex === $(`#word-${currentWord}`).children().length - 1) {
        showStats()
        stopTyping()
    }
    else
        $(`#letter-${currentWord}-${currentLetterIndex}`).addClass('caret')

    updateWPM()
})

$(document).on('keyup', (e) => {
    if (e.key === 'Control') control = false
})

function showStats() {
    $('#modal-time').text(Math.floor(getTimeMillis() / 1000) + "." + Math.floor((getTimeMillis() % 1000) / 10) + "s")
    $('#modal-wpm').text(getWPM())
    $('#modal-mistakes').text(currentMistakes)
    $('#modal-chars').text(charCount)
    $('#stats').modal('show')
}

function resetStats() {
    totalMistakes = 0
    currentMistakes = 0
    charCount = 0
    deletedCount = 0
    $('#time').text(0)
    $('#wpm').text(0)
}

let timer

function stopTyping() {
    resetStats()

    $('#text-div').empty()
    loadText(text)
    currentLetterIndex = 0
    currentWord = 0
    currentMistakes = 0
    control = false

    $('header').fadeIn()
    $('footer').fadeIn()

    typing = false
    clearInterval(timer)
}

function starTypingt() { 
    resetStats()

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

function getTimeMillis() {
    return Date.now() - startTime
}

function getWPM() {
    let time = (Date.now() - startTime) / 1000
    let wpm = Math.round((charCount - deletedCount) / 5 / time * 60)
    return time > 0.1 ? wpm : 60
}