// Import Electron components
const {remote, ipcRenderer} = require('electron')
const {dialog} = remote

/// Helpers
const showError = function (container) {
  container.classList.add('error')
}

const hideErrors = function () {
  imagesContainer.classList.remove('error')
  saveContainer.classList.remove('error')
}

const didMakeAllSelections = function () {
  return name && imagesPath && savePath
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
const saveInput = document.getElementById('input-save')

// Button
const imagesButton = document.getElementById('button-images')
const saveButton = document.getElementById('button-save')
const rateImagesButton = document.getElementById('button-rate-images')

// Input container
const imagesContainer = document.getElementById('container-images')
const saveContainer = document.getElementById('container-save')

/// Model
let name
let imagesPath
let savePath

/// UI Actions
// Browse folder with images
imagesButton.addEventListener('click', event => {
  hideErrors()
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
    filePaths => {
      if (filePaths && filePaths[0]) {
        imagesPath = filePaths[0]
        imagesInput.value = imagesPath
        if (didMakeAllSelections()) {
          enableRateImagesButton()
        }
      } else if (!imagesPath) {
        showError(imagesContainer)
      }
    })
})

saveButton.addEventListener('click', event => {
  hideErrors()
  dialog.showOpenDialog(window, {properties: ['openDirectory']},
    filePaths => {
      if (filePaths && filePaths[0]) {
        savePath = filePaths[0]
        saveInput.value = savePath
        if (didMakeAllSelections()) {
          enableRateImagesButton()
        }
      } else if (!savePath) {
        showError(saveContainer)
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
      name: name,
      imagesPath: imagesPath,
      savePath: savePath
    }
    ipcRenderer.send('Message-Setup', data)

    // Close the main window
    window.close()
    window = null
  }
})
