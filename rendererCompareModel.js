/// Import dependencies
// Electron components
const {app} = require('electron').remote

// Node dependencies
const path = require('path')
const fs = require('fs')
const json2csv = require('json2csv')
const _ = require('lodash')
const sanitize = require('sanitize-filename')

// Local dependencies
const Question = require('./question.js')

// Select an image
const selectImage = function (userState, question, choice) {
  // Set the rating in the user state
  const questionChoiceKey = question + 'Choice'
  userState[questionChoiceKey] = choice
  return userState
}

// Get the enum for the current question
const getCurrentQuestion = function (userState) {
  if (userState.q1Choice === null) {
    return Question.Q1
  } else if (userState.q2Choice === null) {
    return Question.Q2
  } else if (userState.q3Choice === null) {
    return Question.Q3
  } else if (userState.q4Choice === null) {
    return Question.Q4
  } else {
    return Question.Q5
  }
}

// Bool value of whether all questions have been answered
const didAnswerAllQuestions = function (userState) {
  if (userState.q1Choice &&
  userState.q2Choice &&
  userState.q3Choice &&
  userState.q4Choice &&
  userState.q5Choice) {
    return true
  } else {
    return false
  }
}

// Save the image ratings to a CSV file
const save = function (savePath, name, imageChoices) {
  const filePath = path.join(savePath, getFileName(name, '.csv'))
  const fields = ['imagePath', 'imageName', 'q1Choice', 'q2Choice', 'q3Choice', 'q4Choice', 'q5Choice']
  const fieldNames = ['Image Path', 'Image Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  const imageChoicesClone = _.cloneDeep(imageChoices)
  const data = _.map(imageChoicesClone, imageChoice => {
    imageChoice.q1Choice = (/r([1-5])/g).exec(imageChoice.q1Choice)[1]
    imageChoice.q2Choice = (/r([1-5])/g).exec(imageChoice.q2Choice)[1]
    imageChoice.q3Choice = (/r([1-5])/g).exec(imageChoice.q3Choice)[1]
    imageChoice.q4Choice = (/r([1-5])/g).exec(imageChoice.q4Choice)[1]
    imageChoice.q5Choice = (/r([1-5])/g).exec(imageChoice.q5Choice)[1]
    return imageChoice
  })
  const imageChoicesCSV = json2csv({ data: data, fields: fields, fieldNames: fieldNames })
  fs.writeFile(filePath, imageChoicesCSV, err => {
    if (err) {
      console.error(new Error(err))
    } else {
      // Delete the JSON file
      const jsonFileName = getFileName(name, '.json')
      const jsonFilePath = path.join(app.getPath('appData'), app.getName(), jsonFileName)
      if (fs.existsSync(jsonFilePath)) {
        fs.unlinkSync(jsonFilePath)
      }
    }
  })
}

// Save progress to a JSON file
const saveProgress = function (savePath, name, imageChoices) {
  const fileName = getFileName(name, '.json')
  const filePath = path.join(app.getPath('appData'), app.getName(), fileName)
  fs.writeFile(filePath, JSON.stringify(imageChoices), 'utf8', err => {
    if (err) {
      console.error(new Error(err))
    }
  })
}

// Load the image choices from a CSV file or create a new image choices object
const load = function (name, imagesPath) {
  const fileName = getFileName(name, '.json')
  const filePath = path.join(app.getPath('appData'), app.getName(), fileName)
  let imageChoices
  if (fs.existsSync(filePath)) {
    imageChoices = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } else {
    // Get all .png filePaths
    let fileNames = fs.readdirSync(imagesPath)
    _.remove(fileNames, fileName => {
      return path.extname(fileName) !== '.png'
    })
    // Shuffle the order of the images
    fileNames = _.shuffle(fileNames)

    // Initialize the image choices
    imageChoices = _.map(fileNames, fileName => {
      const filePath = path.join(imagesPath, fileName)
      return {
        imagePath: filePath,
        imageName: path.basename(filePath, '.png'),
        q1Choice: null,
        q2Choice: null,
        q3Choice: null,
        q4Choice: null,
        q5Choice: null
      }
    })
  }

  return {
    userState: createUserState(),
    imageChoices: imageChoices
  }
}

// Bool value of whether the user is done choosing all images
const isDone = function (imageChoices) {
  return _.every(imageChoices, 'q1Choice', 'q2Choice', 'q3Choice', 'q4Choice', 'q5Choice')
}

// Bool value of whether there is another image to choose
const hasNext = function (userState, imageRatings) {
  return (userState.currentImageRatingIndex >= 0 && userState.currentImageRatingIndex < imageRatings.length)
}

// Move to the next image
const next = function (userState, imageRatings) {
  imageRatings = storeUserState(userState, imageRatings)
  userState.currentImageRatingIndex++
  return loadUserState(userState, imageRatings)
}

// Bool value of whether there was a previous image to rate
const hasPrevious = function (userState, imageRatings) {
  return (userState.currentImageRatingIndex >= 1 && userState.currentImageRatingIndex < imageRatings.length)
}

// Move to the previous image
const previous = function (userState, imageRatings) {
  imageRatings = storeUserState(userState, imageRatings)
  userState.currentImageRatingIndex--
  return loadUserState(userState, imageRatings)
}

// Get the image path of the current image
const getImagePath = function (userState, imageRatings) {
  return imageRatings[userState.currentImageRatingIndex].imagePath
}

// Exports
module.exports = {
  rateImage: rateImage,
  getCurrentQuestion: getCurrentQuestion,
  didAnswerAllQuestions: didAnswerAllQuestions,
  next: next,
  hasNext: hasNext,
  previous: previous,
  hasPrevious: hasPrevious,
  isDone: isDone,
  getImagePath: getImagePath,
  save: save,
  saveProgress: saveProgress,
  load: load
}

/// Private Helpers
// Create a file name with a given extension
const getFileName = function (name, extension) {
  return 'ImageRatings-' + sanitize(name) + extension
}

// Create a new user state
const createUserState = function () {
  return {
    currentImageRatingIndex: -1,
    q1Rating: null,
    q2Rating: null,
    q3Rating: null,
    q4Rating: null,
    q5Rating: null
  }
}

// Save the user state in the image ratings
const storeUserState = function (userState, imageRatings) {
  // Copy keys in the user state to the current image rating object
  const i = userState.currentImageRatingIndex
  if (i >= 0 && i < imageRatings.length) {
    Object.keys(userState).forEach(userStateKey => {
      if (imageRatings[i].hasOwnProperty(userStateKey)) {
        imageRatings[i][userStateKey] = userState[userStateKey]
      }
    })
  }

  return imageRatings
}

// Load the user state from the image ratings
const loadUserState = function (userState, imageRatings) {
  // Load the user state from the image rating
  const i = userState.currentImageRatingIndex
  if (i >= 0 && i < imageRatings.length) {
    Object.keys(imageRatings[i]).forEach(imageRatingKey => {
      if (userState.hasOwnProperty(imageRatingKey)) {
        userState[imageRatingKey] = imageRatings[i][imageRatingKey]
      }
    })
  }

  return userState
}
