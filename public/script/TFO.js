function loadText(textToLoad) {
    $('#text-div').empty()
    console.log(textToLoad)
    textToLoad.forEach((word, wordIndex) => {
        $('#text-div').append(`<div class="word" id="word-${wordIndex}"></div>`)
        for (let i = 0; i <= word.length; i++) {
            if (i === word.length) $(`#word-${wordIndex}`).append(`<span class="letter" id="letter-${wordIndex}-${i}">&nbsp;</span>`)
            else $(`#word-${wordIndex}`).append(`<span class="letter" id="letter-${wordIndex}-${i}">${word[i]}</span>`)
        }
    })

    $(`#letter-0-0`).addClass('caret')
}

let currentLetterIndex = 0
let currentWordIndex = 0
let totalMistakes = 0
let currentMistakes = 0
let control = false
let typing = false
let charCount = 0
let deletedCount = 0
let startTime
let typingReady = true

$(document).on('keydown', (e) => {
    if (!typingReady) return

    let currentLetter = $(`#letter-${currentWordIndex}-${currentLetterIndex}`)
    if (!/^(.|Control|Backspace|Escape)$/.test(e.key)) {
        return
    }
    
    if (e.key === 'Control') {
        control = true
        return
    }

    if (e.key === 'Escape') {
        if (typing && !serverData.multiplayer) stopTyping()
        return
    }
    
    if (!typing) {
        starTyping()
    }
    
    if (e.key === 'Backspace') {
        backspace()
    }
    else if ((e.key === currentLetter.text() || (e.key === ' ' && currentLetter.text() == " ")) && currentMistakes === 0){
        currentLetter.addClass('passed')
        currentLetterIndex++
        if (currentLetterIndex === $(`#word-${currentWordIndex}`).children().length) {
            currentWordIndex++
            currentLetterIndex = 0
        }

        charCount++
    }
    else {
        if (currentMistakes === 0)
            splitCurrentWord()

        $(`#word-${currentWordIndex}`).before(`<div id="mistake-${currentMistakes}" class="word"><span class="letter mistake">${e.key === ' ' ? "&nbsp;" : e.key}</span></div>`)
        currentMistakes++
        totalMistakes++
    }

    $(".caret").removeClass('caret')
    if (currentWordIndex === $('#text-div').children().length - 1 && currentLetterIndex === $(`#word-${currentWordIndex}`).children().length - 1) {
        showStats()
        stopTyping()
        return
    }
    else
        $(`#letter-${currentWordIndex}-${currentLetterIndex}`).addClass('caret')

    updateWPM()
})

$(document).on('keyup', (e) => {
    if (e.key === 'Control') control = false
})

function splitCurrentWord() {
    if (currentLetterIndex === 0) return

    let word = $(`#word-${currentWordIndex}`)
    let letters = word.children()
    let split = $(`<div class="word" id="split"></div>`).insertBefore(word)
    for (let i = 0; i < currentLetterIndex; i++) {
        split.append($(letters[i]).detach())
    }
}

function joinCurrentWord() {
    let word = $(`#word-${currentWordIndex}`)
    let split = $('#split')
    let letters = split.children()
    for (let i = letters.length - 1; i >= 0; i--) {
        word.prepend($(letters[i]).detach())
    }
    split.remove()
}

function backspace() { 
    if (control) {
            
        console.log(currentLetterIndex, currentWordIndex)
        if (currentLetterIndex === 0 && currentWordIndex !== 0 && currentMistakes === 0) {
            currentWordIndex--
            currentLetterIndex = $(`#word-${currentWordIndex}`).children().length - 1
            deletedCount++
        }

        let letter = false;
        let startMistakes = currentMistakes
        let space = false
        while (currentMistakes > 0) {
            let nextMisEl = $(`#mistake-${currentMistakes - 1}`) 

            if (nextMisEl.text() !== ' ' && !letter)
            {
                letter = true
            }
            
            if (currentMistakes != startMistakes && nextMisEl.text() === ' ' && letter) {
                space = true
                break
            }
            nextMisEl.remove()
            currentMistakes--
        }
        

        while (currentLetterIndex > 0 && !space) {
            currentLetterIndex--
            $(`#letter-${currentWordIndex}-${currentLetterIndex}`).removeClass('passed')
            deletedCount++
        }

        if (currentMistakes === 0 && !space) 
            currentLetterIndex = 0
    }
    else if (currentMistakes > 0) {
        $(`#mistake-${currentMistakes - 1}`).remove()
        currentMistakes--
    }
    else {
        if (currentLetterIndex === 0) {
            if (currentWordIndex !== 0) 
            {
                currentWordIndex--
                currentLetterIndex = $(`#word-${currentWordIndex}`).children().length - 1

                deletedCount++
            }
        }
        else {
            currentLetterIndex--
            $(`#letter-${currentWordIndex}-${currentLetterIndex}`).removeClass('passed')
            deletedCount++
        }
    }

    if (currentMistakes === 0) {
        joinCurrentWord()
    }
}

function showStats() {
    $('#modal-time').text((getTimeMillis() / 1000).toFixed(2) + "s")
    $('#modal-wpm').text(getWPM())
    $('#modal-mistakes').text(totalMistakes)
    $('#modal-chars').text(charCount + deletedCount)
    $('#stats').modal('show')

    typingReady = false
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

function getTimeMillis() {
    return Date.now() - startTime
}

function getWPM() {
    let time = (Date.now() - startTime) / 1000
    if (time < 0.1)
        return 60
    let wpm = Math.round((charCount - deletedCount) / 5 / time * 60)
    return wpm
}