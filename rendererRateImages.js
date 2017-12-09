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
const rateImage = function (rating) {
  // Save the rating
  imageRatings.push({
    imageName: getCurrentImage().imageName,
    imagePath: getCurrentImage().imagePath,
    rating: rating
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

  if (filePaths.length !== 0) {
    // Get the next image
    setCurrentImage(filePaths.shift())
  } else {
    // Save the image ratings to a CSV file
    const fields = ['imageName', 'imagePath', 'rating']
    const fieldNames = ['Image Name', 'Image Path', 'Rating']
    const imageRatingsCSV = json2csv({ data: imageRatings, fields: fields, fieldNames: fieldNames })
    fs.writeFileSync('ImageRatings.csv', imageRatingsCSV, function (err) {
      if (err) {
        console.error(new Error(err))
      }
    })
  }
}

const setCurrentImage = function (imagePath) {
  image.src = imagePath
  currentImage = {
    imagePath: imagePath,
    imageName: path.basename(imagePath, '.png')
  }
}

const getCurrentImage = function () {
  return currentImage
}

/// View
// Image
const image = document.getElementById('image')

// Buttons
const rateOneButton = document.getElementById('1')
const rateTwoButton = document.getElementById('2')
const rateThreeButton = document.getElementById('3')
const rateFourButton = document.getElementById('4')
const rateFiveButton = document.getElementById('5')

/// Model
let imageRatings
const userState = {
  currentImageRatingIndex: 0,
  q1Rating: null,
  q2Rating: null,
  q3Rating: null,
  q4Rating: null,
  q5Rating: null
}

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
  setCurrentImage(filePaths.shift())
})

/// UI Actions
// Rating buttons
rateOneButton.addEventListener('click', event => { rateImage(1) })
rateTwoButton.addEventListener('click', event => { rateImage(2) })
rateThreeButton.addEventListener('click', event => { rateImage(3) })
rateFourButton.addEventListener('click', event => { rateImage(4) })
rateFiveButton.addEventListener('click', event => { rateImage(5) })

// Key bindings for rating buttons
Mousetrap.bind('1', event => { rateImage(1) })
Mousetrap.bind('2', event => { rateImage(2) })
Mousetrap.bind('3', event => { rateImage(3) })
Mousetrap.bind('4', event => { rateImage(4) })
Mousetrap.bind('5', event => { rateImage(5) })
