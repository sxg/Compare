const Preference = {
  A: 'a',
  B: 'b'
}

// Exports
module.exports = Object.freeze({
  A: Preference.A,
  B: Preference.B,
  All: [Preference.A, Preference.B]
})
