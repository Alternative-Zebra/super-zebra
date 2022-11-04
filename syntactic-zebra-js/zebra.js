#!/usr/bin/env node
import fs from "fs"; // Import's file system manager
import five from "johnny-five"; //Johnny-five is our arduino bridge
import chalk from "chalk"; // Chalk.js for coloring the terminal when needed (used in some -g function)

import { applyOperator } from "./functions/core/applyOperators.js";
import { parse } from "./functions/core/parser.js"; // That's our parser
import { TokenStream } from "./functions/core/tokenStream.js"; // That's our tokenizer
import { InputStream } from "./functions/core/inputStream.js"; // That's our code "reader"
import { globalFunctions } from "./functions/core/globals.js"; // That's our global functions
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
  getAllVars() {
    return this.vars;
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

    case "array":
      exp.arrayVars.forEach((variable) => {
        env.def(variable.name, variable.value);
      });
      return;

    case "array_add":
      env.def(exp.item.name, exp.item.value);
      return;

    case "assign":
      if (exp.left.type != "var")
        throw new Error("Cannot assign to " + JSON.stringify(exp.left));
      return env.set(exp.left.value, evaluate(exp.right, env));

    case "binary":
      return applyOperator(
        exp.operator,
        evaluate(exp.left, env),
        evaluate(exp.right, env)
      );

    case "func":
      return make_func(env, exp);

    case "arduino":
      return make_arduino_env(env, exp).apply(null, env);

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

function make_func(env, exp) {
  function func() {
    var names =  exp.vars;
    var scope = env.extend();
    for (var i = 0; i < names.length; ++i)
      scope.def(names[i], i < arguments.length ? arguments[i] : false);
    return evaluate(exp.body, scope);
  }
  return func;
}

function make_arduino_env(env, exp) {
  function arduino() {
    var functions = exp.prog;

    functions.forEach((func) => {
      evaluate(func, env);
    });
  }
  return arduino;
}

/* -----[ global function in zebra ]----- */
var code = ""; // Needed for storing the full code in a variable, don't remove!
var globalEnv = new Environment(); // Our global environment

globalFunctions.forEach((func) => {
  globalEnv.def(func.name, func);
});

// ==================================================================== //
import readline from "readline";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// process argv 2 in this case is the file name or path
if (process.argv[2]) {
  fs.readFile(process.argv[2], "utf-8", (err, data) => {
    if (err) throw err;
    code = data;
    run(code);
  });
} else {
  console.clear();
  consoleProgramming();
}

function consoleProgramming() {
  rl.question("zebra> ", (code) => {
    if (code.includes("arduino")) {
      console.log(
        "Can't use arduino expressions when using the console programming mode"
      );
      process.exit();
    }
    run(code);
    consoleProgramming();
  });
}

function run(code) {
  if (process.argv[3] == "arduino") {
    console.log("zebra> " + "Arduino mode enabled");
    var board = new five.Board();
    board.on("ready", () => {
      var ast = parse(TokenStream(InputStream(code)));
      evaluate(ast, globalEnv);
    });
  } else {
    var ast = parse(TokenStream(InputStream(code)));
    evaluate(ast, globalEnv);
  }
}

// ==================================================================== //
