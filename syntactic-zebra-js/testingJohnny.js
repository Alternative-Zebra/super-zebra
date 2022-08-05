import five from "johnny-five";
//when the board is ready, run the following code
const board = new five.Board();

var FUNCOES = [
  function led() {
    let led = new five.Led(13).on();
    console.log("led on");
  },
];

function main(FUNC) {
  board.on("ready", () => {
    var firstConnect = true;
    console.log("Sucessfully connected to Arduino");
    FUNC.forEach((func) => {
      func();
    });
  });
}
