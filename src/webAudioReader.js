// Audio analysis params
const FFT_CHANNELS = 32;
const FFT_SMOOTHING = 0.5;

// LED output params
const WEBSOCKET_UPDATE_INTERVAL = 5;
const BRIGHTNESS = 0.15;

const RGB_RED = 'rgb(255,0,0)';
const RGB_GREEN = 'rgb(0,255,0)';
const RGB_BLUE ='rgb(0,0,255)';

class Channel {
	constructor({position, factor, color}) {
		this.position = position;
		this.factor = factor;
		this.color = color;
	}
	static _lerp8(value) {
		if (value < 0) return 0;
		if (value > 255) return 255;
		return value;
	}
	getIndex(dataArray) {
		return Math.floor(this.position * dataArray.length);
	}
	readValue(dataArray) {
		const index = this.getIndex(dataArray);
		const value = dataArray[index];
		return Channel._lerp8(value * this.factor);
	}
}

// Channel position in the FFT array 0-1 = bass->treble
const RED_CHANNEL = new Channel({ position: 0.07, factor: 0.65 * BRIGHTNESS, color: RGB_RED });
const GREEN_CHANNEL = new Channel({	position: 0.25,	factor: 1.5 * BRIGHTNESS, color: RGB_GREEN });
const BLUE_CHANNEL = new Channel({ position: 0.4, factor: 1.8 * BRIGHTNESS, color: RGB_BLUE });

const channels = [RED_CHANNEL, GREEN_CHANNEL, BLUE_CHANNEL];

async function getUserMediaStream() {
	console.log('Acquiring user media stream');
	try {
  	return await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); 
  } catch (err) {
  	console.error('Failed: ' + err.message);
  	throw err;
  }
}

async function setupAudio() {
	const stream = await getUserMediaStream();
	const audioCtx = new window.AudioContext();
	const analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = FFT_SMOOTHING;
	const source = audioCtx.createMediaStreamSource(stream);
	source.connect(analyser);

	analyser.fftSize = FFT_CHANNELS;
	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);
	console.log('WebAudio analyser ready. Array length = %d', dataArray.length);
	return {analyser, dataArray};
}

async function setupCanvas() {
	const canvas = document.getElementById('canvas');
  const context = canvas.getContext("2d");

  context.fillStyle = 'rgb(200, 200, 200)';
  context.lineWidth = 2;
  context.strokeStyle = 'rgb(0, 0, 0)';

	return {canvas, context}; 
}

const colorFromBarHeight = barHeight => {
	const intens = barHeight + 100;
  	return `rgb(${intens}, ${intens}, ${intens})`;
}

const getColor = (barIndex, barHeight, dataArray) => {
	const matchingChannel = channels.find(channel => barIndex === channel.getIndex(dataArray));
	return matchingChannel ? matchingChannel.color : colorFromBarHeight(barHeight);  
}

// draw an oscilloscope of the current audio source
function draw(canvasCtx, dataArray) {
  const {width: WIDTH, height: HEIGHT} = canvasCtx.canvas;

  const bufferLength = dataArray.length;
  const sliceWidth = Math.ceil(WIDTH / bufferLength);

  canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);
  const barWidth = sliceWidth - 1;
 
  for(var i = 0; i < bufferLength; i++) {
  	const barValue = dataArray[i];
  	const barHeight = barValue / 256.0 * HEIGHT;
  	const x = Math.ceil(i * sliceWidth);
    canvasCtx.fillStyle = getColor(i, barHeight, dataArray);
    canvasCtx.fillRect(x, HEIGHT-barHeight, barWidth, barHeight);
  }
};

async function run() {
	try {
		// Audio analysis
		const {analyser, dataArray} = await setupAudio();
		const {canvas, context: canvasCtx} = await setupCanvas();
		
		// Rendering
		const readAndDraw = () => {
			window.requestAnimationFrame(readAndDraw);
			analyser.getByteFrequencyData(dataArray);
			draw(canvasCtx, dataArray);
		};

		// Kick off infinite canvas rendering
		window.requestAnimationFrame(readAndDraw);
		window.dataArray = dataArray;

		// Output to WebSocket
		const getChannelValue = channel => channel.readValue(dataArray);
		connectWs()
			.then(wsClient => {
				window.setInterval(() => {
					const r = getChannelValue(RED_CHANNEL);
					const g = getChannelValue(GREEN_CHANNEL);
					const b = getChannelValue(BLUE_CHANNEL);
					wsClient.sendRGB(r, g, b);
				}, WEBSOCKET_UPDATE_INTERVAL);
			});
	} catch (err) {
		console.error(err);
	}
}

console.log('Loaded webAudioReader');