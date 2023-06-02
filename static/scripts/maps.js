export {draw2DMap, redraw2DMap, createEventListenerForMap};
import { getEquivalizeIncome, getMedianIncome, getAfterDonationIncome} from './utility.js'

const response = await fetch("static/data/gni_per_capita.json"); 
const GNI_PER_CAPITA = await response.json();

let country_ratios = {};

function createEventListenerForMap(adults, children) {
	const sliderElement = document.getElementById("slider");
	sliderElement.noUiSlider.on('update', (values, handle) => {
		let ratioToMedianIncome = (
			getEquivalizeIncome(getAfterDonationIncome(), adults, children) 
			/ getEquivalizeIncome(getMedianIncome(), adults, children))
			.toFixed(1);
		document.getElementById("map-title-text").innerHTML = `... and your after-donation income would be <u class="font-bold">${ratioToMedianIncome}</u> times the global median.`;
        
		redraw2DMap(adults, children);
    })
}

function redraw2DMap() {

	const map = d3.select("#map");
	const color = d3.scaleThreshold().domain([1, 3, 5, 10, 20, 100]).range(['#eeeeee', '#fee5da', '#fbbba3', '#fb9276', '#fa6b51', '#dd302e', '#a4141c'])
	
	map.selectAll(".country")
		.attr("fill", function(country, i) { 
		
			// Color based on the proportion of your average income compared to other countries
			if (!(country.properties.code in GNI_PER_CAPITA)) {
				return "white";
			}
			
			let ppp_avg_income = GNI_PER_CAPITA[country.properties.code]["income"]
			let newRatio = getEquivalizeIncome(getAfterDonationIncome(), adults, children) / getEquivalizeIncome(ppp_avg_income, adults, children);
		
			if (newRatio < 5) {
				newRatio = newRatio.toFixed(1);
			}
			else {
				newRatio = Math.round(newRatio);
			}
			country_ratios[country.properties.code] = newRatio;
			return color(newRatio); 
		})
}

// TO TRY: https://web.dev/rendering-performance/
function draw2DMap(income, adults, children) {

	const afterDonationIncome = income * 0.9;

	return new Promise(resolve => {
		console.log("draw2DMap");
		// Code and tutorial from https://bost.ocks.org/mike/map
		const margin = {top: 0, right: 0, bottom: 0, left: 0};
		const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
		const height =  (width - margin.top - margin.bottom) * 9 / 16 ;

		const mapConatiner = d3.select("#map-container");

		let ratioToMedianIncome = (afterDonationIncome / getEquivalizeIncome(getMedianIncome(), adults, children)).toFixed(1);

		mapConatiner
			.append("p")
			.attr("id", "map-title-text")
			.attr("class", "font-bold text-3xl")
			.html(`... and your after-donation income would be <u class="font-bold">${ratioToMedianIncome}</u> times the global median.`);
		d3.json("static/data/updated-countries-50m.json").then((world) => {
			const land = topojson.feature(world, world.objects.countries);
			const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
			
			// Adding the svg element
			let svg = mapConatiner
						.append("svg")
						.attr("width", width)
						.attr("height", height)
						.attr("id", "map-svg");
	
			// Adding a group element for the map
			let map = svg.append("g")
				.attr("id", "map");
			
			let ending = "Hover over";
			if (window.screen.width < 1024) {
				ending = "Tap on";
			}
			mapConatiner
				.append("p")
				.attr("class", "")
				.text(`(${ending} countries to see your income compared to their average income)`)
			// Adding legend color scale
			const color = d3.scaleThreshold().domain([1, 3, 5, 10, 20, 100]).range(['#eeeeee', '#fee5da', '#fbbba3', '#fb9276', '#fa6b51', '#dd302e', '#a4141c'])
	
			// Adding individual countries as paths
			map.selectAll(".country")
				.data(land.features)
				.enter()
				.append("path")
				.attr("class", function(country) { return "country " + country.properties.code;  }) 
				.attr("d", d3.geoPath().projection(projection))
				.style("stroke", "grey")
				.attr("stroke-width", "0.4px")
				.attr("fill", function(country, i) { 
	
					// Color based on the proportion of your average income compared to other countries
					if (!(country.properties.code in GNI_PER_CAPITA)) {
						return "white";
					}
					// Load the first visual after all countries have been drawn
					if (i == 240) {
						resolve();	
					}
					
					let ppp_avg_income = GNI_PER_CAPITA[country.properties.code]["income"]
					let ratio = afterDonationIncome / getEquivalizeIncome(ppp_avg_income, adults, children);
					if (ratio < 5) {
						ratio = ratio.toFixed(1);
					}
					else {
						ratio = Math.round(ratio);
					}
					country_ratios[country.properties.code] = ratio;
					return color(ratio); 
				})
				map.selectAll(".country")
				.on("mouseover", function(event) {
					// Update the information box with the country name
					d3.select("body")
						.append("div")
						.attr("id", "info-box")
						.html(() => { 
							if (country_ratios[event.target.__data__.properties.code] == undefined) {
								return `<h3 class="font-medium text-sm">${event.target.__data__.properties.name}</h3><p class="text-xs">No data available</p>`
							}
							return `<h3 class="font-medium text-sm">${event.target.__data__.properties.name}</h3>
							<p class="text-xs">Your income is aprox. <strong>${country_ratios[event.target.__data__.properties.code]}&nbsp;times</strong><br>their average income</p>`	
						})
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 40 + "px");;
				})
	
				.on("mouseout", () =>{
					// Hide the information box
					d3.select('#info-box').remove();
				});
			
			// Adding a zoom feature only if the screen is small 
			if (window.screen.width < 1024) {
				// https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar
				svg.call(d3.zoom()
					.scaleExtent([1, 3])
					.translateExtent([[0, 0], [width, height]])
					.on("zoom", event => {
						map.attr("transform", event.transform);
		
						// A nice feature, but sadly causes the map to lag
						// d3.selectAll(".country").attr("stroke-width", 1 / event.transform.k  + "px");
					})
				);
			}
	
		});
	})
}
