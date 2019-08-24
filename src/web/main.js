import {CanvasRenderer} from "./canvasRenderer.js";
import {setupAudio} from "./webAudioReader.js";
import {
	createRgbChannels, 
	ColorCycleChannelSettings,
	AudioAnalysisChannelSettings
} from "./colorChannels.js";
import {WsClient} from "./webSocketClient.js";
import {ColorCycler} from "./ColorCycler.js";
import {displayState} from './ui.js';

import {fixedColorEffect} from './fixedColorEffect.js';
import {testEffect} from './testEffect.js';


// LED output params
const WEBSOCKET_UPDATE_INTERVAL = 50;
const BRIGHTNESS = 0.2;

const SMOOTHING_FACTOR = 0.2;

// ESP web socket server
const ESP_WS_URL = 'ws://192.168.0.106:81/';

async function audioAnalysisEffect(rgbCallback) {
	const {readFft, dataArray} = await setupAudio(SMOOTHING_FACTOR);
	const channels = createRgbChannels(BRIGHTNESS, AudioAnalysisChannelSettings);

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
	const colorCycler = new ColorCycler(30, 15);
	const handleNext = rgb => {
		const rgbAdj = rgb.map((color, index) => channels[index].set(color));
		document.body.style.backgroundColor = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
		document.body.setAttribute('data-out', `rgb(${Math.floor(rgbAdj[0])}, ${Math.floor(rgbAdj[1])}, ${Math.floor(rgbAdj[2])})`);
		rgbCallback(rgbAdj);
	};
	const startTransition = () => colorCycler.startTransition(handleNext, startTransition);
	startTransition();
}

function updateUi(rgbColor) {
	document.getElementById('currentR')
}

async function run(effect) {
	console.log('Connecting to ESP...');
	const wsClient =  new WsClient(ESP_WS_URL);
	await wsClient.connect();
	console.log('Connected');
	effect(rgbColor => {
		displayState(rgbColor);
		wsClient.sendRgb(rgbColor);
	});
}

// Main entry point
try {
	run(audioAnalysisEffect);
} catch (err) {
  console.error(err);
}