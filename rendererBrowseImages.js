// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {remote} = require('electron')
const {dialog} = remote

const _ = require('lodash')
const path = require('path')

/// View
// Window
const window = remote.getCurrentWindow()

// Button
const imagesButton = document.getElementById('button-images')

// Input container
const imagesContainer = document.getElementById('container-images')

/// UI Actions
// Browse folder with images
imagesButton.addEventListener('click', event => {
  hideErrors()
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
    filePaths => {
      if (filePaths) {
        // Remove all non .png files
        _.remove(filePaths, filePath => {
          return path.extname(filePath) !== '.png'
        })
      } else {
        showError(imagesContainer)
      }
    })
})

/// Helpers
const showError = function (container) {
  container.classList.add('error')
}

const hideErrors = function () {
  imagesContainer.classList.remove('error')
}
