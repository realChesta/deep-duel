'use strict';

// HACK

/*
 * There's a bug in lance-gg which makes strings getting pruned incorrectly
 * (Serializable:130; it prunes all changed strings, instead of those not
 * changed. This utility applies a band-aid fix. To use, simply require it in
 * any class. As soon as this script is referenced/loaded, the bug will be
 * patched
 */



const {serialize: {Serializer, Serializable}} = require('lance-gg');

// literal copypaste right here, just changed what needed to be changed
Serializable.prototype.prunedStringsClone = function(serializer, prevObject) {

  if (!prevObject) return this;
  prevObject = serializer.deserialize(prevObject).obj;

  // get list of string properties which changed
  let netScheme = this.constructor.netScheme;
  let isString = p => netScheme[p].type === Serializer.TYPES.STRING;
  let hasNotChanged = p => prevObject[p] === this[p];                                         // hasChanged -> hasNotChanged; !== -> ===
  let unchangedStrings = Object.keys(netScheme).filter(isString).filter(hasNotChanged);       // hasChanged -> hasNotChanged; changedStrings -> unchangedStrings
  if (!unchangedStrings) return this;                                                         // changedStrings -> unchangedStrings

  // build a clone with pruned strings
  let prunedCopy = new this.constructor();
  for (let p of Object.keys(netScheme))
      prunedCopy[p] = unchangedStrings.indexOf(p) < 0 ? this[p] : null;                       // changedStrings -> unchangedStrings

  return prunedCopy;
}
