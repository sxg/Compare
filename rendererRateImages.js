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
  // Set the user's name and initialize the image ratings
  name = data.name
  savePath = data.savePath
  Model.loadImageRatings(data.imagesPath)
  Model.loadUserState()
  loadRatingButtons()

  // Load the first image
  next()
})

/// Controller
// Rate the current image
const rateImage = function (userState, question, rating) {
  // Set the rating in the model
  userState = Model.rateImage(userState, question, rating)

  // Check if the next button should be enabled
  if (Model.didAnswerAllQuestions()) {
    View.enableNextButton()
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
  userState = Model.next()
  loadRatingButtons()

  // Get the next image if there is one
  if (Model.hasNext()) {
    View.setImage(imageRatings[userState.currentImageRatingIndex].imagePath)
    View.enableNextButton()
    if (Model.hasPrevious()) {
      View.enablePreviousButton()
    } else {
      View.disablePreviousButton()
    }
  } else {
    // Save the image ratings to a CSV file
    Model.saveImageRatings(savePath, name, imageRatings)

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
  userState = Model.previous()
  loadRatingButtons()

  // Get the previous image
  if (Model.hasPrevious()) {
    View.setImage(imageRatings[userState.currentImageRatingIndex].imagePath)
    View.enablePreviousButton()
    if (Model.hasNext()) {
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
let userState = {
  currentImageRatingIndex: -1,
  q1Rating: null,
  q2Rating: null,
  q3Rating: null,
  q4Rating: null,
  q5Rating: null
}

/// UI Actions
// Rating buttons
document.querySelectorAll('.button.rating').forEach(ratingButton => {
  const question = _.intersection(ratingButton.classList, [Question.Q1, Question.Q2, Question.Q3, Question.Q4, Question.Q5])[0]
  const rating = _.intersection(ratingButton.classList, [Rating.R1, Rating.R2, Rating.R3, Rating.R4, Rating.R5])[0]
  ratingButton.addEventListener('click', event => {
    // Remove color from all rating buttons for the answered question
    View.clearRatingButtons(question)
    // Color the clicked button
    View.setRatingButton(question, rating)
    // Store the rating in the user state
    rateImage(question, rating)
  })
})

// Next button
View.nextButton.addEventListener('click', event => {
  if (View.isNextButtonEnabled()) {
    next()
  }
})

// Previous button
View.previousButton.addEventListener('click', event => {
  if (View.isPreviousButtonEnabled()) {
    previous()
  }
})

// Quit the app
window.addEventListener('unload', event => {
  const fileName = Model.getFileName('.json')
  const filePath = path.join(app.getPath('appData'), app.getName(), fileName)
  fs.writeFile(filePath, JSON.stringify(imageRatings), 'utf8', err => {
    if (err) {
      console.error(new Error(err))
    }
  })
})

// Key bindings for rating buttons
Mousetrap.bind('1', event => {
  // Remove color from all rating buttons for the answered question
  View.clearRatingButtons(Model.getCurrentQuestion(), Rating.R1)
  // Color the clicked button
  View.setRatingButton(Model.getCurrentQuestion(), Rating.R1)
  // Store the rating in the user state
  Model.rateImage(Model.getCurrentQuestion(), Rating.R1)
})
Mousetrap.bind('2', event => {
  // Remove color from all rating buttons for the answered question
  View.clearRatingButtons(Model.getCurrentQuestion(), Rating.R2)
  // Color the clicked button
  View.setRatingButton(Model.getCurrentQuestion(), Rating.R2)
  // Store the rating in the user state
  Model.rateImage(Model.getCurrentQuestion(), Rating.R2)
})
Mousetrap.bind('3', event => {
  // Remove color from all rating buttons for the answered question
  View.clearRatingButtons(Model.getCurrentQuestion(), Rating.R3)
  // Color the clicked button
  View.setRatingButton(Model.getCurrentQuestion(), Rating.R3)
  // Store the rating in the user state
  Model.rateImage(Model.getCurrentQuestion(), Rating.R3)
})
Mousetrap.bind('4', event => {
  // Remove color from all rating buttons for the answered question
  View.clearRatingButtons(Model.getCurrentQuestion(), Rating.R4)
  // Color the clicked button
  View.setRatingButton(Model.getCurrentQuestion(), Rating.R4)
  // Store the rating in the user state
  Model.rateImage(Model.getCurrentQuestion(), Rating.R4)
})
Mousetrap.bind('5', event => {
  // Remove color from all rating buttons for the answered question
  View.clearRatingButtons(Model.getCurrentQuestion(), Rating.R5)
  // Color the clicked button
  View.setRatingButton(Model.getCurrentQuestion(), Rating.R5)
  // Store the rating in the user state
  Model.rateImage(Model.getCurrentQuestion(), Rating.R5)
})

Mousetrap.bind(['enter', 'space', 'right', 'n'], event => {
  if (View.isNextButtonEnabled()) {
    next()
  }
})
Mousetrap.bind(['left', 'p'], event => {
  if (View.isPreviousButtonEnabled()) {
    previous()
  }
})
