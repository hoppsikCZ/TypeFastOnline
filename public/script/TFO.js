let text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque mollis nec erat id pulvinar. Etiam nec aliquet ligula. Donec et odio scelerisque, accumsan orci eu, pulvinar augue. Nunc diam metus, suscipit at nisl pharetra, tincidunt ullamcorper dolor. Aliquam tincidunt porttitor tincidunt. Proin pretium molestie enim, sed vestibulum sapien imperdiet a. Morbi ultricies ornare dolor, sit amet rhoncus purus tempus id. Phasellus sollicitudin euismod tortor, in scelerisque est vulputate in. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Etiam at fringilla erat. Duis lobortis euismod dui sit amet vestibulum.'

loadText(text)

function loadText(textToLoad) {
    textToLoad.split(' ').forEach((word, wordIndex) => {
        $('#textDiv').append(`<div class="word" id="word-${wordIndex}"></div>`)
        for (let i = 0; i <= word.length; i++) {
            if (i === word.length) $(`#word-${wordIndex}`).append(`<span class="letter" id="letter-${wordIndex}-${i}">&nbsp;</span>`)
            else $(`#word-${wordIndex}`).append(`<span class="letter" id="letter-${wordIndex}-${i}">${word[i]}</span>`)
        }
    })

    $(`#letter-0-0`).addClass('caret')
}

let currentLetterIndex = 0
let currentWord = 0
let mistakes = 0
let control = false

$(document).on('keydown', (e) => {
    console.log(e.key)
    let currentLetter = $(`#letter-${currentWord}-${currentLetterIndex}`)
    if (!/^(.|Control|Backspace)$/.test(e.key)) {
        console.log('return')
        return
    }
    
    if (e.key === 'Control') {
        control = true
        return
    }

    if (e.key === 'Backspace') {
        if (control) {
            console.log(currentLetterIndex, currentWord)
            if (currentLetterIndex === 0 && currentWord !== 0 && mistakes === 0) {
                currentWord--
                currentLetterIndex = $(`#word-${currentWord}`).children().length - 1
            }

            while (mistakes > 0) {
                $(`#mistake-${mistakes - 1}`).remove()
                mistakes--
            }
            
            while (currentLetterIndex > 0) {
                currentLetterIndex--
                $(`#letter-${currentWord}-${currentLetterIndex}`).removeClass('passed')
            }

            currentLetterIndex = 0
        }
        else if (mistakes > 0) {
            $(`#mistake-${mistakes - 1}`).remove()
            mistakes--
        }
        else {
            if (currentLetterIndex === 0) {
                if (currentWord !== 0) 
                {
                    currentWord--
                    currentLetterIndex = $(`#word-${currentWord}`).children().length - 1
                }
            }
            else {
                currentLetterIndex--
                $(`#letter-${currentWord}-${currentLetterIndex}`).removeClass('passed')
            }
        }
    }
    else if ((e.key === currentLetter.text() || (e.key === ' ' && currentLetter.text() == " ")) && mistakes === 0){
        currentLetter.addClass('passed')
        currentLetterIndex++
        if (currentLetterIndex === $(`#word-${currentWord}`).children().length) {
            currentWord++
            currentLetterIndex = 0
        }
    }
    else {
        currentLetter.before(`<span class="letter mistake" id="mistake-${mistakes}">${e.key === ' ' ? "&nbsp;" : e.key}</span>`)
        mistakes++
    }

    $(".caret").removeClass('caret')
    $(`#letter-${currentWord}-${currentLetterIndex}`).addClass('caret')
})

$(document).on('keyup', (e) => {
    if (e.key === 'Control') control = false
})