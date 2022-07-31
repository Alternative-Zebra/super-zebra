import five from "johnny-five";
//when the board is ready, run the following code
let board = new five.Board();

board.on("ready", () => {
  let proximity = new five.Proximity({
    controller: "HCSR04",
    pin: 7,
  });
  const led = new five.Led(2);
  const buzzer = new five.Pin(3);
  proximity.on("change", () => {
    if (proximity.cm < 10) {
      led.on();
    } else {
      led.off();
    }

    if (proximity.cm < 6) {
      // loop to play the buzzer
      buzzer.high();
      setTimeout(() => {
        buzzer.low();
      }, 1000);
    } else {
      buzzer.low();
    }
  });
});
