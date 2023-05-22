import { draw2DMap } from "./maps.js";
import { drawCrowdofPeople } from "./crowd.js";
import { drawLineChart } from "./distribution.js";
import { drawCharityBubbles } from "./charity_bubbles.js";
import { drawGroups } from "./groupsBubbles.js";

let visualsDisplayed = false;

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

function cleanup() {
	// Remove all graphs from the page when the tries to use the calculator again
	document.getElementById("distribution-container").innerHTML = "";
	document.getElementById("bubbleGroup-container").innerHTML = "";
	document.getElementById("map-container").innerHTML = "";
	document.getElementById("crowd-container").innerHTML = "";
	document.getElementById("bubbles-container").innerHTML = "";
}

function populateCountriesDropdown(countries) {
	const dropdown = document.getElementById('select-country');
	const countriesToIgnore = ["US", "ATA"]

	for (let i = 0; i < countries.length; i++) {
		if (countriesToIgnore.includes[countries[i].code]) {
			continue;
		}
		const option = document.createElement('option');
		option.text = countries[i].name;
		option.value = countries[i].code;
		dropdown.add(option);
	}

	
}

function createSlider() {

	const sliderElement = document.getElementById("slider");
	const valueBubble = document.getElementById("value-bubble");

	noUiSlider.create(sliderElement, {
		start: 10,
		orientation: 'vertical',
		connect: 'lower',
		tooltips: false,
		range: {
		  	'min': [0],
			'10%':[10, 5],
		  	'max': [50]
		},
		direction: 'rtl',
		pips: {
		  mode: 'steps',
		  density: 10,
		  stepped: true
		}
	});
	  
	sliderElement.noUiSlider.on('update', (values, handle) => {
		// Update value button
		let newValue = Math.round(parseFloat(values[handle]));
		valueBubble.innerText = newValue + "%";
		for (let i = 0; i < valueBubble.classList.length; i++) {
			if (valueBubble.classList[i] === "pl-2" && newValue >= 10) {
				valueBubble.classList.remove("pl-2");
				valueBubble.classList.add("pl-1");
			}
			if (valueBubble.classList[i] === "pl-1" && newValue < 10) {
				valueBubble.classList.remove("pl-1");
				valueBubble.classList.add("pl-2");
			}
		}
	});
	
	// Update the value bubble on page load
	sliderElement.noUiSlider.set(10);
	
	// Reorder the two noUi elements
	const nuUiBaseElement = sliderElement.children[0];
	const noUiPipsElement = sliderElement.children[1];
	sliderElement.insertBefore(noUiPipsElement, nuUiBaseElement);

	// Change the z-index of the pips element
	noUiPipsElement.style.zIndex = 1;

	// Remove the first marker element
	noUiPipsElement.children[0].remove()

	// Remove the last marker element
	noUiPipsElement.children[noUiPipsElement.children.length - 2].remove()

	// Change the pip values to have a % sign
	for (let i = 0; i < noUiPipsElement.children.length; i++) {

		if (noUiPipsElement.children[i].classList.contains("noUi-value")) {
			noUiPipsElement.children[i].innerHTML += "%";
		}
	}
}

function armCountrySelection(countries) {
	
	const countrySelect = document.getElementById("country-select");
	
	countrySelect.addEventListener("change", (event) => {
		const selectedCountryCode = event.target.value;
		for (let i = 0; i < countries.length; i++) {
			if (countries[i].code === selectedCountryCode) {
				document.getElementById("currency-label").innerText = countryToCurrency[countries[i].alpha2Code];
				break;
			}			
		}
	});
}

