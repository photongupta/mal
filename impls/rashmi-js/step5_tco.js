const {stdin, stdout} = require('process');
const readline = require('readline');
const {read_ast: reader} = require('./reader');
const {pr_str: printer} = require('./printer');
const {Env} = require('./env');
const {core} = require('./core');
const {List, Vector, HashMap, Symbol, Nil, Fn, Bool} = require('./types');
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const eval_ast = function (ast, env) {
  if (ast === undefined) {
    return new Nil();
  }

  if (ast instanceof Symbol) {
    return env.get(ast.symbol);
  }
  if (ast instanceof List) {
    return new List(ast.ast.map((token) => EVAL(token, env)));
  }

  if (ast instanceof Vector) {
    return new Vector(ast.ast.map((token) => EVAL(token, env)));
  }

  if (ast instanceof HashMap) {
    const newList = [];
    for (let [k, v] of ast.ast.entries()) {
      newList.push(EVAL(k, env));
      newList.push(EVAL(v, env));
    }
    return new HashMap(newList);
  }
  return ast;
};

const READ = (str) => reader(str);
const EVAL = (ast, env) => {
  while (true) {
    if (!(ast instanceof List)) {
      return eval_ast(ast, env);
    }
    if (ast.isEmpty()) {
      return ast;
    }
    switch (ast.ast[0].symbol) {
      case 'def!':
        return env.set(ast.ast[1], EVAL(ast.ast[2], env));

      case 'let*':
        const newEnv = new Env(env);
        for (let i = 0; i < ast.ast[1].count().number; i += 2) {
          console.log(ast.ast[1].ast[i], ast.ast[1].ast[i + 1]);
          newEnv.set(ast.ast[1].ast[i], EVAL(ast.ast[1].ast[i + 1], newEnv));
        }
        env = newEnv;
        ast = ast.ast[2];
        break;

      case 'if':
        const resultOfCond = EVAL(ast.ast[1], env);
        if (
          (resultOfCond instanceof Bool && resultOfCond.isFalse()) ||
          resultOfCond instanceof Nil
        ) {
          ast = ast.ast[3];
        } else {
          ast = ast.ast[2];
        }
        break;

      case 'do':
        for (let i = 1; i < ast.count().number - 1; i++) {
          eval_ast(ast.ast[i], env);
        }
        ast = ast.ast[ast.ast.length - 1];
        break;

      case 'fn*':
        const bindings = ast.ast[1];
        const fnBody = ast.ast[2];
        return new Fn(fnBody, bindings, env);

      default:
        const evaluatedList = eval_ast(ast, env);
        const fn = evaluatedList.ast[0];
        if (fn instanceof Fn) {
          ast = fn.fnBody;
          env = new Env(fn.env, fn.bindings.ast, evaluatedList.ast.slice(1));
          break;
        }
        return fn.apply(null, evaluatedList.ast.slice(1));
    }
  }
};

const PRINT = (ast) => printer(ast);
const rep = (str) => PRINT(EVAL(READ(str), core));

rep('(def! not (fn* (a) (if a false true)))');

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
