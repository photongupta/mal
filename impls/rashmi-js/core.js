const {Env} = require('./env');
const {
  List,
  Vector,
  HashMap,
  Symbol,
  Nil,
  Fn,
  Bool,
  Str,
  Num,
} = require('./types');
const {pr_str} = require('./printer');

const core = new Env(null);

core.set(
  new Symbol('+'),

  (...numbers) => new Num(numbers.reduce((sum, num) => sum + num.number, 0))
);

core.set(
  new Symbol('*'),

  (...numbers) =>
    new Num(numbers.reduce((product, num) => product * num.number, 1))
);

core.set(
  new Symbol('-'),

  (...numbers) =>
    new Num(
      numbers
        .slice(1)
        .reduce((diff, num) => diff - num.number, numbers[0].number)
    )
);

core.set(
  new Symbol('/'),

  (...numbers) =>
    new Num(
      numbers.slice(1).reduce((div, num) => div / num.number, numbers[0].number)
    )
);

core.set(new Symbol('nil'), new Nil());

core.set(new Symbol('list'), (...args) => new List(args));

core.set(new Symbol('Vector'), (...args) => new Vector(args));

core.set(new Symbol('HashMap'), (...args) => new HashMap(args));

core.set(new Symbol('list?'), (list) => list instanceof List);

core.set(new Symbol('empty?'), (list) => list.isEmpty());

core.set(new Symbol('count'), (list) => list.count());

core.set(new Symbol('='), (ele1, ele2) => new Bool(ele1.isEquals(ele2)));

core.set(new Symbol('<'), (ele1, ele2) => new Bool(ele1.number < ele2.number));

core.set(new Symbol('>'), (ele1, ele2) => new Bool(ele1.number > ele2.number));

core.set(
  new Symbol('<='),
  (ele1, ele2) => new Bool(ele1.number <= ele2.number)
);

core.set(
  new Symbol('>='),
  (ele1, ele2) => new Bool(ele1.number >= ele2.number)
);

const generate_str = (args, separator) =>
  args.map((ast) => pr_str(ast)).join(separator);

core.set(new Symbol('prn'), (...args) => {
  console.log(generate_str(args, ''));
  return new Nil();
});

core.set(new Symbol('println'), (...args) => {
  console.log(generate_str(args, ' '));
  return new Nil();
});

core.set(new Symbol('pr-str'), (...args) => new Str(generate_str(args, ' ')));

core.set(new Symbol('str'), (...args) => new Str(generate_str(args, '')));

// core.set(
//   new Symbol('str'),
//   (...args) => {
//     const str = args.map((ast) => {
//       let s = pr_str(ast);
//       if (ast instanceof Str) {
//         s = s.slice(1, -1);
//       }
//       return s;
//     });
//     return new Str(str.join(''));
//   })
// );

module.exports = {core};
