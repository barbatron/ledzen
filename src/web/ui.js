let labelR;
let labelG;
let labelB;
let ready = false;

console.log('UI> Finding elements');
labelR = document.getElementById('currentR');
labelG = document.getElementById('currentG');
labelB = document.getElementById('currentB');
ready = labelR && labelG && labelB;
if (!ready) {
	console.warn('Unable to locate elements');
}

const format = value => typeof value === 'number' ? value.toFixed(2) : '-'

export function displayState([r, g, b]) {
	if (!ready) {
		console.warn()
		return;
	}
	labelR.value = format(r);
	labelG.value = format(g);
	labelB.value = format(b);
}
