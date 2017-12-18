/// Import dependencies
// Local dependencies
const Rating = require('./rating.js')

// Buttons
const nextButton = document.getElementById('button-next')
const previousButton = document.getElementById('button-previous')

// Image
const image = document.getElementById('image')

// Update the color of the rating button
const setRatingButton = function (question, rating) {
  // Clear currently selected rating button (if one is selected)
  clearRatingButtons(question)

  // Get the color for the rating button
  if (question && rating) {
    let color
    switch (rating) {
      case Rating.R1:
        color = 'red'
        break
      case Rating.R2:
        color = 'orange'
        break
      case Rating.R3:
        color = 'yellow'
        break
      case Rating.R4:
        color = 'olive'
        break
      case Rating.R5:
        color = 'green'
        break
    }
    const button = document.querySelector('.button.rating.' + question + '.' + rating)
    button.classList.add(color)
  }
}

// Clear rating button selection
const clearRatingButtons = function (question) {
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
  setRatingButton: setRatingButton,
  clearRatingButtons: clearRatingButtons,
  setImage: setImage,
  enableNextButton: enableNextButton,
  disableNextButton: disableNextButton,
  enablePreviousButton: enablePreviousButton,
  disablePreviousButton: disablePreviousButton,
  isNextButtonEnabled: isNextButtonEnabled,
  isPreviousButtonEnabled: isPreviousButtonEnabled
}
