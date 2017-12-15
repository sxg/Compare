/// Import dependencies
// Electron components
const {app} = require('electron').remote

// Node dependencies
const path = require('path')
const fs = require('fs')
const json2csv = require('json2csv')
const _ = require('lodash')
const sanitize = require('sanitize')

// Local dependencies
const Question = require('./question.js')

const rateImage = function (userState, question, rating) {
  // Set the rating in the user state
  const questionRatingKey = question + 'Rating'
  userState[questionRatingKey] = rating
  return userState
}

const getCurrentQuestion = function (userState) {
  if (userState.q1Rating === null) {
    return Question.Q1
  } else if (userState.q2Rating === null) {
    return Question.Q2
  } else if (userState.q3Rating === null) {
    return Question.Q3
  } else if (userState.q4Rating === null) {
    return Question.Q4
  } else {
    return Question.Q5
  }
}

const didAnswerAllQuestions = function (userState) {
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

const saveImageRatings = function (savePath, name, imageRatings) {
  const filePath = path.join(savePath, getFileName(name, '.csv'))
  const fields = ['imagePath', 'imageName', 'q1Rating', 'q2Rating', 'q3Rating', 'q4Rating', 'q5Rating']
  const fieldNames = ['Image Path', 'Image Name', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5']
  const imageRatingsClone = _.cloneDeep(imageRatings)
  const data = _.map(imageRatingsClone, imageRating => {
    imageRating.q1Rating = (/r([1-5])/g).exec(imageRating.q1Rating)[1]
    imageRating.q2Rating = (/r([1-5])/g).exec(imageRating.q2Rating)[1]
    imageRating.q3Rating = (/r([1-5])/g).exec(imageRating.q3Rating)[1]
    imageRating.q4Rating = (/r([1-5])/g).exec(imageRating.q4Rating)[1]
    imageRating.q5Rating = (/r([1-5])/g).exec(imageRating.q5Rating)[1]
    return imageRating
  })
  const imageRatingsCSV = json2csv({ data: data, fields: fields, fieldNames: fieldNames })
  fs.writeFile(filePath, imageRatingsCSV, err => {
    if (err) {
      console.error(new Error(err))
    } else {
      // Delete the JSON file
      const jsonFileName = getFileName('.json')
      const jsonFilePath = path.join(app.getPath('appData'), app.getName(), jsonFileName)
      if (fs.existsSync(jsonFilePath)) {
        fs.unlinkSync(jsonFilePath)
      }
    }
  })
}

const loadImageRatings = function (imageRatings, imagesPath) {
  const fileName = getFileName('.json')
  const filePath = path.join(app.getPath('appData'), app.getName(), fileName)
  if (fs.existsSync(filePath)) {
    imageRatings = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } else {
    // Get all .png filePaths
    let fileNames = fs.readdirSync(imagesPath)
    _.remove(fileNames, fileName => {
      return path.extname(fileName) !== '.png'
    })
    // Shuffle the order of the images
    fileNames = _.shuffle(fileNames)

    // Initialize the image ratings
    imageRatings = _.map(fileNames, fileName => {
      const filePath = path.join(imagesPath, fileName)
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
  }
}

const next = function (userState, imageRatings) {
  storeUserState(userState, imageRatings)
  userState.currentImageRatingIndex++
  return loadUserState(userState, imageRatings)
}

// Exports
module.exports = {
  rateImage: rateImage,
  getCurrentQuestion: getCurrentQuestion,
  didAnswerAllQuestions: didAnswerAllQuestions,
  next: next,
  saveImageRatings: saveImageRatings,
  loadImageRatings: loadImageRatings
}

/// Private Helpers
// Create a file name with a given extension
const getFileName = function (name, extension) {
  return 'ImageRatings-' + sanitize(name) + extension
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
