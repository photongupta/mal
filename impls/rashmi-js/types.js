class List {
  constructor(ast = []) {
    this.ast = ast;
  }

  toString() {
    return '(' + this.ast.map((ast) => ast.toString()).join(' ') + ')';
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return new Int(this.ast.length);
  }

  isEquals(other) {
    if (
      (!(other instanceof List) && !(other instanceof Vector)) ||
      this.count().number != other.count().number
    ) {
      return false;
    }

    for (let i = 0; i < this.ast.length; i++) {
      if (!this.ast[i].isEquals(other.ast[i])) {
        return false;
      }
    }
    return true;
  }
}

class Vector {
  constructor(ast = []) {
    this.ast = ast;
  }

  toString() {
    return '[' + this.ast.map((ast) => ast.toString()).join(' ') + ']';
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return new Int(this.ast.length);
  }

  isEquals(other) {
    if (
      (!(other instanceof Vector) && !(other instanceof List)) ||
      this.count().number != other.count().number
    ) {
      return false;
    }

    for (let i = 0; i < this.ast.length; i++) {
      if (!this.ast[i].isEquals(other.ast[i])) {
        return false;
      }
    }
    return true;
  }
}

class HashMap {
  constructor(ast) {
    this.ast = new Map();
    for (let index = 0; index < ast.length; index += 2) {
      this.ast.set(ast[index], ast[index + 1]);
    }
  }

  toString() {
    const entries = this.ast.entries();
    let str = '';
    let separator = '';
    for (let [k, v] of entries) {
      str += k + ' ' + v;
      str += separator;
      separator = ' ';
    }
    return '{' + str + '}';
  }

  count() {
    return new Int(this.ast.size);
  }
}

class Symbol {
  constructor(symbol) {
    this.symbol = symbol;
  }

  toString() {
    return this.symbol.toString();
  }

  isEquals(other) {
    if (!(other instanceof Symbol)) {
      return false;
    }
    return this.symbol === other.symbol;
  }
}

class Str {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return '"' + this.str.toString() + '"';
  }

  isEquals(other) {
    if (!(other instanceof Str)) {
      return false;
    }
    return this.str === other.str;
  }
}

class Keyword {
  constructor(str) {
    this.str = str;
  }

  toString() {
    return ':' + this.str.toString();
  }

  isEquals(other) {
    if (!(other instanceof Keyword)) {
      return false;
    }
    return this.str === other.str;
  }
}

class Nil {
  toString() {
    return 'nil';
  }
  count() {
    return 0;
  }
  isEquals(other) {
    return other instanceof Nil;
  }
}

class Bool {
  constructor(bool) {
    this.bool = bool;
  }
  toString() {
    return this.bool.toString();
  }

  isEquals(other) {
    return other instanceof Bool && this.bool == other.bool;
  }

  isFalse() {
    return this.bool === false;
  }
}

class Fn {
  constructor(fnBody, bindings, env) {
    this.fnBody = fnBody;
    this.bindings = bindings;
    this.env = env;
  }

  toString() {
    return '#<function>';
  }
}

class Num {
  constructor(number) {
    this.number = number;
  }

  toString() {
    return this.number.toString();
  }

  isEquals(other) {
    if (!(other instanceof Num)) {
      return false;
    }
    return this.number === other.number;
  }
}

class Int extends Num {
  constructor(number) {
    super(number);
  }
}

class Float extends Num {
  constructor(number) {
    super(number);
  }
}

module.exports = {
  List,
  Vector,
  HashMap,
  Symbol,
  Str,
  Keyword,
  Nil,
  Fn,
  Int,
  Float,
  Bool,
  Num,
};
