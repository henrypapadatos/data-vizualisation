import COUNTRIES from "../data/countries.json" assert { type: "json" };
import { draw2DMap, draw2DMap2 } from "./maps.js";
import { drawCrowd } from "./crowd.js";
import { drawLineChart } from "./distribution.js";
import { drawBubbles } from "./interactive_bubbles.js";
import { drawGroups } from "./groupsBubbles.js";


function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
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

function rangeSliderController() {
	const rangeSlider = document.getElementById("donation-slider");
	const sliderValueLabel = document.getElementById("donation-slider-val");

	rangeSlider.oninput = () => {
		if (rangeSlider.value > 10) {
			rangeSlider.step = 5;
		}
		else {
			rangeSlider.step = 1;
		}
		sliderValueLabel.textContent = rangeSlider.value + "%";
	};
}

function createSlider() {
	const sliderContainer = d3.select("#visuals").append("div").attr("id", "floating-slider-container")
	sliderContainer.append("div").attr("id", "slider")
	// sliderContainer.append("div").attr("id", "value-bubble")

	const sliderElement = document.getElementById("slider");
	// const valueBubble = document.getElementById("value-bubble");

	function filterPips(value, type){
		if (type === 0) {
			return value < 5 ? -1 : 2;
		}
		return value % 10 ? 2 : 1;
	}

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
		// valueBubble.innerText = Math.round(parseFloat(values[handle]));
	  });
	  
	  // Update the value bubble on page load
	  sliderElement.noUiSlider.set(10);
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
	drawBubbles();
	drawCrowd(100);

	// Scroll visuals into view
	calculateButton.scrollIntoView({behavior: "smooth"});
}



whenDocumentLoaded(() => {
	displayVisuals();
	populateCountriesDropdown();
	armCalculateButton();

});
