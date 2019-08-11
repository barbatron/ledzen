import {connectWs} from "./webSocketClient.js";

const readRgbValues = (channels, dataArray) => channels.map(channel => channel.readValue(dataArray));

export class EspWebSocketClient {
	constructor(channels, webSocketClient) {
		this.channels = channels;
		this.webSocketClient = webSocketClient;
	}
	
	sendRgb(dataArray) {
		const rgb = readRgbValues(this.channels, dataArray);
		this.webSocketClient.sendRgb(rgb);
	}
}
