'use strict';

const {serialize: {Serializer}} = require('lance-gg');

class ClassLoader {
    static registerClass(c, id) {
      ClassLoader.classRegisterer.registerClass(c, id);
    }
}


ClassLoader.classRegisterer = new Serializer.ClassRegisterer();

module.exports = ClassLoader;
