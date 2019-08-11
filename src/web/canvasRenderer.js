const colorFromBarHeight = barHeight => {
	const intens = barHeight + 100;
  	return `rgb(${intens}, ${intens}, ${intens})`;
}

export class CanvasRenderer {
	constructor(canvas, channels = []) {
		this.canvas = canvas;
		this.channels = channels;
	}

	getChannelIndex(channel, dataArray) {
		return Math.floor(channel.position * dataArray.length);
	}

	getColor(barIndex, barHeight, dataArray) {
		const matchingChannel = this.channels.find(channel => this.getChannelIndex(channel, dataArray) === barIndex);
		return matchingChannel ? matchingChannel.color : colorFromBarHeight(barHeight);  
	}

	draw(dataArray) {
	  const canvasCtx = this.canvas.getContext("2d");
	  const {width, height} = this.canvas;

	  const bufferLength = dataArray.length;
	  const sliceWidth = Math.ceil(width / bufferLength);
		const barWidth = sliceWidth - 1;
	 
	 	// Clear
	  canvasCtx.fillRect(0, 0, width, height);
	  
	  // Bars
	  for(var barIndex = 0; barIndex < bufferLength; barIndex++) {
	  	const barValue = dataArray[barIndex];
	  	const barHeight = barValue / 255.0 * height;
	  	const x = Math.ceil(barIndex * sliceWidth);
	    canvasCtx.fillStyle = this.getColor(barIndex, barHeight, dataArray);
	    canvasCtx.fillRect(x, height-barHeight, barWidth, barHeight);
	  }
	};
}

