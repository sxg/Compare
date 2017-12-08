/// Import dependencies
// Electron components
const {ipcRenderer} = require('electron')

// Node dependencies
const Mousetrap = require('mousetrap')
const fs = require('fs')
const path = require('path')
const _ = require('lodash')

/// Helpers
const rateImage = function (rating) {
  console.log(rating + ' out of 5!')
  // TODO: save rating
  // TODO: load next image
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
let filePaths

ipcRenderer.on('Message-ImagesPath', (event, data) => {
  // Get all .png filePaths
  let fileNames = fs.readdirSync(data.imagesPath)
  _.remove(fileNames, filePath => {
    return path.extname(filePath) !== '.png'
  })
  // Shuffle the order of the images
  fileNames = _.shuffle(fileNames)
  // Add the directory path to the file names
  filePaths = _.map(fileNames, (fileName) => {
    return path.join(data.imagesPath, fileName)
  })

  // Load the first image
  image.src = filePaths.shift()
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
