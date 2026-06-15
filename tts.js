const synth = window.speechSynthesis;

let voices = [];

const textInput = document.getElementById("textInput");
const voiceSelect = document.getElementById("voiceSelect");
const rate = document.getElementById("rate");
const pitch = document.getElementById("pitch");

window.onload = () => {
	loadVoices();

	synth.onvoiceschanged = loadVoices;

	document.getElementById("speakBtn").addEventListener("click", speakText);

	document
		.getElementById("stopBtn")
		.addEventListener("click", () => synth.cancel());

	textInput.addEventListener("input", () => {
		document.getElementById("charCount").textContent =
			`${textInput.value.length} characters`;
	});
};

function loadVoices() {
	voices = synth.getVoices();

	voiceSelect.innerHTML = "";

	voices.forEach((voice, i) => {
		const option = document.createElement("option");
		option.value = i;
		option.textContent = `${voice.name} (${voice.lang})`;
		voiceSelect.appendChild(option);
	});
}

function speakText() {
	if (!textInput.value.trim()) return;

	synth.cancel(); // prevents overlap

	const utterance = new SpeechSynthesisUtterance(textInput.value);

	const selectedVoice = voices[voiceSelect.value];

	if (selectedVoice) {
		utterance.voice = selectedVoice;
	}

	utterance.rate = parseFloat(rate.value);
	utterance.pitch = parseFloat(pitch.value);

	synth.speak(utterance);
}
