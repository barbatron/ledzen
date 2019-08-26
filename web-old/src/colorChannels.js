const RGB_RED = 'rgb(255,0,0)';
const RGB_GREEN = 'rgb(0,255,0)';
const RGB_BLUE ='rgb(0,0,255)';

const ColorCompensation = {
	RED: 0.65,
	GREEN: 1.5,
	BLUE: 0.75,
};

const AudioChannels = {
	LOW: {
		position: 0.07,
		factor: 0.7,
	},
	MID: {
		position: 0.21,
		factor: 1.25,
	},
	HIGH: {
		position: 0.4,
		factor: 1.6,
	}
}

// AudioAnalysis
export const AudioAnalysisChannelSettings = {
	RED: {
		...AudioChannels.HIGH,
		barColor: RGB_RED,
		compensation: ColorCompensation.RED,
	},
	GREEN: {
		...AudioChannels.LOW,
		barColor: RGB_GREEN,
		compensation: ColorCompensation.GREEN,
	},
	BLUE: {
		...AudioChannels.MID,
		barColor: RGB_BLUE,
		compensation: ColorCompensation.BLUE,
	}
};

// Cycle
export const ColorCycleChannelSettings = {
	RED: {
		factor: 0.7,
		barColor: RGB_RED,
	},
	GREEN: {
		factor: 1,
		barColor: RGB_GREEN,
	},
	BLUE: {
		factor: 0.7,
		barColor: RGB_BLUE,
	}
};


class Channel {
	constructor({position, factor, color, compensation}) {
		this.position = position;
		this.factor = factor * compensation;
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
export const createRgbChannels = (brightness, settings = ColorCycleChannelSettings) => {
	const createChannel = setting => new Channel({position: setting.position, factor: setting.factor * brightness, color: setting.barColor, compensation: setting.compensation });
	const red = createChannel(settings.RED, brightness);
	const green = createChannel(settings.GREEN, brightness);
	const blue = createChannel(settings.BLUE, brightness);
	return [red, green, blue];
};

