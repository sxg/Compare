/// Import dependencies
// Electron components
const {ipcRenderer} = require('electron')
const {app} = require('electron').remote

// Node dependencies
const Mousetrap = require('mousetrap')
const _ = require('lodash')
const json2csv = require('json2csv')
const sanitize = require('sanitize-filename')
const fs = require('fs')
const path = require('path')

/// Helpers
const rateImage = function (question, rating) {
  // Set the rating in the user state
  const questionRatingKey = question + 'Rating'
  userState[questionRatingKey] = rating

  // Check if the next button should be enabled
  if (didAnswerAllQuestions()) {
    enableNextButton()
  }
}

const didAnswerAllQuestions = function () {
  if (userState.q1Rating &&
  userState.q2Rating &&
  userState.q3Rating &&
  userState.q4Rating &&
  userState.q5Rating) {
    return true
  } else {
    return false
  }
}

const saveImageRatings = function () {
  const fileName = getFileName('.csv')
  const fields = ['imagePath', 'imageName', 'q1Rating', 'q2Rating', 'q3Rating', 'q4Rating', 'q5Rating']
  const fieldNames = ['Image Path', 'Image Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  const data = _.map(imageRatings, imageRating => {
    imageRating.q1Rating = (/r([1-5])/g).exec(imageRating.q1Rating)[1]
    imageRating.q2Rating = (/r([1-5])/g).exec(imageRating.q2Rating)[1]
    imageRating.q3Rating = (/r([1-5])/g).exec(imageRating.q3Rating)[1]
    imageRating.q4Rating = (/r([1-5])/g).exec(imageRating.q4Rating)[1]
    imageRating.q5Rating = (/r([1-5])/g).exec(imageRating.q5Rating)[1]
    return imageRating
  })
  const imageRatingsCSV = json2csv({ data: data, fields: fields, fieldNames: fieldNames })
  fs.writeFileSync(fileName, imageRatingsCSV, function (err) {
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
  // Load the user state from the image rating
  const i = userState.currentImageRatingIndex
  if (i >= 0 && i < imageRatings.length) {
    Object.keys(imageRatings[i]).forEach(imageRatingKey => {
      if (userState.hasOwnProperty(imageRatingKey)) {
        userState[imageRatingKey] = imageRatings[i][imageRatingKey]
      }
    })
  }
}

const setRatingButton = function (question, rating) {
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

const isNextButtonEnabled = function () {
  return !nextButton.classList.contains('disabled')
}

const isPreviousButtonEnabled = function () {
  return !previousButton.classList.contains('disabled')
}

const clearRatingButtons = function (question) {
  document.querySelectorAll('.button.rating.' + question).forEach(ratingButton => {
    ratingButton.classList.remove('red', 'orange', 'yellow', 'olive', 'green')
  })
}

const loadRatingButtons = function () {
  const questions = [Question.Q1, Question.Q2, Question.Q3, Question.Q4, Question.Q5]

  // Erase all rating button selections
  questions.forEach(question => {
    clearRatingButtons(question)
  })

  // Load user state rating button selections
  questions.forEach(question => {
    const questionRatingKey = question + 'Rating'
    setRatingButton(question, userState[questionRatingKey])
  })
}

const next = function () {
  // Store the user state
  storeUserState()
  // Update the user state for the next image
  userState.currentImageRatingIndex++
  loadUserState()
  loadRatingButtons()
  if (userState.currentImageRatingIndex === imageRatings.length - 1 || !didAnswerAllQuestions()) {
    disableNextButton()
  }

  if (userState.currentImageRatingIndex > 0) {
    enablePreviousButton()
  }

  // Get the next image if there is one
  if (userState.currentImageRatingIndex >= 0 && userState.currentImageRatingIndex < imageRatings.length) {
    image.src = imageRatings[userState.currentImageRatingIndex].imagePath
  } else {
    // Save the image ratings to a CSV file
    saveImageRatings()
  }
}

const previous = function () {
  // Store the user state
  storeUserState()
  // Update the user state for the previous image
  userState.currentImageRatingIndex--
  loadUserState()
  loadRatingButtons()
  if (userState.currentImageRatingIndex === 0) {
    disablePreviousButton()
  }

  if (userState.currentImageRatingIndex !== imageRatings.length - 1 && didAnswerAllQuestions()) {
    enableNextButton()
  }

  // Get the previous image
  image.src = imageRatings[userState.currentImageRatingIndex].imagePath
}

/// View
// Image
const image = document.getElementById('image')

// Buttons
const nextButton = document.getElementById('button-next')
const previousButton = document.getElementById('button-previous')

/// Model
let imageRatings
let name
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

const getFileName = function (extension) {
  return 'ImageRatings-' + sanitize(name) + extension
}

ipcRenderer.on('Message-Setup', (event, data) => {
  name = data.name
  // Get all .png filePaths
  let fileNames = fs.readdirSync(data.imagesPath)
  _.remove(fileNames, fileName => {
    return path.extname(fileName) !== '.png'
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
    clearRatingButtons(question)
    // Color the clicked button
    setRatingButton(question, rating)
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

// Previous button
previousButton.addEventListener('click', event => {
  if (isPreviousButtonEnabled()) {
    previous()
  }
})

// Quit the app
window.addEventListener('unload', event => {
  const fileName = getFileName('.json')
  const filePath = path.join(app.getPath('appData'), app.getName(), fileName)
  fs.writeFile(filePath, JSON.stringify(imageRatings), err => {
    if (err) {
      console.error(new Error(err))
    }
  })
})

// Key bindings for rating buttons
Mousetrap.bind('1', event => { rateImage(1) })
Mousetrap.bind('2', event => { rateImage(2) })
Mousetrap.bind('3', event => { rateImage(3) })
Mousetrap.bind('4', event => { rateImage(4) })
Mousetrap.bind('5', event => { rateImage(5) })
