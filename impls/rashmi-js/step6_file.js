const {stdin, stdout, argv} = require('process');
const readline = require('readline');
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});
const {read_ast} = require('./reader');
const {pr_str} = require('./printer');
const {Env} = require('./env');
const {List, Vector, HashMap, Symbol, Nil, Fn, Bool, Str} = require('./types');
const {core} = require('./core');

const eval_ast = function (ast, env) {
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

const READ = (str) => read_ast(str);
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
          EVAL(ast.ast[i], env);
        }
        ast = ast.ast[ast.ast.length - 1];
        break;

      case 'fn*':
        const bindings = ast.ast[1];
        const fnBody = ast.ast[2];
        const newFn = function (...callArgs) {
          const newEnv = new Env(env, bindings.ast, callArgs);
          return EVAL(fnBody, newEnv);
        };
        return new Fn(fnBody, bindings, env, newFn);

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

const PRINT = (ast) => pr_str(ast, true);
const rep = (str) => PRINT(EVAL(READ(str), core));

core.set(new Symbol('eval'), (ast) => {
  return EVAL(ast, core);
});

core.set(new Symbol('swap!'), (atom, func, ...args) => {
  return EVAL(
    new List([
      new Symbol('reset!'),
      atom,
      new List([func, atom.value, ...args]),
    ]),
    core
  );
});

core.set(new Symbol('*ARGV*'), new List(argv.slice(3).map((e) => new Str(e))));

rep('(def! not (fn* (a) (if a false true)))');

rep(
  '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

const repl = function () {
  if (argv.length > 2) {
    const filename = argv[2];
    rep(`(load-file "${filename}")`);
    process.exit(0);
  }
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
