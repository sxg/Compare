/// Import dependencies
// Electron components
const {ipcRenderer, remote} = require('electron')

// Node dependencies
const Mousetrap = require('mousetrap')
const _ = require('lodash')
const path = require('path')
const url = require('url')

// Local dependencies
const View = require('./rendererCompareView.js')
const Model = require('./rendererCompareModel.js')
const Question = require('./question.js')
const Choice = require('./choice.js')

/// Model
let imageChoices
let savePath
let name
let userState

// Initialization
ipcRenderer.on('Message-Setup', (event, data) => {
  // Set the user's name and CSV save path and initialize the model
  name = data.name
  savePath = data.savePath
  const loadedData = Model.load(name, data.imagesPath)
  userState = loadedData.userState
  imageChoices = loadedData.imageChoices

  loadChoiceButtons()

  // Load the first image
  next()
})

/// Controller
// Choose an image
const selectImage = function (userState, question, choice) {
  // Set the choice in the model
  userState = Model.selectImage(userState, question, choice)

  // Select the choice button
  View.setChoice(question, choice)

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

// Go to the previous image
const selectPrevious = function () {
  if (View.isPreviousButtonEnabled()) {
    previous()
  }
}

// Select choice buttons from the user state
const loadChoiceButtons = function () {
  // Erase all choice button selections
  Question.All.forEach(question => {
    View.clearChoices(question)
  })

  // Load user state choice button selections
  Question.All.forEach(question => {
    const choiceKey = question + 'Choice'
    View.setChoice(question, userState[choiceKey])
  })
}

// Move to the next question
const next = function () {
  // Update the model
  userState = Model.next(userState, imageChoices)

  // If the user is done choosing all images
  if (Model.isDone(imageChoices)) {
    // Save the image choices to a CSV file
    Model.save(savePath, name, imageChoices)

    // Load the done screen
    remote.getCurrentWindow().loadURL(url.format({
      pathname: path.join(__dirname, 'done.html'),
      protocol: 'file:',
      slashes: true
    }))
  } else {
    loadChoiceButtons()

    // Set the image
    View.setImageA(Model.getImageAPath(userState, imageChoices))
    View.setImageB(Model.getImageBPath(userState, imageChoices))

    // Check if the previous button should be enabled
    if (Model.hasPrevious(userState, imageChoices)) {
      View.enablePreviousButton()
    } else {
      View.disablePreviousButton()
    }

    // Check if the next button should be enabled
    if (Model.hasNext(userState, imageChoices) && Model.didAnswerAllQuestions(userState)) {
      View.enableNextButton()
    } else {
      View.disableNextButton()
    }
  }
}

// Move to the previous question
const previous = function () {
  // Update the model
  userState = Model.previous(userState, imageChoices)
  loadChoiceButtons()

  // Set the image
  View.setImage(Model.getImagePath(userState, imageChoices))

  // Check if the next button should be enabled
  if (Model.hasNext(userState, imageChoices) && Model.didAnswerAllQuestions(userState)) {
    View.enableNextButton()
  } else {
    View.disableNextButton()
  }

  // Check if the previous button should be enabled
  if (Model.hasPrevious(userState, imageChoices)) {
    View.enablePreviousButton()
  } else {
    View.disablePreviousButton()
  }
}

// Choice buttons
document.querySelectorAll('.button.choice').forEach(choiceButton => {
  const question = _.intersection(choiceButton.classList, Question.All)[0]
  const choice = _.intersection(choiceButton.classList, [Choice.All])[0]
  choiceButton.addEventListener('click', event => {
    selectImage(userState, question, choice)
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
  // Save the image choices to a JSON file
  Model.saveProgress(savePath, name, imageChoices)
})

/// Key bindings
// Rate current question as 1
// Mousetrap.bind('1', event => {
//   selectImage(userState, Model.getCurrentQuestion(userState), Choice.A)
// })
// // Rate current question as 2
// Mousetrap.bind('2', event => {
//   selectImage(userState, Model.getCurrentQuestion(userState), Choice.B)
// })

// // Go to next image
// Mousetrap.bind(['enter', 'space', 'right', 'n'], event => {
//   selectNext()
// })
// // Go to previous image
// Mousetrap.bind(['left', 'b', 'p'], event => {
//   selectPrevious()
// })
