'use strict';

const {remote: {dialog}} = require('electron');
const path = require('path');
const $ = require('jquery');
const fs = require('fs');

var allResources = {};

var subResourcesToLoad = [];






const coordsType = (caption, required) => ({
  caption: caption,
  required: required,
  type: 'object',
  minimized: true,
  of: {
    x: {caption: "x", type: 'number'},
    y: {caption: "y", type: 'number'}
  }
});

const dim2dType = (caption, required) => ({
  caption: caption,
  required: required,
  type: 'object',
  minimized: true,
  of: {
    w: {caption: "w", type: 'number'},
    h: {caption: "h", type: 'number'}
  }
});

const rectType = (caption, required) => ({
  caption: caption,
  required: required,
  type: 'object',
  minimized: true,
  of: {
    x: {caption: "x", type: 'number'},
    y: {caption: "y", type: 'number'},
    w: {caption: "w", type: 'number'},
    h: {caption: "h", type: 'number'}
  }
});

// TODO Array and enumeration types
const resourceTypes = {
  'charasset': {
    name: 'charasset',
    displayName: "Character Asset Collection",
    description: "A character asset collection used for Deep Duel characters. Consists out of a spritesheet for each pair of action and direction.",
    check: (resource) => resource.type === 'asset' || resource.ddtype === 'charasset',
    options: {
      defaultAction: {
        caption: "Default Action",
        type: 'string',
        required: true
      },
      defaultDirection: {
        caption: "Default Direction",
        type: 'string',
        required: true
      },
      actions: {
        caption: "Spritesheets",
        type: 'map',
        of: {
          caption: "Action",
          type: 'map',
          of: {
            caption: "Direction",
            type: 'resource',
            resourceName: 'spritesheet'
          }
        },
        required: true
      }
    }
  },
  'spritesheet': {
    name: 'spritesheet',
    displayName: "Spritesheet",
    description: "A collection of textures.",
    check: (resource) => resource.frames !== undefined || resource.ddtype === 'spritesheet',
    options: {
      frames: {
        caption: "Frames",
        type: 'map',
        minimized: true,
        of: {
          caption: 'Filename',
          keyName: 'filename',
          type: 'object',
          of: {
            frame: rectType("Sprite frame", true),
            rotated: {caption: "Rotated", type: 'boolean', required: true},
            trimmed: {caption: "Trimmed", type: 'boolean', required: true},
            spriteSourceSize: rectType("Sprite source size", true),
            sourceSize: dim2dType("Source size", true),
            duration: {caption: "Duration", type: 'number', required: true}
          }
        },
        required: true
      },
      meta: {
        caption: "Metadata",
        type: 'object',
        of: {
          image: {caption: "Image", type: 'path', mime: 'image', required: true},
          format: {caption: "Format", type: 'string', required: true},
          size: dim2dType("Size", true),
          scale: {caption: "Scale", type: 'number', required: true},
          ticksPerFrame: {caption: "Ticks per frame", type: 'number'},
          offset: coordsType("Offset", true)
        },
        required: true
      }
    }
  }
}




$(function() {
  const $load = $('.load'), $save = $('.save'), $merge = $('.merge'), $fix = $('.fix'), $mini = $('.mini');


  $load.click(load);
  $mini.click(minimizeAll);
});


function minimizeAll() {
  $('.minimize').removeClass('minimize').addClass('maximize').text("Expand");
  $('.maximize + .list').hide();
}



function load() {
  const paths = dialog.showOpenDialog({
    filters: [{
      name: "JSON File",
      extensions: ['json']
    }],
    properties: ['openFile']
  });

  if (paths === undefined || paths.length === 0)
    return;

  // TODO Catch and display errors
  allResources = {};
  subResourcesToLoad = [];
  $('.container').empty().removeClass('invalid');
  loadFromPath(paths[0], 0);
  for (let i = 0; i < subResourcesToLoad.length; i++) {
    loadFromPath(path.resolve(paths[0], '../', subResourcesToLoad[i]), i + 1);
  }
}

function loadFromPath(from, index) {
  const json = fs.readFileSync(from, {encoding: 'utf-8'});    // TODO consider doing this async
  const unprep = JSON.parse(json);
  return loadFromObject(unprep, from, path.basename(from));
}

