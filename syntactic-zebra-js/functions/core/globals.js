import chalk from "chalk";
import five from "johnny-five"

/*-----------[arduino functions]---------------*/
const ledOn = (pin) => {
  let led = new five.Led(pin).on();
};

const ledOff = (pin) => {
  let led = new five.Led(pin).off();
};

const ledToggle = (pin) => {
  let led = new five.Led(pin).toggle();
};

const dPinOn = (pin) => {
  let digitalPin = new five.Pin(pin).high();
};

const dPinOff = (pin) => {
  let digitalPin = new five.Pin(pin).low();
};

/*-----------[end arduino functions]---------------*/
// Test-related functions

const test = (val, aiming) => {
  if (val === aiming) {
    console.log(
      chalk.green("Test returned the correct value " + val + "/" + aiming)
    );
  }
};

// Process-related functions
const lion = () => {
  process.exit();
};

// Output-related functions
const zebra = () => {
  console.log(`
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
};

const heehaw = (val) => {
  console.log(val);
};

const waheeh = (val) => {
  console.log(val.split("").reverse().join(""));
};

const clear = () => {
  console.clear();
}

export var globalFunctions = [
  ledOn,
  ledOff,
  ledToggle,
  lion,
  zebra,
  heehaw,
  waheeh,
  clear,
  test
];
