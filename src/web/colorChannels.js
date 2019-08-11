const RGB_RED = 'rgb(255,0,0)';
const RGB_GREEN = 'rgb(0,255,0)';
const RGB_BLUE ='rgb(0,0,255)';

const ChannelSettings = {
	RED: {
		position: 0.07,
		factor: 0.65,
		barColor: RGB_RED,
	},
	GREEN: {
		position: 0.25,
		factor: 1.5,
		barColor: RGB_GREEN,
	},
	BLUE: {
		position: 0.4,
		factor: 1.8,
		barColor: RGB_BLUE,
	}
};

const createChannel = (settings, brightness) => new Channel({position: settings.position, factor: settings.factor * brightness, color: settings.barColor });

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

	getIndex(bufferLength) {
		return Math.floor(this.position * bufferLength);
	}

	readValue(dataArray) {
		const index = this.getIndex(dataArray.length);
		const value = dataArray[index];
		return Channel._lerp8(value * this.factor);
	}
}

// Channel position in the FFT array 0-1 = bass->treble
export const createRgbChannels = brighness => {
	const red = createChannel(ChannelSettings.RED, brighness);
	const green = createChannel(ChannelSettings.GREEN, brighness);
	const blue = createChannel(ChannelSettings.BLUE, brighness);
	return [red, green, blue];
};

