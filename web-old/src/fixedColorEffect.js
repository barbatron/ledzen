const R = 10;
const G = 10;
const B = 10;

export function fixedColorEffect(rgbCallback) {
	console.log('Sending', [R, G, B]);
	rgbCallback([R, G, B]);
}