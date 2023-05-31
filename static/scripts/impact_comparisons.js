import { getDonatedAmount, getPreDonationIncome } from "./utility.js";

const costOfBednet = 5;
const costOfVitamin = 1;

export function createEventListenerForImpact() {
    const sliderElement = document.getElementById("slider");
 
	sliderElement.noUiSlider.on('update', (values, handle) => {
		const donationAmount = getDonatedAmount(); 
		loadImpactVisuals(donationAmount);
    })
}

export function loadImpactVisuals(donationAmount = getPreDonationIncome() * 0.1){
	
    const possibleBednets = Math.floor(donationAmount / costOfBednet);
    const possibleVitamins = Math.floor(donationAmount / costOfVitamin);
	animateValue(document.getElementById("bednet-count"), 0, possibleBednets, 1000);
    animateValue(document.getElementById("vitamin-count"), 0, possibleVitamins, 1000);
}

function animateValue(obj, start, end, duration) {
    // https://css-tricks.com/animating-number-counters/#the-new-school-css-solution
	let startTimestamp = null;
	const step = (timestamp) => {
	  if (!startTimestamp) startTimestamp = timestamp;
	  const progress = Math.min((timestamp - startTimestamp) / duration, 1);
	  obj.innerHTML = Math.floor(progress * (end - start) + start).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	  if (progress < 1) {
		window.requestAnimationFrame(step);
	  }
	};
	window.requestAnimationFrame(step);
}