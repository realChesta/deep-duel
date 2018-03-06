'use strict';

require('./buggy-gg');
import Serializer from 'lance/serialize/Serializer';
import Serializable from 'lance/serialize/Serializable';

class ClassLoader {
    static registerClass(c, id) {
      ClassLoader.classRegisterer.registerClass(c, id);
      return ClassLoader;
    }
}


ClassLoader.classRegisterer = new Serializer.ClassRegisterer();

module.exports = ClassLoader;
