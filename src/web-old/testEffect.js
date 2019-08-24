const duration = 2000;
const ON = 255;

const strobe = [
	{color: [255, 255, 255], duration: 3},
	{color: [0, 0, 0], duration: 100},
];

const steps = [
	{color: [ON, 0, 0], duration},
	{color: [0, ON, 0], duration},
	{color: [0, 0, ON], duration},
	{color: [ON, ON, ON], duration: 4000},
	...strobe,
	...strobe,
	...strobe,
	...strobe,
	...strobe,
	...strobe,
	{color: [0, 0, 0], duration: 5000},
];

let stepIndex = -1;

const currentStep = () => steps[stepIndex];
const nextStep = () => (stepIndex + 1) % steps.length;

let callback;
let timer;

const advance = (toIndex = nextStep()) => {
	stepIndex = toIndex;
	console.log('Advance', stepIndex, currentStep().color, currentStep().duration);
	callback(currentStep().color);
	timer = setTimeout(advance, currentStep().duration || duration);
};

export function testEffect(rgbCallback, {stop}) {
	callback = rgbCallback;
	advance();
}
