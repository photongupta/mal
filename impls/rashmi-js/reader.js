const {
  List,
  Vector,
  HashMap,
  Symbol,
  Str,
  Keyword,
  Int,
  Float,
  Bool,
} = require('./types');

const tokenize = function (str) {
  const reg =
    /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  const tokens = [];
  while ((match = reg.exec(str)[1]) !== '') {
    if (match[0] !== ';') {
      tokens.push(match);
    }
  }
  return tokens;
};

class Reader {
  constructor(tokens) {
    this.tokens = tokens.slice();
    this.pos = 0;
  }

  peek() {
    return this.tokens[this.pos];
  }

  next() {
    const current = this.peek();
    if (current) {
      this.pos++;
    }
    return current;
  }
}

const read_atom = function (token) {
  if (token.match(/^[+-]?[0-9]+$/g)) {
    return new Int(parseInt(token));
  }
  if (token.match(/^[+-]?[0-9]+\.[0-9]+$/g)) {
    return new Float(parseFloat(token));
  }
  if (token.startsWith('"')) {
    if (!token.match(/^"(\\.|[^\\"])*"$/)) {
      throw 'unbalanced';
    }
    let s = token.slice(1, token.length - 1);
    return new Str(s);
  }
  if (token.startsWith(':')) {
    return new Keyword(token.slice(1));
  }
  if (token == 'true') {
    return new Bool(true);
  }
  if (token == 'false') {
    return new Bool(false);
  }
  return new Symbol(token);
};

const read_all = function (reader, closing) {
  const tokens = [];
  while (reader.peek()[0] !== closing) {
    const token = read_form(reader);
    tokens.push(token);
    if (reader.peek() == undefined) {
      throw 'unbalanced';
    }
  }
  reader.next();
  return tokens;
};

const read_list = function (reader) {
  const tokens = read_all(reader, ')');
  return new List(tokens);
};

const read_vector = function (reader) {
  const tokens = read_all(reader, ']');
  return new Vector(tokens);
};

const read_has_map = function (reader) {
  const tokens = read_all(reader, '}');
  if (tokens.length % 2) {
    throw 'odd number of elements';
  }
  return new HashMap(tokens);
};

const read_form = function (reader) {
  const token = reader.next();
  switch (token[0]) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_has_map(reader);
    case ')':
      throw 'unexpected';
    case ']':
      throw 'unexpected';
    case '}':
      throw 'unexpected';
  }
  return read_atom(token);
};

const read_ast = function (str) {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = {read_ast};