function loadFromObject(unprep, name, displayName, index) {
  const $container = $('.container');
  if (allResources[name] !== undefined) {
    alert("Circular reference detected in " + displayName + "! This resource is not valid\n\nnFull path: " + name);
    $container.addClass('invalid');
    throw new Error("Circular reference at " + name + ": " + unprep);
  }
  const resourceType = getResourceType(unprep);
  if (resourceType === undefined) {
    alert("Can't read resource " + displayName + ": Unknown asset type\n\nFull path: " + name);
  }
  const res = prepResource(resourceType, unprep);
  let nameTag = $('<a class="nameTag"></a>');
  nameTag.text(displayName);
  nameTag.attr('name', 'a' + index);
  $container.append(nameTag);
  $container.append(res.obj);
  allResources[name] = res;
}



function prepThing(option, unprep) {
  let result, obj;

  switch (option.type) {
  case 'path':
    // TODO Path type that's different from String
  case 'string':
    result = String(unprep);
    obj = $('<input type="text">');
    obj.val(result);
    return {result, obj, doLabel: true};
  case 'number':
    result = Number(unprep);
    obj = $('<input type="number">');
    obj.val(result);
    return {result, obj, doLabel: true};
  case 'boolean':
    result = unprep !== 'false' && unprep !== '0' && Boolean(unprep);
    obj = $('<input type="checkbox">');
    obj[0].checked = result;
    return {result, obj, doLabel: true};
  case 'resource':
    return prepResource(resourceTypes[option.resourceName], unprep);
  case 'object':
    return prepObject(option.of, unprep, option.minimized);
  case 'map':
    return prepMap(option.of, unprep, option.minimized);
  default:
    throw new Error("Unknown option type " + option.type + "; " + option);
  }

  return {result, obj};
}





function createCoolList(list, minimized) {
  let minimize;
  if (!minimized) {
    minimize = $('<button class="minimize">' + "Minimize" + '</button>');
  } else {
    minimize = $('<button class="maximize">' + "Expand" + '</button>');
    list.hide();
  }

  minimize.click(function() {
    const $this = $(this);
    if (list.is(':visible')) {
      list.slideUp(100);
      $this.text("Expand").removeClass('minimize').addClass('maximize');
    } else {
      list.slideDown(100);
      $this.text("Minimize").removeClass('maximize').addClass('minimize');
    }
  });


  return minimize.add(list);
}





function prepObject(options, unprep, minimized) {
  const result = {};
  let obj = $('<ul class="list"></ul>');

  for (let key of Object.keys(options)) {
    const option = options[key];

    let rk = prepThing(option, unprep[key]);
    result[key] = rk.result;

    let label = rk.doLabel ? $('<label></label>') : $('<a></a>');
    label.text(option.caption + (option.required ? "*" : "") + ": ");
    label.append(rk.obj);

    let li = $('<li></li>');
    li.append(label);

    obj.append(li);
  }

  obj = createCoolList(obj, minimized);

  return {result, obj};
}

function prepMap(option, unprep, minimized) {
  const result = {};
  let obj = $('<ul class="list"></ul>');

  for (let rKey of Object.keys(unprep)) {
    const pKey = $.isArray(unprep) ? unprep[rKey][option.keyName] : rKey;

    let rk = prepThing(option, unprep[rKey]);
    result[pKey] = rk.result;

    let label = $('<label></label>');
    label.text(option.caption + ": ");

    let capt = $('<input type="text">');
    capt.val(pKey);
    label.append(capt);

    let li = $('<li></li>');
    li.append(label);
    li.append($('<br>'));

    label = rk.doLabel ? $('<label></label>') : $('<a></a>');
    label.text(option.required ? "Value*: " : "Value: ");
    label.append(rk.obj);
    li.append(label);

    obj.append(li);
  }

  obj = createCoolList(obj, minimized);

  return {result, obj};
}










function prepResource(resourceType, unprep) {
  if (typeof unprep === 'string') {
    const obj = $('<a></a>');
    obj.text(unprep);
    subResourcesToLoad.push(unprep);
    obj.attr('href', '#a' + subResourcesToLoad.length);
    return {result: unprep, obj};
  }

  const obj = $('<div class="asset"></div>');

  const resName = $('<a class="assetName"></a>');
  resName.text(resourceType.displayName);
  obj.append(resName);

  let objRes = prepObject(resourceType.options, unprep);
  objRes.result.ddtype = resourceType.name;
  obj.append(objRes.obj);

  return {result: objRes.result, obj};
}

function getResourceType(unprep) {
  if (unprep.ddtype !== undefined)
    return resourceTypes[unprep.ddtype];

  for (let value of Object.values(resourceTypes)) {
    if (value.check(unprep))
      return value;
  }

  return undefined;
}
