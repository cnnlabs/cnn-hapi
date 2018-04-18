'use strict';

module.exports = function(name) {
  let matches = name.match(/^(?:cnn-)?(?:cnnv2-)?(.*?)(?:-v[0-9]{3,})?$/);

  if (matches) {
    return matches[1];
  }

  return name;
};
