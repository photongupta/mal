class List {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return '(' + this.ast.map((ast) => ast.toString()).join(' ') + ')';
  }

  isEmpty() {
    return this.ast.length == 0;
  }
}

class Vector {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return '[' + this.ast.map((ast) => ast.toString()).join(' ') + ']';
  }
}

class HashMap {
  constructor(ast) {
    this.ast = ast;
  }

  toString() {
    return '{' + this.ast.map((ast) => ast.toString()).join(' ') + '}';
  }
}

class Symbol {
  constructor(symbol) {
    this.symbol = symbol;
  }

  toString() {
    return this.symbol.toString();
  }
}

class Str {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return '"' + this.str.toString() + '"';
  }
}

class Keyword {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return ':' + this.str.toString();
  }
}

module.exports = {List, Vector, HashMap, Symbol, Str, Keyword};
