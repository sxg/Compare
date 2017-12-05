// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const {remote} = require('electron')
const {dialog} = remote

/// View
// Window
const window = remote.getCurrentWindow()

// Button
const imagesButton = document.getElementById('button-images')

/// UI Actions
// Browse folder with images
imagesButton.addEventListener('click', event => {
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
  filePaths => {

  })
})
