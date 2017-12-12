/// Import dependencies
// Electron components
const {app} = require('electron').remote

/// Model
const doneButton = document.getElementById('button-done')

/// UI Actions
// Done button
doneButton.addEventListener('click', event => {
  app.quit()
})
