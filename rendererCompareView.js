/// Import dependencies
// Local dependencies
const Choice = require('./choice.js')

// Buttons
const nextButton = document.getElementById('button-next')
const previousButton = document.getElementById('button-previous')

// Image
const image = document.getElementById('image')

// Update the color of the choice button
const setChoice = function (question, choice) {
  // Clear currently selected choice button (if one is selected)
  clearRatings(question)

  // Get the color for the choice button
  if (question && choice) {
    let color
    switch (choice) {
      case Choice.A:
        color = 'blue'
        break
      case Choice.B:
        color = 'green'
        break
    }
    const button = document.querySelector('.button.choice.' + question + '.' + choice)
    button.classList.add(color)
  }
}

// Clear rating button selection
const clearRatings = function (question) {
  document.querySelectorAll('.button.rating.' + question).forEach(ratingButton => {
    ratingButton.classList.remove('red', 'orange', 'yellow', 'olive', 'green')
  })
}

// Update image
const setImage = function (imagePath) {
  image.src = imagePath
}

// Enable/Disable buttons
const enableNextButton = function () {
  if (!isNextButtonEnabled()) {
    nextButton.classList.remove('disabled')
    nextButton.classList.add('primary')
  }
}

const disableNextButton = function () {
  if (isNextButtonEnabled()) {
    nextButton.classList.remove('primary')
    nextButton.classList.add('disabled')
  }
}

const enablePreviousButton = function () {
  if (!isPreviousButtonEnabled()) {
    previousButton.classList.remove('disabled')
    previousButton.classList.add('grey')
  }
}

const disablePreviousButton = function () {
  if (isPreviousButtonEnabled()) {
    previousButton.classList.remove('green')
    previousButton.classList.add('disabled')
  }
}

// Button status
const isNextButtonEnabled = function () {
  return !nextButton.classList.contains('disabled')
}

const isPreviousButtonEnabled = function () {
  return !previousButton.classList.contains('disabled')
}

// Exports
module.exports = {
  nextButton: nextButton,
  previousButton: previousButton,
  setChoice: setChoice,
  clearRatings: clearRatings,
  setImage: setImage,
  enableNextButton: enableNextButton,
  disableNextButton: disableNextButton,
  enablePreviousButton: enablePreviousButton,
  disablePreviousButton: disablePreviousButton,
  isNextButtonEnabled: isNextButtonEnabled,
  isPreviousButtonEnabled: isPreviousButtonEnabled
}
