const {stdin, stdout} = require('process');
const readline = require('readline');
const {read_ast: reader} = require('./reader');
const {pr_str: printer} = require('./printer');
const rl = readline.createInterface({
  input: stdin,
  output: stdout,
});

const READ = (str) => reader(str);
const EVAL = (ast) => ast;
const PRINT = (ast) => printer(ast);
const rep = (str) => PRINT(EVAL(READ(str)));

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
