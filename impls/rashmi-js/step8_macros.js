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

const quasiquote = function (ast) {
  if (ast instanceof List) {
    if (ast.isFirst('unquote')) {
      return ast.ast[1];
    }
    return process_quoted_list(ast);
  }

  if (ast instanceof Vector) {
    const result = process_quoted_list(ast);
    return new List([new Symbol('vec'), result]);
  }

  if (ast instanceof HashMap || ast instanceof Symbol) {
    return new List([new Symbol('quote'), ast]);
  }

  return ast;
};

const process_quoted_list = function (ast) {
  let result = new List();
  for (let i = ast.ast.length - 1; i >= 0; i--) {
    let elt = ast.ast[i];
    if (elt instanceof List && elt.isFirst('splice-unquote')) {
      result = new List([new Symbol('concat'), elt.ast[1], result]);
    } else {
      result = new List([new Symbol('cons'), quasiquote(elt), result]);
    }
  }
  return result;
};

const is_macro_call = function (ast, env) {
  if (
    !(ast instanceof List) ||
    ast.isEmpty() ||
    !(ast.ast[0] instanceof Symbol)
  ) {
    return false;
  }

  const key = ast.ast[0].symbol;
  const isPresent = env.find(key);
  return isPresent && env.get(key) instanceof Fn && env.get(key).isMacro;
};

const macroexpand = function (ast, env) {
  while (is_macro_call(ast, env)) {
    const func = env.get(ast.ast[0].symbol);
    if (func instanceof Fn) {
      ast = func.apply(...ast.ast.slice(1));
      continue;
    }
    ast = func.apply(null, ast.ast.slice(1));
  }
  return ast;
};

const READ = (str) => read_ast(str);
const EVAL = (ast, env) => {
  while (true) {
    ast = macroexpand(ast, env);
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
          ast = ast.ast[3] || new Nil();
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

      case 'quote':
        return ast.ast[1];

      case 'quasiquoteexpand':
        return quasiquote(ast.ast[1]);

      case 'quasiquote':
        ast = quasiquote(ast.ast[1]);
        break;

      case 'defmacro!':
        const evaluatedVal = EVAL(ast.ast[2], env);
        evaluatedVal.setMacro();
        return env.set(ast.ast[1], evaluatedVal);

      case 'macroexpand':
        return macroexpand(ast.ast[1], env);

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

core.set(new Symbol('*ARGV*'), new List(argv.slice(3).map((e) => new Str(e))));

rep('(def! not (fn* (a) (if a false true)))');

rep(
  '(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))'
);

rep(
  '(defmacro! cond (fn* (& xs) (if (> (count xs) 0) (list \'if (first xs) (if (> (count xs) 1) (nth xs 1) (throw "odd number of forms to cond")) (cons \'cond (rest (rest xs)))))))'
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
