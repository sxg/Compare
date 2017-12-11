/// Import dependencies
// Electron components
const {ipcRenderer} = require('electron')

// Node dependencies
const Mousetrap = require('mousetrap')
const _ = require('lodash')
const json2csv = require('json2csv')
const fs = require('fs')
const path = require('path')

/// Helpers
const rateImage = function (question, rating) {
  // Parse the question and rating
  // `question` is like 'q1', 'q2', 'q3', etc.
  // `rating` is like 'r1', 'r2', 'r3', etc.
  const qMatch = (/q([1-5])/g).exec(question)
  const rMatch = (/r([1-5])/g).exec(rating)

  // Set the rating in the user state
  const qProperty = 'q' + String(qMatch[1]) + 'Rating'
  userState[qProperty] = parseInt(rMatch[1])

  // Check if the next button should be enabled
  if (userState.q1Rating &&
  userState.q2Rating &&
  userState.q3Rating &&
  userState.q4Rating &&
  userState.q5Rating) {
    enableNextButton()
  }
}

const saveImageRatings = function () {
  const fields = ['imagePath', 'imageName', 'q1Rating', 'q2Rating', 'q3Rating', 'q4Rating', 'q5Rating']
  const fieldNames = ['Image Path', 'Image Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  const imageRatingsCSV = json2csv({ data: imageRatings, fields: fields, fieldNames: fieldNames })
  fs.writeFileSync('ImageRatings.csv', imageRatingsCSV, function (err) {
    if (err) {
      console.error(new Error(err))
    }
  })
}

const storeUserState = function () {
  // Copy keys in the user state to the current image rating object
  const i = userState.currentImageRatingIndex
  if (i >= 0 && i < imageRatings.length) {
    Object.keys(userState).forEach(userStateKey => {
      if (imageRatings[i].hasOwnProperty(userStateKey)) {
        imageRatings[i][userStateKey] = userState[userStateKey]
      }
    })
  }
}

const loadUserState = function () {
  const i = userState.currentImageRatingIndex
  if (i >= 0 && i < imageRatings.length) {
    Object.keys(imageRatings[i]).forEach(imageRatingKey => {
      if (userState.hasOwnProperty(imageRatingKey)) {
        userState[imageRatingKey] = imageRatings[i][imageRatingKey]
      }
    })
  }
}

const setButtonRating = function (button, rating) {
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
  button.classList.add(color)
}

const enableNextButton = function () {
  if (!isNextButtonEnabled()) {
    nextButton.classList.remove('disabled')
    nextButton.classList.add('green')
  }
}

const disableNextButton = function () {
  if (isNextButtonEnabled()) {
    nextButton.classList.remove('green')
    nextButton.classList.add('disabled')
  }
}

const enablePreviousButton = function () {
  if (!isPreviousButtonEnabled()) {
    previousButton.classList.remove('disabled')
    previousButton.classList.add('green')
  }
}

const disablePreviousButton = function () {
  if (isPreviousButtonEnabled()) {
    previousButton.classList.remove('green')
    previousButton.classList.add('disabled')
  }
}

const isNextButtonEnabled = function () {
  return !nextButton.classList.contains('disabled')
}

const isPreviousButtonEnabled = function () {
  return !previousButton.classList.contains('disabled')
}

const resetRatingButtons = function (selector) {
  document.querySelectorAll(selector).forEach(ratingButton => {
    ratingButton.classList.remove('red', 'orange', 'yellow', 'olive', 'green')
  })
}

const next = function () {
  // Store the user state
  storeUserState()
  // Update the user state for the next image
  userState.currentImageRatingIndex++
  loadUserState()
  resetRatingButtons('.button.rating')
  disableNextButton()

  // Get the next image if there is one
  if (userState.currentImageRatingIndex < imageRatings.length) {
    image.src = imageRatings[userState.currentImageRatingIndex].imagePath
  } else {
    // Save the image ratings to a CSV file
    saveImageRatings()
  }
}

/// View
// Image
const image = document.getElementById('image')

// Buttons
const nextButton = document.getElementById('button-next')
const previousButton = document.getElementById('button-previous')

/// Model
let imageRatings
const userState = {
  currentImageRatingIndex: -1,
  q1Rating: null,
  q2Rating: null,
  q3Rating: null,
  q4Rating: null,
  q5Rating: null
}
const Question = Object.freeze({ Q1: 'q1', Q2: 'q2', Q3: 'q3', Q4: 'q4', Q5: 'q5' })
const Rating = Object.freeze({ R1: 'r1', R2: 'r2', R3: 'r3', R4: 'r4', R5: 'r5' })

ipcRenderer.on('Message-ImagesPath', (event, data) => {
  // Get all .png filePaths
  let fileNames = fs.readdirSync(data.imagesPath)
  _.remove(fileNames, filePath => {
    return path.extname(filePath) !== '.png'
  })
  // Shuffle the order of the images
  fileNames = _.shuffle(fileNames)

  // Initialize image ratings
  imageRatings = _.map(fileNames, fileName => {
    const filePath = path.join(data.imagesPath, fileName)
    return {
      imagePath: filePath,
      imageName: path.basename(filePath, '.png'),
      q1Rating: null,
      q2Rating: null,
      q3Rating: null,
      q4Rating: null,
      q5Rating: null
    }
  })

  // Load the first image
  next()
})

/// UI Actions
// Rating buttons
document.querySelectorAll('.button.rating').forEach(ratingButton => {
  const question = _.intersection(ratingButton.classList, [Question.Q1, Question.Q2, Question.Q3, Question.Q4, Question.Q5])[0]
  const rating = _.intersection(ratingButton.classList, [Rating.R1, Rating.R2, Rating.R3, Rating.R4, Rating.R5])[0]
  ratingButton.addEventListener('click', event => {
    // Remove color from all rating buttons for the answered question
    resetRatingButtons('.button.rating.' + question)
    // Color the clicked button
    setButtonRating(ratingButton, rating)
    // Store the rating in the user state
    rateImage(question, rating)
  })
})

// Next button
nextButton.addEventListener('click', event => {
  if (isNextButtonEnabled()) {
    next()
  }
})

// Key bindings for rating buttons
Mousetrap.bind('1', event => { rateImage(1) })
Mousetrap.bind('2', event => { rateImage(2) })
Mousetrap.bind('3', event => { rateImage(3) })
Mousetrap.bind('4', event => { rateImage(4) })
Mousetrap.bind('5', event => { rateImage(5) })