function enforceInputValidation() {
	const incomeInput = document.getElementById("income");
	const adultsInput = document.getElementById("adults");
	const childrenInput = document.getElementById("children");
	
	incomeInput.addEventListener("input", (event) => {
		if (event.target.value < 0) {
			event.target.value = 0; 
		}
		if (event.target.value > 9999999) {
			event.target.value = 9999999; // A max of 10M a year should be enough
		}
	});
	
	adultsInput.addEventListener("input", (event) => {
		if (event.target.value < 1) {
			event.target.value = 1;
		}
		if (event.target.value > 9) {
			event.target.value = 9;
		}
	});
	
	childrenInput.addEventListener("input", (event) => {
		if (event.target.value < 0) {
			event.target.value = 0;
		}
		if (event.target.value > 9) {
			event.target.value = 9;
		}
	});
}

// function displayError() {
// 	const error = document.getElementById("error");
// 	error.classList.remove("hidden");
// }

function armCalculateButton() {
	const calculateButton = document.getElementById("calc_button");
	const globalMedianIncomePerAdult = 15547;
	
	
	calculateButton.addEventListener("click", function() {
		const income = document.getElementById("income").value;
		const adults = document.getElementById("adults").value;

		if ((income  / adults) < globalMedianIncomePerAdult) {
			displayError("Sorry, the income you entered is below the global median income. We only have data for incomes higher than the global median.");
			return;
		}
	
		// Clear the contents of #visuals
		if (visualsDisplayed) {
			cleanup();
		}

		displayVisuals();
	});
}

function changeSliderPosition() {
	const floatingElement = document.getElementById('floating-slider-container');
	const barrier_location = 100; // % value. Adjust this value depending on viewport height
	
	// Get the current scroll position
	const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

	// Calculate the new top value based on the scroll position
	if (scrollPosition / viewportHeight * 100 < 50) {
		floatingElement.style.top = barrier_location - scrollPosition / viewportHeight * 100 + '%';
	}
	else {
		floatingElement.style.top = 50 + '%';
	}

}

async function displayVisuals() {
	const income = document.getElementById("income").value;
	const calculateButton = document.getElementById("calculate");
	const adults = document.getElementById("adults").value;
	
	visuals.classList.remove("hidden");
	
	// Loading this here to avoid lag later
	await draw2DMap(income, adults, children);
	
	if (!visualsDisplayed) {
		createSlider();
		window.addEventListener("scroll", changeSliderPosition);
		visualsDisplayed = true;
	} 

	drawLineChart(income);

	// Scroll visuals into view
	calculateButton.scrollIntoView({behavior: "smooth"});	
}

function inputSectionSetup() {
	enforceInputValidation();
	armCalculateButton();
	fetch("static/data/countries.json")
		.then(response => response.json())
		.then(countries => {
			populateCountriesDropdown(countries);
			armCountrySelection(countries);
		})	
}

function animateValue(obj, start, end, duration) {
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

function revealSection() {
	const sections = document.querySelectorAll(".visual");
	const revealpoint = 120;
	const windowdheight = window.innerHeight;
	const income = document.getElementById("income").value;	

	for (let i = 0; i < sections.length; i++) {
		if (sections[i].classList.contains("active")) {
			continue;
		}

		let revealtop = sections[i].getBoundingClientRect().top;
		
		if (revealtop < windowdheight - revealpoint) {
			sections[i].classList.add("active");
			switch (sections[i].id) {
				case "bubbleGroup-container":
					drawGroups(income)
					break;
				case "map-container":
					// draw2DMap(income, adults, children);
					break;
				case "impact-container":
					// https://css-tricks.com/animating-number-counters/#the-new-school-css-solution
					animateValue(document.getElementById("bednet-count"), 0, 5432, 3000);
					animateValue(document.getElementById("vitamin-count"), 0, 12301, 3000);
					break;
				case "crowd-container":
					drawCrowdofPeople(100);
					break;
				case "bubbles-container":
					drawCharityBubbles();
			}
		}
	}
}


// ==================== MAIN ====================

whenDocumentLoaded(() => {
	inputSectionSetup()
	window.addEventListener("scroll", revealSection);	
});	
