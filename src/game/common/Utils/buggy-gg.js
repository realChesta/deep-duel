'use strict';

import Serializer from 'lance/serialize/Serializer';
import Serializable from 'lance/serialize/Serializable';
import Utils from 'lance/lib/Utils';


/*
 * Utility fixing some things in lance-gg. To use, simply require it in any
 * class. As soon as this script is referenced/loaded, the patch will be applied
*/



/**
 * There's a bug in lance-gg which makes strings get pruned incorrectly
 * (Serializable:130; it prunes all changed strings, instead of those not
 * changed.
 */

 /*    // TODO Probably fixed now - check
// literal copypasta right here, just changed what needed to be changed
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

*/





/**
 * We want to share registered classes of some serializers, which is why we
 * manually add a way to set registeredClasses to a reference
 */

// TODO Check if lance changed this with version 2.0

function setClassRegisterer(serializer, registeredClasses) {
 serializer.registeredClasses = registeredClasses;
 serializer.registeredClasses.prototype = ClassRegisterer;
}

Serializer.setClassRegisterer = setClassRegisterer;

class ClassRegisterer {
  constructor(from) {
    if (from)
      Object.assign(this, from);
  }

  registerClass(classObj, classId) {
    classId = classId ? classId : Utils.hashStr(classObj.name);
    if (this[classId]) {
      console.error(`Serializer: accidental override of classId ${classId} when registering class`, classObj, new Error().stack);
    }

    this[classId] = classObj;
  }
}

 Serializer.ClassRegisterer = ClassRegisterer;
