const costOfBednet = 5;
const costOfVitamin = 1;

export function loadImpactVisuals(income){
    const possibleBednets = Math.floor(income / costOfBednet);
    const possibleVitamins = Math.floor(income / costOfVitamin);
    animateValue(document.getElementById("bednet-count"), 0, possibleBednets, 3000);
    animateValue(document.getElementById("vitamin-count"), 0, possibleVitamins, 3000);
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