/// Import dependencies
// Local dependencies
const Rating = require('./rating.js')

// Update the color of the rating button
const setRatingButton = function (question, rating) {
  if (question && rating) {
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
    const button = document.querySelector('.button.rating.' + question + '.' + rating)
    button.classList.add(color)
  }
}

/// Exports
module.exports = { setRatingButton: setRatingButton }
