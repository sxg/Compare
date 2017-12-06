// Import Electron components
const {remote, ipcRenderer} = require('electron')
const {dialog, BrowserWindow} = remote

// Import Node dependencies
const _ = require('lodash')
const path = require('path')
const fs = require('fs')
const url = require('url')

/// Helpers
const showError = function (container) {
  container.classList.add('error')
}

const hideErrors = function () {
  imagesContainer.classList.remove('error')
}

const enableRateImagesButton = function () {
  rateImagesButton.classList.remove('disabled')
}

/// View
// Window
let window = remote.getCurrentWindow()

// Input
const imagesInput = document.getElementById('input-images')

// Button
const imagesButton = document.getElementById('button-images')
const rateImagesButton = document.getElementById('button-rate-images')

// Input container
const imagesContainer = document.getElementById('container-images')

/// Model
let imagesPath

/// UI Actions
// Browse folder with images
imagesButton.addEventListener('click', event => {
  hideErrors()
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
    filePaths => {
      if (filePaths && filePaths[0]) {
        enableRateImagesButton()
        imagesPath = filePaths[0]
        let files = fs.readdirSync(filePaths[0])

        // Display the selected folder path in the input box
        imagesInput.value = filePaths[0]

        // Remove all non .png files
        _.remove(files, file => {
          return path.extname(file) !== '.png'
        })
        // Shuffle the order of the image files
        files = _.shuffle(files)
      } else if (!imagesPath) {
        showError(imagesContainer)
      }
    })
})

// Navigate to rating images
rateImagesButton.addEventListener('click', event => {
  hideErrors()

  // Send messagee to main process
  ipcRenderer.send('Message-ImagesPath', {imagesPath: imagesPath})

  // Close the main window
  window.close()
  window = null
})
