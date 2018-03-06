// no strict mode!

// This allows you to register and use global variables. All other scripts are
// in strict mode, so this is needed to access stuff directly from the
// console

// Scripts in strict mode can still access this by require'ing it

// Example (paste into your browser console):
//   DeepDuel.gameEngines[0].characters[0].takeDamage(1);
//   (obviously, this example requires that there's a character with id 0)


// TODO Babel (preset-env to be precise) automatically adds strict mode so this doesn't work for now. Change that
//DeepDuel = {};

// This is the hack so that the code will at least compile, but it's useless
let DeepDuel = {};


module.exports = DeepDuel;
