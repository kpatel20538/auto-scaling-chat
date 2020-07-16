const { EventEmitter } = require("events");

class Bag extends EventEmitter {
  constructor() {
    super();
    this.map = new Map();
  }

  has(key) {
    return this.map.has(key) && this.map.get(key).size > 0;
  }

  get(key) {
    return this.map.get(key) || new Set();
  }

  add(key, value) {
    if (!this.map.has(key)) {
      this.map.set(key, new Set());
      this.emit("keyAdded", key);
    }
    return this.map.get(key).add(value);
  }

  delete(key, value) {
    if (!this.map.has(key)) {
      return false;
    }
    const values = this.map.get(key);
    if (!values.delete(value)) {
      return false;
    }

    if (values.size <= 0) {
      this.map.delete(key);
      this.emit("keyDeleted", key);
    }
    return true;
  }

  clear() {
    const keys = [...this.map.keys()];
    this.map.clear();
    for (const key of keys) {
      this.emit("keyDeleted", key);
    }
  }
}

module.exports = Bag;
