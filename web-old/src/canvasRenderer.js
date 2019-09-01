const colorFromBarHeight = barHeight => {
	const intens = (Math.round(barHeight * 200.0) + 50) / 255.0;
	return `rgb(255, 255, 255, ${intens})`;
}

let renderer;

export class CanvasRenderer {
	constructor(canvas, channels = []) {
		this.canvas = canvas;
		this.channels = channels;
		this.canvasCtx = this.canvas.getContext('2d');
		this.createChannelGradients(channels);
		renderer = this;
	}

	createChannelGradients(channels) {
		const {height} = this.canvas;
		const {canvasCtx} = this;
		this.channelGradients = this.channels
			.map(channel => {
				const gradient = canvasCtx.createLinearGradient(0, 0, 0, height);
				gradient.addColorStop(0, `rgba(${channel.color[0]}, ${channel.color[1]}, ${channel.color[2]}, 0)`);
				gradient.addColorStop(1, `rgba(${channel.color[0]}, ${channel.color[1]}, ${channel.color[2]}, 0.7)`);
				return gradient;
			});
	}

	getChannelIndex(channel, dataArray) {
		return Math.floor(channel.position * dataArray.length);
	}

	_drawBar(index, barHeight, sliceWidth, fillStyle) {
	  	const {width, height} = this.canvas;
			const barWidth = sliceWidth - 1;
			const {canvasCtx} = this;

	  	const actualBarHeight = barHeight * height;
	  	const x = Math.ceil(index * sliceWidth);
	    canvasCtx.fillStyle = fillStyle;
	    canvasCtx.fillRect(x, height-actualBarHeight, barWidth, actualBarHeight);
	}

	draw(dataArray) {
		const {canvasCtx} = this;
	  const {width, height} = this.canvas;
  	const bufferLength = dataArray.length;
  	const sliceWidth = Math.ceil(width / bufferLength);
		const barWidth = sliceWidth - 1;	
	 
	 	// Clear
	 	canvasCtx.fillStyle = 'rgb(50, 50, 50)';
	  canvasCtx.fillRect(0, 0, width, height);
	  
	  // Bars
	  for(let barIndex = 0; barIndex < bufferLength; barIndex++) {
	  	const barValue = dataArray[barIndex];
	  	const barHeight = barValue / 255.0;
	  	const fillStyle = colorFromBarHeight(barHeight);
	  	this._drawBar(barIndex, barHeight, sliceWidth, fillStyle);
	  }

	  // Channel position indicators 
	  this.channels.forEach((channel, channelIndex) => {
	  	const index = this.getChannelIndex(channel, dataArray);
	  	if (index < 0 || index > dataArray.length) {
	  		return;
	  	};
	  	const channelGradient = this.channelGradients[channelIndex]
	  	this._drawBar(index, 1.0, sliceWidth, channelGradient);
	  });

	  // Channel output levels
	  this.channels.forEach(channel => {
	  	const barValue = channel.readValue(dataArray);
	  	const barHeight = barValue / 255.0 * height;
	  	canvasCtx.strokeStyle = 'white'; //channel.color;
	  	canvasCtx.lineWidth = "2";
	  	const x = Math.ceil(this.getChannelIndex(channel, dataArray) * sliceWidth);
			canvasCtx.beginPath();
			canvasCtx.moveTo(x, height-barHeight);
			canvasCtx.lineTo(x + barWidth, height-barHeight);
	  	//canvasCtx.rect(x, height-barHeight, barWidth, barHeight);
	  	canvasCtx.stroke();
	  });
	};
}

const handleResize = () => {
	const canvas = document.getElementById('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	if (renderer)	renderer.createChannelGradients(renderer.channels);
}

window.addEventListener('resize', handleResize);

handleResize();