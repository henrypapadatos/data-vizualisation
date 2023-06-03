import { draw2DMap, createEventListenerForMap} from "./maps.js";
import { createEventListenerForCrowd } from "./crowd.js";
import { drawLineChart } from "./distribution.js";
import { drawCharityBubbles } from "./charity_bubbles.js";
import { drawGroups,createEventListenerForGroups } from "./groupsBubbles.js";
import { getInputIncome, getMedianIncome, getPreDonationIncome, getNumberOfAdults, getNumberOfChildren } from './utility.js'
import { createEventListenerForImpact, loadImpactVisuals } from "./impact_comparisons.js";

let visualsDisplayed = false;

// Helper function to execute an action when the document is loaded
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

// Cleanup function to remove all graphs from the page
function cleanup() {
	const visuals = document.getElementById("visuals");
	visuals.classList.add("hidden");

	document.getElementById("title-text").innerHTML = "";
	document.getElementById("distribution-container").innerHTML = "";
	document.getElementById("bubbleGroup-container").innerHTML = "";
	document.getElementById("map-container").innerHTML = "";
	document.getElementById("crowd-container").innerHTML = "";
	document.getElementById("bubbles-container").innerHTML = "";
}

// Populates the countries dropdown with options
function populateCountriesDropdown(countries) {
	const dropdown = document.getElementById('select-country');

	for (let i = 0; i < countries.length; i++) {
		const option = document.createElement('option');
		option.text = countries[i].name;
		option.value = countries[i].alpha2Code;
		dropdown.add(option);
	}

	dropdown.value = "US";
}

// Creates the slider for adjusting the value
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
		// Update value bubble
		let newValue = Math.round(parseFloat(values[handle]));
		valueBubble.innerText = newValue + "%";
		valueBubble.classList.toggle("pl-2", newValue < 10);
		valueBubble.classList.toggle("pl-1", newValue >= 10);
	});
	
	// Update the value bubble on page load
	sliderElement.noUiSlider.set(10);
	
	// Reorder the two noUi elements
	const nuUiBaseElement = sliderElement.children[0];
	const noUiPipsElement = sliderElement.children[1];
	sliderElement.insertBefore(noUiPipsElement, nuUiBaseElement);

	// Change the z-index of the pips element
	noUiPipsElement.style.zIndex = 1;

	// Remove the first and last marker elements
	noUiPipsElement.children[0].remove();
	noUiPipsElement.children[noUiPipsElement.children.length - 2].remove();

	d3.select('#slider-text').append("p").text("Donation \n amount:")

	// Change the pip values to have a % sign
	Array.from(noUiPipsElement.children).forEach(child => {
		if (child.classList.contains("noUi-value")) {
			child.innerHTML += "%";
		}
	});

	// Add event listeners for the slider
	const adults = document.getElementById("adults").value;
	const children = document.getElementById("children").value;
	createEventListenerForMap(adults, children);
	createEventListenerForImpact();
	createEventListenerForCrowd();
	createEventListenerForMap();
	createEventListenerForGroups();
}

// Handles country selection event
function armCountrySelection() {
	const countrySelect = document.getElementById("country-select");
	const currenciesNotInList = ["XK"]
	const manualCountryToCurrency = {"XK": "EUR"}
	countrySelect.addEventListener("change", (event) => {
		const selectedCountryCode = event.target.value;
		if (currenciesNotInList.includes(selectedCountryCode)) {
			document.getElementById("currency-label").innerText = manualCountryToCurrency[selectedCountryCode];
		}
		else {
			document.getElementById("currency-label").innerText = countryToCurrency[selectedCountryCode];
		}
	});
}

