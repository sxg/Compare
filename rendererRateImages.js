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
const rateImage = function (question, rating) {
  // Parse the question and rating
  // `question` is like 'q1', 'q2', 'q3', etc.
  // `rating` is like 'r1', 'r2', 'r3', etc.
  const qMatch = (/q([1-5])/g).exec(question)
  const rMatch = (/r([1-5])/g).exec(rating)

  // Set the rating in the user state
  const qProperty = 'q' + String(qMatch[1]) + 'Rating'
  userState[qProperty] = String(rMatch[1])
}

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

const nextImage = function () {
  // Get the next image if there is one
  if (userState.currentImageRatingIndex !== imageRatings.length - 1) {
    userState.currentImageRatingIndex++
    const imageRating = imageRatings[userState.currentImageRatingIndex]
    image.src = imageRating.imagePath
    resetRatings()
  } else {
    // Save the image ratings to a CSV file
    saveImageRatings()
  }
}

/// View
// Image
const image = document.getElementById('image')

/// Model
let imageRatings
const userState = {
  currentImageRatingIndex: -1,
  q1Rating: null,
  q2Rating: null,
  q3Rating: null,
  q4Rating: null,
  q5Rating: null
}
const Question = {
  Q1: 'q1',
  Q2: 'q2',
  Q3: 'q3',
  Q4: 'q4',
  Q5: 'q5'
}
Object.freeze(Question)
const Rating = {
  R1: 'r1',
  R2: 'r2',
  R3: 'r3',
  R4: 'r4',
  R5: 'r5'
}
Object.freeze(Rating)

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
  nextImage()
})

/// UI Actions
// Rating buttons
document.querySelectorAll('.button.rating').forEach(ratingButton => {
  const question = _.intersection(ratingButton.classList, [Question.Q1, Question.Q2, Question.Q3, Question.Q4, Question.Q5])[0]
  const rating = _.intersection(ratingButton.classList, [Rating.R1, Rating.R2, Rating.R3, Rating.R4, Rating.R5])[0]
  ratingButton.addEventListener('click', event => {
    // Remove color from all rating buttons for the answered question
    document.querySelectorAll('.button.rating.' + question).forEach(questionRatingButton => {
      questionRatingButton.classList.remove('red', 'orange', 'yellow', 'olive', 'green')
    })
    // Color the clicked button
    let color
    switch (rating) {
      case Rating.R1:
        color = 'red'
        break
      case Rating.R2:
        color = 'orange'
        break
      case Rating.R3:
        color = 'yellow'
        break
      case Rating.R4:
        color = 'olive'
        break
      case Rating.R5:
        color = 'green'
        break
    }
    ratingButton.classList.add(color)
    // Store the rating in the user state
    rateImage(question, rating)
  })
})

// Key bindings for rating buttons
Mousetrap.bind('1', event => { rateImage(1) })
Mousetrap.bind('2', event => { rateImage(2) })
Mousetrap.bind('3', event => { rateImage(3) })
Mousetrap.bind('4', event => { rateImage(4) })
Mousetrap.bind('5', event => { rateImage(5) })
