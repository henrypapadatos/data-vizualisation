import { draw2DMap } from "./maps.js";
import { drawCrowd } from "./crowd.js";
import COUNTRIES from "../data/countries.json" assert { type: "json" };
import { drawLineChart } from "./distribution.js";

function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

function cleanup() {
	// Remove all graphs from the page when the tries to use the calculator again
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

whenDocumentLoaded(() => {

});
