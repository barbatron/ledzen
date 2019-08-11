/* ==================== Setup ==================== */
  // Duration is not what it says. It's a multiplier in the calculateIncrement() function.
  // duration = 1-4, fast-to-slow
export function ColorCycler(fps = 30, duration = 3) {
  let currentColor  = [0, 0, 0];
  let targetColor = [0, 0, 0];
  let distance;
  let increment;

  let updateTimer  = null;

  // A function to generate random numbers.
  // Will be needed to generate random RGB value between 0-255.
  function random() {
    if (arguments.length > 2) {
      return 0;
    }
    switch (arguments.length) {
      case 0:
        return Math.random();
      case 1:
        return Math.round(Math.random() * arguments[0]);
      case 2:
        var min = arguments[0];
        var max = arguments[1];
        return Math.round(Math.random() * (max - min) + min);
    }
  }

  // Generates a random RGB value.
  function generateRGB(min, max) {
    var min		= min || 0;
    var max		= min || 255;
    var color	= [];
    for (var i = 0; i < 3; i++) {
      var num = random(min, max);
      color.push(num);
    }
    return color;
  }

  // Calculates the distance between the RGB values.
  // We need to know the distance between two colors
  // so that we can calculate the increment values for R, G, and B.
  function calculateDistance(colorArray1, colorArray2) {
    var distance = [];
    for (var i = 0; i < colorArray1.length; i++) {
      distance.push(Math.abs(colorArray1[i] - colorArray2[i]));
    }
    return distance;
  }

  // Calculates the increment values for R, G, and B using distance, fps, and duration.
  // This calculation can be made in many different ways.
  function calculateIncrement(distanceArray, fps, duration) {
    var fps			= fps || 30;
    var duration	= duration || 1;
    return distanceArray.map((distance, i) => distanceArray[i] / (fps * duration));
  }

  // Converts RGB array [32,64,128] to HEX string #204080
  // It's easier to apply HEX color than RGB color.
  function rgb2hex(colorArray) {
    var color = [];
    for (var i = 0; i < colorArray.length; i++) {
      var hex = colorArray[i].toString(16);
      if (hex.length < 2) { hex = "0" + hex; }
      color.push(hex);
    }
    return "#" + color.join("");
  }

  /* ==================== Transition Calculator ==================== */
  function transition() {
    // checking R
    currentColor = currentColor.map((currentColorPart, i) => currentColorPart += increment[i]);

    // transition ended. start a new one
    const remainder = calculateDistance(currentColor, targetColor).reduce((sum, part) => sum + part, 0);
    if (remainder < 2) {
      return true;
    } 

    return false; 
  }

  function stopTransition() {
    if (updateTimer) {
      clearInterval(updateTimer);
      updateTimer = null;
    }
  }

  /* ==================== Transition Initiator ==================== */
  function startTransition(onNext, onDone) {
    stopTransition();

    targetColor	= generateRGB();
    distance	= calculateDistance(currentColor, targetColor);
    console.log('New target color: %s %s %s [%.2f %.2f %.2f]', ...targetColor, ...distance);
    increment	= calculateIncrement(distance, fps, duration);

    updateTimer = setInterval(function() {
      const transitionDone = transition();
      onNext(currentColor);
      if (transitionDone) {
        onDone();
      }
    }, 1000/fps);
  }

  return {
    startTransition,
    stopTransition,
  };
}