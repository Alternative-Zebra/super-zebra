import { parse } from "./functions/parser.js";
import { TokenStream } from "./functions/tokenStream.js";
import { InputStream } from "./functions/inputStream.js";
var code = "";
class Environment {
  constructor(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
  }
  extend() {
    return new Environment(this);
  }
  lookup(name) {
    var scope = this;
    while (scope) {
      if (Object.prototype.hasOwnProperty.call(scope.vars, name)) return scope;
      scope = scope.parent;
    }
  }
  get(name) {
    if (name in this.vars) return this.vars[name];
    throw new Error("Undefined variable " + name);
  }
  set(name, value) {
    var scope = this.lookup(name);
    if (!scope && this.parent) throw new Error("Undefined variable " + name);
    return ((scope || this).vars[name] = value);
  }
  def(name, value) {
    return (this.vars[name] = value);
  }
}

function evaluate(exp, env) {
  switch (exp.type) {
    case "num":
    case "str":
    case "bool":
      return exp.value;

    case "var":
      return env.get(exp.value);

    case "assign":
      if (exp.left.type != "var")
        throw new Error("Cannot assign to " + JSON.stringify(exp.left));
      return env.set(exp.left.value, evaluate(exp.right, env));

    case "binary":
      return apply_op(
        exp.operator,
        evaluate(exp.left, env),
        evaluate(exp.right, env)
      );

    case "func":
      return make_func(env, exp);

    case "if":
      var cond = evaluate(exp.cond, env);
      if (cond !== false) return evaluate(exp.then, env);
      return exp.else ? evaluate(exp.else, env) : false;

    case "prog":
      var val = false;
      exp.prog.forEach(function (exp) {
        val = evaluate(exp, env);
      });
      return val;

    case "call":
      var func = evaluate(exp.func, env);
      return func.apply(
        null,
        exp.args.map(function (arg) {
          return evaluate(arg, env);
        })
      );

    default:
      throw new Error("I don't know how to evaluate " + exp.type);
  }
}

function apply_op(op, a, b) {
  function num(x) {
    if (typeof x != "number")
      throw new Error("Deu zebra! \n expected number but got " + x);
    return x;
  }
  function div(x) {
    if (num(x) == 0) throw new Error("Divide by zero");
    return x;
  }
  switch (op) {
    case "+":
      return num(a) + num(b);
    case "-":
      return num(a) - num(b);
    case "*":
      return num(a) * num(b);
    case "/":
      return num(a) / div(b);
    case "%":
      return num(a) % div(b);
    case "&&":
      return a !== false && b;
    case "||":
      return a !== false ? a : b;
    case "<":
      return num(a) < num(b);
    case ">":
      return num(a) > num(b);
    case "<=":
      return num(a) <= num(b);
    case ">=":
      return num(a) >= num(b);
    case "==":
      return a === b;
    case "!=":
      return a !== b;
  }
  throw new Error("Can't apply operator " + op);
}

function make_func(env, exp) {
  function func() {
    var names = exp.vars;
    var scope = env.extend();
    for (var i = 0; i < names.length; ++i)
      scope.def(names[i], i < arguments.length ? arguments[i] : false);
    return evaluate(exp.body, scope);
  }
  return func;
}

/* -----[ global function in zebra ]----- */

import fs from "fs";
import chalk from "chalk";
import * as readline from "readline";

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

var globalEnv = new Environment();

globalEnv.def("heehaw", function (val) {
  return console.log(val);
});

globalEnv.def("zebra", function () {
  return console.log(`
      you called the ${
        chalk.bgWhite.black("Z") +
        chalk.bgBlack.white.bold("E") +
        chalk.bgWhite.black("B") +
        chalk.bgBlack.white.bold("R") +
        chalk.bgWhite.black("A")
      }!
      _,,
      "-.\\=
         \\\\=   _.~
        _|/||||)_
        \\\        \\\
     
      `);
});

globalEnv.def("lion", () => {
  process.exit();
});

// process argv 2 in this case is the file name or path
if (process.argv[2]) {
  fs.readFile(process.argv[2], "utf-8", (err, data) => {
    if (err) throw err;
    code = data;
    run(code);
  });
} else {
  consoleProgramming();
}

function consoleProgramming() {
  rl.question("zebra> ", (code) => {
    run(code);
    consoleProgramming();
  });
}

function run(code) {
  var ast = parse(TokenStream(InputStream(code)));
  var val = evaluate(ast, globalEnv);
  console.log(val);
  evaluate(ast, globalEnv);
}
