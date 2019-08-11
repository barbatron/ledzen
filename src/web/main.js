import {CanvasRenderer} from "./canvasRenderer.js";
import {setupAudio} from "./webAudioReader.js";
import {createRgbChannels} from "./colorChannels.js";
import {WsClient} from "./webSocketClient.js";

// LED output params
const WEBSOCKET_UPDATE_INTERVAL = 5;
const BRIGHTNESS = 0.15;

// ESP web socket server
const ESP_WS_URL = 'ws://192.168.0.106:81/';

async function run() {
	const {readFft, dataArray} = await setupAudio();
	const channels = createRgbChannels(BRIGHTNESS);

	const canvas = document.getElementById("canvas");
	const canvasRenderer = new CanvasRenderer(canvas, channels);

	console.log('Connecting to ESP...');
	const wsClient =  new WsClient(ESP_WS_URL);
	await wsClient.connect();
	console.log('Connected');

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
		wsClient.sendRgb(rgbValues);
	}, WEBSOCKET_UPDATE_INTERVAL);
}

// Main entry point
try {
	run();
} catch (err) {
  console.error(err);
}