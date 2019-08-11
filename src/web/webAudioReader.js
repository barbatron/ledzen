// Audio analysis params
const FFT_CHANNELS = 32;
const FFT_SMOOTHING = 0.5;


async function getUserMediaStream() {
	console.log('Acquiring user media stream');
	try {
  	return await navigator.mediaDevices.getUserMedia({ audio: true, video: false }); 
  } catch (err) {
  	console.error('Failed: ' + err.message);
  	throw err;
  }
}

export async function setupAudio(smoothing = FFT_SMOOTHING, channelCount = FFT_CHANNELS) {
	const stream = await getUserMediaStream();
	const audioCtx = new window.AudioContext();

	const analyser = audioCtx.createAnalyser();
	analyser.smoothingTimeConstant = FFT_SMOOTHING;
	analyser.fftSize = FFT_CHANNELS;
	
	const source = audioCtx.createMediaStreamSource(stream);
	source.connect(analyser);

	const bufferLength = analyser.frequencyBinCount;
	const dataArray = new Uint8Array(bufferLength);
	console.log('WebAudio analyser ready. Array length = %d', dataArray.length);

	const readFft = () => analyser.getByteFrequencyData(dataArray);

	return {readFft, dataArray, analyser};
}

console.log('Loaded webAudioReader');
