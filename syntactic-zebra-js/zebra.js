import { parse } from "./functions/parser.js";
import { TokenStream } from "./functions/tokenStream.js";
import { InputStream } from "./functions/inputStream.js";

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

    case "lambda":
      return make_lambda(env, exp);

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
    if (typeof x != "number") throw new Error("Expected number but got " + x);
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

function make_lambda(env, exp) {
  function lambda() {
    var names = exp.vars;
    var scope = env.extend();
    for (var i = 0; i < names.length; ++i)
      scope.def(names[i], i < arguments.length ? arguments[i] : false);
    return evaluate(exp.body, scope);
  }
  return lambda;
}

/* -----[ entry point for NodeJS ]----- */
import fs from "fs";

var globalEnv = new Environment();

globalEnv.def("time", function (func) {
  try {
    console.time("time");
    return func();
  } finally {
    console.timeEnd("time");
  }
});

if (typeof process != "undefined")
  (function () {
    globalEnv.def("heehaw", function (val) {
      return console.log(val);
    });

    globalEnv.def("zebra", function () {
      return console.log(`
      you called the zebra!
      
      _,,
      "-.\\=
         \\\\=   _.~
        _|/||||)_
        \\        \\
      `);
    });

    globalEnv.def("int", function (val) {
      return val;
    });

    var code = "";

    process.stdin.setEncoding("utf8");

    // process.stdin.on("readable", function () {
    //   var chunk = process.stdin.read();
    //   if (chunk) {
    //     code += chunk;
    //   }
    // });

    fs.readFile(process.argv[2], "utf-8", (err, data) => {
      if (err) throw err;
      code = data;
      run(code);
    });

    function run(code) {
      var ast = parse(TokenStream(InputStream(code)));
      evaluate(ast, globalEnv);
    }

    // create a function to get the code from the file

    // let fileContent = fs.readFileSync(process.argv[2], "utf8");
    // code = fileContent.split("\n");

    // process.stdin.end();
  })();
