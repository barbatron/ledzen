import {CanvasRenderer} from "./canvasRenderer.js";
import {setupAudio} from "./webAudioReader.js";
import {
	createRgbChannels, 
	ColorCycleChannelSettings,
	AudioAnalysisChannelSettings
} from "./colorChannels.js";
import {WsClient} from "./webSocketClient.js";
import {ColorCycler} from "./ColorCycler.js";

// LED output params
const WEBSOCKET_UPDATE_INTERVAL = 5;
const BRIGHTNESS = 0.1;

const SMOOTHING_FACTOR = 0.2;

// ESP web socket server
const ESP_WS_URL = 'ws://192.168.0.106:81/';

async function audioAnalysisEffect(rgbCallback) {
	const {readFft, dataArray} = await setupAudio(SMOOTHING_FACTOR);
	const channels = createRgbChannels(BRIGHTNESS);

	const canvas = document.getElementById("canvas");
	const canvasRenderer = new CanvasRenderer(canvas, channels);

	// Start canvas rendering
	const readAndDraw = () => {
		readFft();
		canvasRenderer.draw(dataArray);
		window.requestAnimationFrame(readAndDraw);		
	};
	window.requestAnimationFrame(readAndDraw);

	// Start sending to ESP
	window.setInterval(() => {
		const rgbValues = channels.map(channel => channel.readValue(dataArray));
		rgbCallback(rgbValues);
	}, WEBSOCKET_UPDATE_INTERVAL);
}



function cyclingColorsEffect(rgbCallback) {
	const channels = createRgbChannels(BRIGHTNESS, ColorCycleChannelSettings);
	const colorCycler = new ColorCycler(30, 25);
	colorCycler.startTransition(rgb => {
		const rgbAdj = rgb.map((color, index) => channels[index].set(color));
		document.body.style.backgroundColor = `rgb(${rgbAdj[0]}, ${rgbAdj[1]}, ${rgbAdj[2]})`;
		rgbCallback(rgbAdj);
	});
}



function blackEffect(rgbCallback) {
	rgbCallback([0,0,0]);
}



async function run(effect) {
	console.log('Connecting to ESP...');
	const wsClient =  new WsClient(ESP_WS_URL);
	await wsClient.connect();
	console.log('Connected');
	effect(rgbColor => wsClient.sendRgb(rgbColor));
}

// Main entry point
try {
	run(cyclingColorsEffect);
} catch (err) {
  console.error(err);
}