// Enforces input validation for income, adults, and children fields
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
		if (event.target.value < 0) {
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

// Check if the input is valid and within the allowed range
function isInputOk() {
	if (getInputIncome() === "" ) {
		displayError("Please enter your income");
		return false;
	}
	if (getNumberOfAdults() === "" || getNumberOfAdults() === "0") {
		displayError("Please enter the number of adults in your household");
		return false;
	}
	if (getNumberOfChildren() === "") {
		document.getElementById("children").innerHTML = 0;
	}
	return true;
}

// Displays error message
function displayError(message) {
	if (visualsDisplayed) {
		cleanup();
	}
	const errorElement = document.getElementById("error");
	errorElement.innerText = message;
}

// Handles the calculate button click event
function armCalculateButton() {
	
	document.getElementById("calc_button")
		.addEventListener("click", function() {

			if (getPreDonationIncome() < getMedianIncome()) {
				displayError("Sorry, but the income you entered is below the global median income. We only have data for incomes higher than the global median.");
				return;
			}
			if (isInputOk()){

				// Clear the contents of #visuals if they have already been displayed
				if (visualsDisplayed) {
					cleanup();
					const sections = Array.from(document.querySelectorAll(".visual"));
					sections
					.filter(section => section.classList.contains("active"))
					.forEach(section => section.classList.remove("active"));
				}
				document.getElementById("error").innerHTML = "";
				displayVisuals();
			};
	
	});
}

function displayTitleText(preDonationIncome){

	d3.select("#title-text").append("p")
		.attr("class", "font-bold text-3xl")
		.text(`If you have a household income of ${getInputIncome().toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} ${document.getElementById("currency-label").innerText}...`);

	// Round the equivalized income to the nearest 10
	const roundedIncome = Math.round(preDonationIncome/10)*10;

	d3.select('#title-text').append("p")
	.attr("class", "font-semibold text.xl pointer-events-auto flex justify-center ")
	.text(`Your household income is equivalent to ${roundedIncome.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} international dollars after\u00A0`)		
	.append('section')
		.attr("class", "font-medium hover:cursor-pointer cursor-pointer text-gwwc-purple")
		.text("equivalization")
		.on("click", function() {
			window.open("http://en.wikipedia.org/wiki/Equivalisation");
		})
		.on("mouseover", function() {
			d3.select(this)
				.style("text-decoration", "underline")
				.style("cursor", "pointer");
		})
		.on("mouseout", function() {
			d3.select(this).style("text-decoration", "none");
		});

	// Display downward arrow
	d3.select("#scroll-down-container")
	.attr("class", "visible");
}

// Changes the position of the slider based on scroll position
function changeSliderPosition() {
	const floatingElement = document.getElementById('floating-slider-container');
	const barrierLocation = 98; // % value. Adjust this value depending on viewport height
	
	// Get the current scroll position and viewport height
	const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
	const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

	// Calculate the new top value based on the scroll position
	if (scrollPosition / viewportHeight * 100 < 50) {
		floatingElement.style.top = barrierLocation - scrollPosition / viewportHeight * 100 + '%';
	}
	else {
		floatingElement.style.top = '50%';
	}
}

// Displays the visuals section
async function displayVisuals() {
	const calculateButton = document.getElementById("calculate");
	const preDonationIncome = getPreDonationIncome();

	visuals.classList.remove("hidden");
	
	// Loading this here to avoid lag later
	await draw2DMap(preDonationIncome, getNumberOfAdults(), getNumberOfChildren());
	await drawCharityBubbles();
	
	displayTitleText(preDonationIncome);

	if (!visualsDisplayed) {
		window.addEventListener("scroll", changeSliderPosition);

		visualsDisplayed = true;
	} 

	const distribution_transition_time = 3000;
	drawLineChart(preDonationIncome, distribution_transition_time)

	//Create slider after the line chart is drawn
	if (!document.getElementById("slider").classList.contains("active")) {
		setTimeout(() => {
			createSlider();
			document.getElementById("slider").classList.add("active");
			}, distribution_transition_time);
	}
	// Scroll visuals into view
	calculateButton.scrollIntoView({ behavior: "smooth" });
}

// Sets up the input section
function inputSectionSetup() {
	enforceInputValidation();
	armCalculateButton();
	fetch("static/data/UN_countries.json")
		.then(response => response.json())
		.then(countries => {
			populateCountriesDropdown(countries);
			armCountrySelection(countries);
		});	
}

// Reveals the visual sections when scrolling
function revealSection() {
	const revealPoint = 120;
	const windowHeight = window.innerHeight;
	const sections = Array.from(document.querySelectorAll(".visual"));
  
	sections.forEach(section => {
	  if (section.classList.contains("active")) {
		return;
	  }
  
	  let revealTop = section.getBoundingClientRect().top;
  
	  if (revealTop < windowHeight - revealPoint) {
		section.classList.add("active");
		switch (section.id) {
		  case "bubbleGroup-container":
			//hide the scroll down arrow when the user scrolls to the bubbles
			d3.select("#scroll-down-container").attr("class", "hidden");
			drawGroups();
			break;
		  case "map-container":
			d3.select("#map-container").append("p").attr("id", "dots").attr("class", "font-bold text-3xl").text("...")
			break;
		  case "impact-container":
			document.getElementById("dots").remove();
			loadImpactVisuals();
			break;
		  case "bubbles-container":
			// Dispatch the event
			document.dispatchEvent(new Event("bubblesContainerEvent"));
			break;
		  default:
			break;
		}
	  }
	});
  }

// Initialize the application
function initializeApp() {
	inputSectionSetup();
	window.addEventListener("scroll", revealSection);
}

// Load the app when the document is ready
whenDocumentLoaded(initializeApp);
