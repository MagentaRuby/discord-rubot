'use strict';

var _getNode = new WeakMap();
var _path = new WeakMap();
var _truePath = new WeakMap();
var _value = new WeakMap();
var _rawValue = new WeakMap();

class Permission {
  constructor(getNode, path, truePath, value, rawValue) {
    _getNode.set(this, getNode);
    _path.set(this, path);
    _truePath.set(this, truePath);
    _value.set(this, value);
    _rawValue.set(this, rawValue);
  }

  get path () {
    return _path.get(this);
  };

  get truePath () {
    return _truePath.get(this);
  };

  get val () {
    return Number(_value.get(this));
  };

  get rawValue () {
    return _rawValue.get(this);
  };

  get allow () {
    return Boolean(_value.get(this));
  };

  get deny () {
    return !Boolean(_value.get(this));
  };

  is (value) {
    return Boolean(_value.get(this) == value);
  };

  min (min) {
    return Boolean(_value.get(this) >= min);
  };

  max (max) {
    return Boolean(_value.get(this) <= max);
  };

  parent (callback) {
    if (path.includes(".")) {
      _getNode.get(this)(path.substr(0, path.lastIndexOf(".")), callback);
    }
  };

  child (subpath, callback) {
    _getNode.get(this)((_path.get(this) + "." + subpath), callback);
  };

}

module.exports = Permission;
