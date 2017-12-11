// Import Electron components
const {remote, ipcRenderer} = require('electron')
const {dialog} = remote

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

const isRateImagesButtonEnabled = function () {
  return !rateImagesButton.classList.contains('disabled')
}

/// View
// Window
let window = remote.getCurrentWindow()

// Input
const nameInput = document.getElementById('input-name')
const imagesInput = document.getElementById('input-images')

// Button
const imagesButton = document.getElementById('button-images')
const rateImagesButton = document.getElementById('button-rate-images')

// Input container
const imagesContainer = document.getElementById('container-images')

/// Model
let name
let imagesPath

/// UI Actions
// Browse folder with images
imagesButton.addEventListener('click', event => {
  hideErrors()
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
    filePaths => {
      if (filePaths && filePaths[0]) {
        imagesPath = filePaths[0]
        imagesInput.value = imagesPath
        if (imagesPath && name) {
          enableRateImagesButton()
        }
      } else if (!imagesPath) {
        showError(imagesContainer)
      }
    })
})

// User's name
nameInput.addEventListener('change', event => {
  name = nameInput.value
  if (imagesPath && name) {
    enableRateImagesButton()
  }
})

// Navigate to rating images
rateImagesButton.addEventListener('click', event => {
  if (isRateImagesButtonEnabled()) {
    hideErrors()

    // Send messagee to main process
    const data = {
      imagesPath: imagesPath,
      name: name
    }
    ipcRenderer.send('Message-Setup', data)

    // Close the main window
    window.close()
    window = null
  }
})
