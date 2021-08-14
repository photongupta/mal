const {stdin, stdout} = require('process');
const readline = require('readline');
const {read_ast: reader} = require('./reader');
const {pr_str: printer} = require('./printer');
const {List, Vector, HashMap, Symbol, Str, Keyword} = require('./types');
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const env = {
  '+': (...numbers) => numbers.reduce((sum, num) => sum + num, 0),
  '*': (...numbers) => numbers.reduce((product, num) => product * num, 1),
  '-': (...numbers) =>
    numbers.slice(1).reduce((diff, num) => diff - num, numbers[0]),
  '/': (...numbers) =>
    numbers.slice(1).reduce((diff, num) => diff / num, numbers[0]),
};

const eval_ast = function (ast, env) {
  if (ast instanceof Symbol) {
    const value = env[ast.symbol];
    if (!value) {
      throw 'value not found';
    }
    return value;
  }
  if (ast instanceof List) {
    return new List(ast.ast.map((token) => EVAL(token, env)));
  }

  if (ast instanceof Vector) {
    return new Vector(ast.ast.map((token) => EVAL(token, env)));
  }

  if (ast instanceof HashMap) {
    return new HashMap(ast.ast.map((token) => EVAL(token, env)));
  }
  return ast;
};

const READ = (str) => reader(str);
const EVAL = (ast, env) => {
  if (!(ast instanceof List)) {
    return eval_ast(ast, env);
  }
  if (ast.isEmpty()) {
    return ast;
  }
  const evaluatedList = eval_ast(ast, env);
  const fn = evaluatedList.ast[0];
  return fn.apply({}, evaluatedList.ast.slice(1));
};

const PRINT = (ast) => printer(ast);
const rep = (str) => PRINT(EVAL(READ(str), env));

const repl = function () {
  rl.question('user> ', (line) => {
    try {
      console.log(rep(line));
    } catch (e) {
      console.log(e);
    } finally {
      repl();
    }
  });
};

repl();
