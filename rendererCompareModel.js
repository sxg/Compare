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

// Choose an image
const chooseImage = function (userState, question, choice) {
  // Set the choice in the user state
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

// Save the image choices to a CSV file
const save = function (savePath, name, imageChoices) {
  const filePath = path.join(savePath, getFileName(name, '.csv'))
  const fields = ['imagePath', 'imageName', 'q1Choice', 'q2Choice', 'q3Choice', 'q4Choice', 'q5Choice']
  const fieldNames = ['Image Path', 'Image Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  const imageChoicesClone = _.cloneDeep(imageChoices)
  const data = _.map(imageChoicesClone, imageChoice => {
    // TODO: Update serialization of choices to CSV file
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

    // Map the file names to objects with metadata
    const mappedImages = _.map(fileNames, fileName => {
      const matches = (/(bSSFP|MOLLI|MRF) ((T1|T2) (.+)).png/g).exec(fileName)
      return { fileName: fileName, mapId: matches[2] }
    })

    // Pair the file names by the ID and type of map
    let pairedFileNames = _.groupBy(mappedImages, 'mapId')

    // 1. Convert the object into an arary
    // 2. Map each pair of images to just the shuffled file names
    // 3. Shuffle the total order
    pairedFileNames = _.shuffle(_.map(_.values(pairedFileNames), pair => {
      return _.shuffle([pair[0].fileName, pair[1].fileName])
    }))

    // Initialize the image choices
    imageChoices = _.map(pairedFileNames, pair => {
      const filePathA = path.join(imagesPath, pair[0])
      const filePathB = path.join(imagesPath, pair[1])
      return {
        imageAPath: filePathA,
        imageBPath: filePathB,
        imageAName: path.basename(filePathA, '.png'),
        imageBName: path.basename(filePathB, '.png'),
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
const hasNext = function (userState, imageChoices) {
  return (userState.currentImageChoiceIndex >= 0 && userState.currentImageChoiceIndex < imageChoices.length)
}

// Move to the next image
const next = function (userState, imageChoices) {
  imageChoices = storeUserState(userState, imageChoices)
  userState.currentImageChoiceIndex++
  return loadUserState(userState, imageChoices)
}

// Bool value of whether there was a previous image to rate
const hasPrevious = function (userState, imageChoices) {
  return (userState.currentImageChoiceIndex >= 1 && userState.currentImageChoiceIndex < imageChoices.length)
}

// Move to the previous image
const previous = function (userState, imageChoices) {
  imageChoices = storeUserState(userState, imageChoices)
  userState.currentImageChoiceIndex--
  return loadUserState(userState, imageChoices)
}

// Get the image path of the current image
const getImagePath = function (userState, imageChoices) {
  return imageChoices[userState.currentImageChoiceIndex].imagePath
}

// Exports
module.exports = {
  chooseImage: chooseImage,
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
  return 'ImageChoices-' + sanitize(name) + extension
}

// Create a new user state
const createUserState = function () {
  return {
    currentImageChoiceIndex: -1,
    q1Choice: null,
    q2Choice: null,
    q3Choice: null,
    q4Choice: null,
    q5Choice: null
  }
}

// Save the user state in the image choices
const storeUserState = function (userState, imageChoices) {
  // Copy keys in the user state to the current image choices object
  const i = userState.currentImageChoiceIndex
  if (i >= 0 && i < imageChoices.length) {
    Object.keys(userState).forEach(userStateKey => {
      if (imageChoices[i].hasOwnProperty(userStateKey)) {
        imageChoices[i][userStateKey] = userState[userStateKey]
      }
    })
  }

  return imageChoices
}

// Load the user state from the image choices
const loadUserState = function (userState, imageChoices) {
  // Load the user state from the image choices object
  const i = userState.currentImageChoiceIndex
  if (i >= 0 && i < imageChoices.length) {
    Object.keys(imageChoices[i]).forEach(imageChoiceKey => {
      if (userState.hasOwnProperty(imageChoiceKey)) {
        userState[imageChoiceKey] = imageChoices[i][imageChoiceKey]
      }
    })
  }

  return userState
}
