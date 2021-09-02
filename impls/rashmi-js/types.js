class Sequence {
  constructor(ast = []) {
    this.ast = ast;
  }

  isEmpty() {
    return this.ast.length == 0;
  }

  count() {
    return new Int(this.ast.length);
  }

  toString(readably) {
    return this.ast.map((ast) => ast.toString(readably)).join(' ');
  }

  isEquals(other) {
    if (!(other instanceof Sequence) || !this.count().isEquals(other.count())) {
      return false;
    }

    for (let i = 0; i < this.ast.length; i++) {
      if (!this.ast[i].isEquals(other.ast[i])) {
        return false;
      }
    }
    return true;
  }

  concat(lists) {
    return new List(this.ast.concat(lists.flatMap((list) => list.ast)));
  }

  prepend(newValue) {
    return new List([newValue, ...this.ast]);
  }

  isFirst(symbol) {
    return !this.isEmpty() && this.ast[0].symbol == symbol;
  }
}

class List extends Sequence {
  constructor(ast = []) {
    super();
    this.ast = ast;
  }

  toString(readably) {
    return '(' + super.toString(readably) + ')';
  }
}

class Vector extends Sequence {
  constructor(ast = []) {
    super();
    this.ast = ast;
  }

  toString(readably) {
    return '[' + super.toString(readably) + ']';
  }
}

class HashMap {
  constructor(ast) {
    this.ast = new Map();
    for (let index = 0; index < ast.length; index += 2) {
      this.ast.set(ast[index], ast[index + 1]);
    }
  }

  toString(readably) {
    const entries = this.ast.entries();
    let str = '';
    let separator = '';
    for (let [k, v] of entries) {
      str += k.toString(readably) + ' ' + v.toString(readably);
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

  toString(readably) {
    if (readably) {
      return (
        '"' +
        this.str
          .toString()
          .replace(/\\/g, '\\\\')
          .replace(/"/g, '\\"')
          .replace(/\n/g, '\\n') +
        '"'
      );
    }
    return this.str.toString();
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
  constructor(fnBody, bindings, env, fn) {
    this.fnBody = fnBody;
    this.bindings = bindings;
    this.env = env;
    this.fn = fn;
  }

  toString() {
    return '#<function>';
  }

  apply(...args) {
    return this.fn.apply(null, args);
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

class Atom {
  constructor(value) {
    this.value = value;
  }

  toString(readably) {
    return '(atom ' + this.value.toString(readably) + ')';
  }

  update(newValue) {
    this.value = newValue;
    return this.value;
  }

  swap(func, args) {
    if (func instanceof Fn) {
      return this.update(func.apply(this.value, ...args));
    }
    return this.update(func(this.value, ...args));
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
  Atom,
};
