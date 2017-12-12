/// Import dependencies
// Electron components
const {app} = require('electron').remote

// Node dependencies
const Mousetrap = require('mousetrap')

/// Model
const doneButton = document.getElementById('button-done')

/// UI Actions
// Done button
doneButton.addEventListener('click', event => {
  app.quit()
})

// Keybindings
Mousetrap.bind(['enter', 'space'], event => {
  app.quit()
})
