import COUNTRIES from "../data/countries.json" assert { type: "json" };
import { draw2DMap, draw2DMap2 } from "./maps.js";
import { drawCrowd } from "./crowd.js";
import { drawLineChart } from "./distribution.js";
import { drawCharityBubbles } from "./charity_bubbles.js";
import { drawGroups } from "./groupsBubbles.js";


function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
		drawCharityBubbles();
	} else {
		action();
	}
}

function cleanup() {
	// Remove all graphs from the page when the tries to use the calculator again
	document.getElementById("visuals").innerHTML = "";
}

function populateCountriesDropdown() {
	const dropdown = document.getElementById('select-country');
	
	for (let i = 0; i < COUNTRIES.length; i++) {
		if (COUNTRIES[i].code === "US") {
			continue;
		}
		const option = document.createElement('option');
		option.text = COUNTRIES[i].name;
		option.value = COUNTRIES[i].code;
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

	// Remove the last marker element
	noUiPipsElement.children[noUiPipsElement.children.length - 2].remove()

	// Change the pip values to have a % sign
	for (let i = 0; i < noUiPipsElement.children.length; i++) {

		if (noUiPipsElement.children[i].classList.contains("noUi-value")) {
			noUiPipsElement.children[i].innerHTML += "%";
		}
	}
}

function armCalculateButton() {
	const calculateButton = document.getElementById("calculate");
	const visuals = document.getElementById("visuals");
	calculateButton.addEventListener("click", function() {
		// Clear the contents of #visuals
		//cleanup();

		visuals.classList.remove("hidden");

		console.log("button clicked");
		displayVisuals();
	});
}

function displayVisuals() {
	const calculateButton = document.getElementById("calculate");
	const countryCode = document.getElementById("select-country").value;
	const income = document.getElementById("income").value;
	const adults = document.getElementById("adults").value;
	const children = document.getElementById("children").value;

	createSlider();
	drawLineChart();
	drawGroups();
	draw2DMap2(income, adults, children);
	drawCrowd(100);
	drawCharityBubbles();
	
	// Scroll visuals into view
	calculateButton.scrollIntoView({behavior: "smooth"});
}



whenDocumentLoaded(() => {
	populateCountriesDropdown();
	armCalculateButton();
});
