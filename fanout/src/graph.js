const { EventEmitter } = require("events");
const Bag = require("./bag");

class Graph extends EventEmitter {
  constructor() {
    super();
    this.edges = new Bag();
    this.backEdges = new Bag();
    this.edges.on("keyAdded", (key) => {
      this.emit("sourceAdded", key);
    });
    this.edges.on("keyDeleted", (key) => {
      this.emit("sourceDeleted", key);
    });
    this.backEdges.on("keyAdded", (key) => {
      this.emit("targetAdded", key);
    });
    this.backEdges.on("keyDeleted", (key) => {
      this.emit("targetDeleted", key);
    });
  }

  getValues(key) {
    return this.edges.get(key);
  }

  getKeys(value) {
    return this.backEdges.get(value);
  }

  deleteKey(key) {
    const values = [...this.edges.get(key)];
    return values.some((value) => this.delete(key, value));
  }

  deleteValue(value) {
    const keys = [...this.backEdges.get(value)];
    return keys.some((key) => this.delete(key, value));
  }

  clear() {
    this.edges.clear();
    this.backEdges.clear();
  }

  add(key, value) {
    return this.edges.add(key, value) || this.backEdges.add(value, key);
  }

  delete(key, value) {
    return this.edges.delete(key, value) || this.backEdges.delete(value, key);
  }
}

module.exports = Graph;
