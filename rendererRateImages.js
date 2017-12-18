/// Import dependencies
// Electron components
const {ipcRenderer, remote} = require('electron')
const {app} = remote

// Node dependencies
const Mousetrap = require('mousetrap')
const _ = require('lodash')
const fs = require('fs')
const path = require('path')
const url = require('url')

// Local dependencies
const View = require('./rendererRateImagesView.js')
const Model = require('./rendererRateImagesModel.js')
const Question = require('./question.js')
const Rating = require('./rating.js')

// Initialization
ipcRenderer.on('Message-Setup', (event, data) => {
  // Set the user's name and CSV save path and initialize the model
  name = data.name
  savePath = data.savePath
  const loadedData = Model.load(data.imagesPath)
  userState = loadedData.userState
  imageRatings = loadedData.imageRatings

  loadRatingButtons()

  // Load the first image
  next()
})

/// Controller
// Rate the current image
const selectRating = function (userState, question, rating) {
  // Set the rating in the model
  userState = Model.rateImage(userState, question, rating)

  // Select the rating button
  View.setRatingButton(question, rating)

  // Check if the next button should be enabled
  if (Model.didAnswerAllQuestions(userState)) {
    View.enableNextButton()
  }
}

// Go to the next image
const selectNext = function () {
  if (View.isNextButtonEnabled()) {
    next()
  }
}

const selectPrevious = function () {
  if (View.isPreviousButtonEnabled()) {
    previous()
  }
}

// Select rating buttons from the user state
const loadRatingButtons = function () {
  // Erase all rating button selections
  Question.All.forEach(question => {
    View.clearRatingButtons(question)
  })

  // Load user state rating button selections
  Question.All.forEach(question => {
    const questionRatingKey = question + 'Rating'
    View.setRatingButton(question, userState[questionRatingKey])
  })
}

// Move to the next question
const next = function () {
  // Increment the model
  userState = Model.next(userState, imageRatings)
  loadRatingButtons()

  // Get the next image if there is one
  if (Model.hasNext(userState, imageRatings)) {
    View.setImage(Model.getImagePath(userState, imageRatings))
    View.enableNextButton()
    if (Model.hasPrevious(userState, imageRatings)) {
      View.enablePreviousButton()
    } else {
      View.disablePreviousButton()
    }
  } else {
    // Save the image ratings to a CSV file
    Model.save(savePath, name, imageRatings)

    // Load the done screen
    remote.getCurrentWindow().loadURL(url.format({
      pathname: path.join(__dirname, 'done.html'),
      protocol: 'file:',
      slashes: true
    }))
  }
}

// Move to the previous question
const previous = function () {
  // Decrement the model
  userState = Model.previous(userState, imageRatings)
  loadRatingButtons()

  // Get the previous image
  if (Model.hasPrevious(userState, imageRatings)) {
    View.setImage(Model.getImagePath(userState, imageRatings))
    View.enablePreviousButton()
    if (Model.hasNext(userState, imageRatings)) {
      View.enableNextButton()
    } else {
      View.disableNextButton()
    }
  }
}

/// Model
let imageRatings
let savePath
let name
let userState

/// UI Actions
// Rating buttons
document.querySelectorAll('.button.rating').forEach(ratingButton => {
  const question = _.intersection(ratingButton.classList, [Question.Q1, Question.Q2, Question.Q3, Question.Q4, Question.Q5])[0]
  const rating = _.intersection(ratingButton.classList, [Rating.R1, Rating.R2, Rating.R3, Rating.R4, Rating.R5])[0]
  ratingButton.addEventListener('click', event => {
    selectRating(userState, question, rating)
  })
})

// Next button
View.nextButton.addEventListener('click', event => {
  selectNext()
})

// Previous button
View.previousButton.addEventListener('click', event => {
  selectPrevious()
})

// On quitting the app
window.addEventListener('unload', event => {
  // Save the image ratings to a JSON file
  const fileName = Model.getFileName('.json')
  const filePath = path.join(app.getPath('appData'), app.getName(), fileName)
  fs.writeFile(filePath, JSON.stringify(imageRatings), 'utf8', err => {
    if (err) {
      console.error(new Error(err))
    }
  })
})

/// Key bindings
// Rate current question as 1
Mousetrap.bind('1', event => {
  // Select the rating button
  selectRating(userState, Model.getCurrentQuestion(userState), Rating.R1)
})
// Rate current question as 2
Mousetrap.bind('2', event => {
  // Select the rating button
  selectRating(userState, Model.getCurrentQuestion(userState), Rating.R2)
})
// Rate current question as 3
Mousetrap.bind('3', event => {
  // Select the rating button
  selectRating(userState, Model.getCurrentQuestion(userState), Rating.R3)
})
// Rate current question as 4
Mousetrap.bind('4', event => {
  // Select the rating button
  selectRating(userState, Model.getCurrentQuestion(userState), Rating.R4)
})
// Rate current question as 5
Mousetrap.bind('5', event => {
  // Select the rating button
  selectRating(userState, Model.getCurrentQuestion(userState), Rating.R5)
})

// Go to next image
Mousetrap.bind(['enter', 'space', 'right', 'n'], event => {
  selectNext()
})
// Go to previous image
Mousetrap.bind(['left', 'b', 'p'], event => {
  selectPrevious()
})
