const RGB_RED = 'rgb(255,0,0)';
const RGB_GREEN = 'rgb(0,255,0)';
const RGB_BLUE ='rgb(0,0,255)';

// AudioAnalysis
export const AudioAnalysisChannelSettings = {
	RED: {
		position: 0.07,
		factor: 0.7,
		barColor: RGB_RED,
	},
	GREEN: {
		position: 0.25,
		factor: 1.75,
		barColor: RGB_GREEN,
	},
	BLUE: {
		position: 0.4,
		factor: 1.5,
		barColor: RGB_BLUE,
	}
};

// Cycle
export const ColorCycleChannelSettings = {
	RED: {
		factor: 1,
		barColor: RGB_RED,
	},
	GREEN: {
		factor: 1,
		barColor: RGB_GREEN,
	},
	BLUE: {
		factor: 1,
		barColor: RGB_BLUE,
	}
};



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

	// TODO: Move to audioAnalysis dept
	getIndex(bufferLength) {
		return Math.floor(this.position * bufferLength);
	}

	set(value) {
		this.value = value;
		return this.get()
	}

	get() {
		return Channel._lerp8(this.value * this.factor);
	}

	// TODO: Move to audioAnalysis dept
	readValue(dataArray) {
		const index = this.getIndex(dataArray.length);
		this.set(dataArray[index]);
		return this.get();
	}
}

// Channel position in the FFT array 0-1 = bass->treble
export const createRgbChannels = (brightness, settings) => {
	const createChannel = setting => new Channel({position: setting.position, factor: setting.factor * brightness, color: setting.barColor });
	const red = createChannel(settings.RED, brightness);
	const green = createChannel(settings.GREEN, brightness);
	const blue = createChannel(settings.BLUE, brightness);
	return [red, green, blue];
};

