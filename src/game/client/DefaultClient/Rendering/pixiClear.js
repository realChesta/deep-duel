'use strict';

module.exports = function(pixiW) {
  for (var i = pixiW.children.length - 1; i >= 0; i--) {
    pixiW.removeChild(pixiW.children[i]);
  };
  if (pixiW.clear) pixiW.clear();
};
