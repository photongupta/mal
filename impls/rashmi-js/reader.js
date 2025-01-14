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
  Nil,
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
  if (token == 'nil') {
    return new Nil();
  }
  if (token.startsWith('"')) {
    if (!token.match(/^"(\\.|[^\\"])*"$/)) {
      throw 'unbalanced';
    }
    let s = token.slice(1, token.length - 1);
    s = s.replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
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

const read_prepend_form = function (reader, symbol) {
  return new List([new Symbol(symbol), read_form(reader)]);
};

const read_form = function (reader) {
  const token = reader.next();
  if (token == '~@') {
    return read_prepend_form(reader, 'splice-unquote');
  }
  switch (token[0]) {
    case '(':
      return read_list(reader);
    case '[':
      return read_vector(reader);
    case '{':
      return read_has_map(reader);
    case '@':
      return read_prepend_form(reader, 'deref');
    case "'":
      return read_prepend_form(reader, 'quote');
    case '`':
      return read_prepend_form(reader, 'quasiquote');
    case '~':
      return read_prepend_form(reader, 'unquote');
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
