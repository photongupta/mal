const {List} = require('./types');

class Env {
  constructor(outer, bindings = [], expressions = []) {
    this.outer = outer;
    this.data = {};
    for (let i = 0; i < bindings.length; i++) {
      if (bindings[i] == '&') {
        this.data[bindings[i + 1]] = new List(expressions.slice(i));
        break;
      }
      this.data[bindings[i]] = expressions[i];
    }
  }

  set(key, value) {
    this.data[key.symbol] = value;
    return value;
  }

  find(key) {
    if (this.data[key]) {
      return this;
    }
    if (this.outer == null) {
      return this.outer;
    }
    return this.outer.find(key);
  }

  get(key) {
    const env = this.find(key);
    if (env == null) {
      throw key + ' not found';
    }
    return env.data[key];
  }
}

module.exports = {Env};
