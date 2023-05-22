export {draw2DMap};
// import { changeMapLoaded } from "./main";

const response = await fetch("static/data/gni_per_capita.json"); 
const GNI_PER_CAPITA = await response.json();
// WorkingBatchingAlternative
function draw2DMapBatched2(income, adults, children){
	return new Promise(resolve => {

		const margin = {top: 0, right: 0, bottom: 0, left: 0};
		const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
		const height =  (width - margin.top - margin.bottom) * 9 / 16 ;
		const batchSize = 100;
		
		d3.json("static/data/updated-countries-50m.json").then((world) => {
			const land = topojson.feature(world, world.objects.countries);
			const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
			
			let svg = d3.select("#map-container")
						.append("svg")
						.attr("width", width)
						.attr("height", height);
			let map = svg.append("g").attr("class", "map");
		
			// Create an array to store the country paths
			const countryPaths = land.features.map((country) => {
				return {
				id: country.properties.code,
				path: d3.geoPath().projection(projection)(country)
				};
			});
	
			// Function to draw a batch of circles
			function drawBatch(startIndex, endIndex) {
				svg.selectAll(".country")
				.data(countryPaths.slice(startIndex, endIndex), (d) => d.id)
				.enter()
				.append("path")
				.attr("class", (d) => "country " + d.id)
				.attr("d", (d) => d.path)
				.style("stroke", "grey")
				.attr("stroke-width", "0.4px");
			}
		
			// Function to handle batching and rendering
			function renderBatchedCircles() {
				let currentIndex = 0;
		
				function render() {
				const endIndex = Math.min(currentIndex + batchSize, countryPaths.length);
		
				// Draw a batch of circles
				drawBatch(currentIndex, endIndex);
		
				currentIndex += batchSize;
		
				// If there are more circles to draw, request the next frame
				if (currentIndex < countryPaths.length) {
					requestAnimationFrame(render);
				}
				}
		
				// Start the rendering process
				render();
			}
			renderBatchedCircles();
		})
	})
}

function draw2DMapWorkingBatchedPrototype(income, adults, children){
	const margin = {top: 0, right: 0, bottom: 0, left: 0};
	const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
	const height =  (width - margin.top - margin.bottom) * 9 / 16 ;
	const batchSize = 15;
	
	d3.json("static/data/updated-countries-50m.json").then((world) => {
		const land = topojson.feature(world, world.objects.countries);
		const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
		
		let svg = d3.select("#map-container")
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		let map = svg.append("g").attr("class", "map");
	
		// Create an array to store the country paths
		const countryPaths = land.features.map((country) => {
			return {
			id: country.properties.code,
			path: d3.geoPath().projection(projection)(country)
			};
		});

		const drawBatch = (startIndex) => {
			const paths = map.selectAll(".country")
							 .data(countryPaths.slice(startIndex, startIndex + batchSize), (d) => d.id)
							 .enter()
							 .append("path")
							 .attr("class", (d) => "country " + d.id)
							 .attr("d", (d) => d.path)
							 .style("stroke", "grey")
							 .attr("stroke-width", "0.4px");

			// Check if there are more countries to draw
			if (startIndex + batchSize < countryPaths.length) {
				// Schedule the next batch after the current one is drawn
				// d3.timer(() => drawBatch(startIndex + batchSize), 0);
				setTimeout(drawBatch(startIndex + batchSize), 0);
			}
		};
		setTimeout(drawBatch(0),0);
	})
}

function draw2DMapFailAttempt(income, adults, children) {
	// Code and tutorial from https://bost.ocks.org/mike/map
	let country_ratios = {};
	const BATCHSIZE = 15

	const margin = {top: 0, right: 0, bottom: 0, left: 0};
	const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
	const height =  (width - margin.top - margin.bottom) * 9 / 16 ;

	d3.json("static/data/updated-countries-50m.json").then((world) => {
		const land = topojson.feature(world, world.objects.countries);
		const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
				
		let svg = d3.select("#map-container").data([0]);
		svg.enter().append("svg")
			.attr("width", width)
			.attr("height", height)
			.attr("id", "map-svg");

		// Adding a group element for the map
		let map = svg.append("g").attr("class", "map");

		// Adding legend color scale
		const color = d3.scaleThreshold().domain([1, 3, 5, 10, 20, 100]).range(['#eeeeee', '#fee5da', '#fbbba3', '#fb9276', '#fa6b51', '#dd302e', '#a4141c'])

		// Adding individual countries as paths
		let countries = svg.selectAll("country").data(land.features)

		function drawBatch(batchnumber) {
			return function() {
				let startIndex = batchnumber * BATCHSIZE;
				console.log("startIndex",startIndex);
				let stopIndex = Math.min(startIndex + BATCHSIZE, land.features.length);
				console.log("stopIndex",stopIndex);
				let updateSelection = d3.selectAll(countries._enter[0].slice(startIndex, stopIndex))
				console.log("updateSelection",updateSelection);
				let enterSelection = d3.selectAll(countries.enter()[0].slice(startIndex, stopIndex));
				console.log("enterSelection",enterSelection);
				let exitSelection = d3.selectAll(countries.exit()[0].slice(startIndex, stopIndex));

				enterSelection.each(function(d, i) {
					let newElement = map.append("path")[0][0];
					enterSelection[0][i] = newElement;
					updateSelection[0][i] = newElement;
					newElement.__data__ = this.__data__;
				})
				.attr("class", function(country) { return "country " + country.properties.code;  }) 
				.attr("stroke-width", "0.4px")
				.style("stroke", "grey")
				.attr("fill", function(country) { 

					// Color based on the proportion of your average income compared to other countries
					if (!(country.properties.code in GNI_PER_CAPITA)) {
						return "white";
					}
					
					let ppp_avg_income = GNI_PER_CAPITA[country.properties.code]["income"]
					let ratio = income /  (ppp_avg_income * adults);
					if (ratio < 5) {
						ratio = ratio.toFixed(1);
					}
					else {
						ratio = Math.round(ratio);
					}
					country_ratios[country.properties.code] = ratio;
					
					return color(ratio); 
				})

				exitSelection.remove();

				updateSelection
					.attr("d", d3.geoPath().projection(projection))

				if (stopIndex < land.features.length) {
					setTimeout(drawBatch(batchnumber + 1), 0);
				}
			}
		}
		setTimeout(drawBatch(0), 0);
	});
}

function draw2DMap(income, adults, children) {
	return new Promise(resolve => {

		// Code and tutorial from https://bost.ocks.org/mike/map
		let country_ratios = {};
	
		const margin = {top: 0, right: 0, bottom: 0, left: 0};
		const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
		const height =  (width - margin.top - margin.bottom) * 9 / 16 ;
	
		d3.json("static/data/updated-countries-50m.json").then((world) => {
			const land = topojson.feature(world, world.objects.countries);
			const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
			
			// Adding the svg element
			let svg = d3.select("#map-container")
						.append("svg")
						.attr("width", width)
						.attr("height", height)
						.attr("id", "map-svg");
			
			// Adding a background rectangle
			// svg.append("rect")
			// 	.attr("width", width)
			// 	.attr("height", height)
			// 	.style("fill", "#ADD8E6")
			// 	.style("border-radius", "10px");
	
			// Adding a group element for the map
			let map = svg.append("g").attr("class", "map");
	
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
				// .attr("fill", "white")
				// .transition()
				// .duration(2000)
				// .delay(function(country, i) {
				// 	if (!(country.properties.code in GNI_PER_CAPITA)) {
				// 		return 5;
				// 	}
				// 	let ppp_avg_income = GNI_PER_CAPITA[country.properties.code]["income"]
				// 	let ratio = income /  (ppp_avg_income * adults);
				// 	return i * 3;
				// })
				.attr("fill", function(country, i) { 
	
					// Color based on the proportion of your average income compared to other countries
					if (!(country.properties.code in GNI_PER_CAPITA)) {
						return "white";
					}
					if (i == 240) {
						console.log("lsat country", i);
						resolve();
						// // Scroll visuals into view
						// const calculateButton = document.getElementById("calculate");
						// calculateButton.scrollIntoView({behavior: "smooth"});	
					}
					
					let ppp_avg_income = GNI_PER_CAPITA[country.properties.code]["income"]
					let ratio = income /  (ppp_avg_income * adults);
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
	
		});
	})
}


function draw2DMap2(income, adults, children) {
	let country_ratios = {};
	const margin = {top: 0, right: 0, bottom: 0, left: 0};
	// As written here https://stackoverflow.com/questions/14265112/d3-js-map-svg-auto-fit-into-parent-container-and-resize-with-window
	// the unscaled equirectangular map is 640x360 so height = (9 * width) / 16
	const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
    const height =  (width - margin.top - margin.bottom) * 9 / 16 ;
	let projection = d3.geoNaturalEarth1();

	// Adding the svg element
	let svg = d3.select("#map-container")
				.append("svg")
				.attr("width", width)
				.attr("height", height)
				.attr("id", "map-svg");
	
	// Adding a background rectangle
	// svg.append("rect")
	// 	.attr("width", width)
	// 	.attr("height", height)
	// 	.style("fill", "#faf4f4");
		
	// Adding a group element for the map
	let map = svg.append("g").attr("id", "map");

	// Adding legend color scale
	var color = d3.scaleLinear().range(["white", "#ba175b"]);
	color.domain([1, 50]);


	// https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson
	d3.json("static/data/world.geojson").then((data) => {

		// Draw the map
		map.selectAll("path")
			.data(data.features)
			.enter().append("path")
			.style("stroke", "grey")
			.attr("stroke-width", "0.4px")
				.attr("class", "country")
				.attr("d", d3.geoPath().projection(projection))
				.attr("fill", function(country) { 
					// Color based on the proportion of your average income compared to other countries
					if (!(country.id in GNI_PER_CAPITA)) {
						return "white";
					}
					let ppp_avg_income = GNI_PER_CAPITA[country.id]["income"]
					let ratio = income /  (ppp_avg_income * adults);
	
					ratio = Math.round(ratio)
					country_ratios[country.id] = ratio;
	
					if (ratio < 1) {
						ratio = 1;
					}
					else if (ratio > 50) {
						ratio = 50;
					}
					return color(ratio); 
				})
				.on("mouseover", function(event) {
					// If button is pressed, do not show the information box (assuming user is dragging with mouse)
					if (event.buttons != 0) {
						return;
					}
					// Update the information box with the country name
					d3.select("body")
						.append("div")
						.attr("id", "info-box")
						.html(() => {
							if (country_ratios[event.target.__data__.id] == undefined) {
								return `<h3 class="font-medium text-base">${event.target.__data__.properties.name}</h3><p class="text-sm">No data available</p>`
							}
							return `<h3 class="font-medium text-base">${event.target.__data__.properties.name}</h3>
									<p class="text-sm">Your income is aprox. <strong>${country_ratios[event.target.__data__.id]} times</strong> their average income</p>`	
						})
						.style("left", event.clientX + 30 + "px")
						.style("top", event.target.getBoundingClientRect().top + window.scrollY +  10 +"px");
				})
				.on("mouseout", () => {
					// Hide the information box
					d3.select('#info-box').remove();
				});
		
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
	})
}

function draw2DMap3(income, adults, children) {
	let country_ratios = {};
	const margin = {top: 0, right: 0, bottom: 0, left: 0};
	// As written here https://stackoverflow.com/questions/14265112/d3-js-map-svg-auto-fit-into-parent-container-and-resize-with-window
	// the unscaled equirectangular map is 640x360 so height = (16 * width) / 9
	const width = document.getElementById("map-container").offsetWidth - margin.left - margin.right; ;
    const height = 16 / 9 * (width - margin.top - margin.bottom);
	
	// Adding the svg element
	let svg = d3.select("#map-container")
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("id", "map-svg");
	
	const projection = d3.geoNaturalEarth1();
	const pathGenerator = d3.geoPath().projection(projection);

	// Adding a group element for the map
	let map = svg.append("g").attr("class", "map");

	// Adding legend color scale
	var color = d3.scaleLinear().range(["white", "red"]);
	color.domain([1, 50]);

	// Adding a background rectangle
	map.append("rect")
		.attr("width", width)
		.attr("height", height)
		.style("fill", "#faf4f4");

	Promise.all([
		d3.tsv('https://unpkg.com/world-atlas@1.1.4/world/50m.tsv'),
		d3.json('https://unpkg.com/world-atlas@1.1.4/world/50m.json')
		]).then(([tsvData, topoJSONdata]) => {
		
		const countryName = {};
		tsvData.forEach(country => {
			countryName[country.iso_n3] = country.iso_a3;
		});
		console.log("countryName", countryName)

		const countries = topojson.feature(topoJSONdata, topoJSONdata.objects.countries);
		console.log("countries", countries)
		map.selectAll('path').data(countries.features)
		  .enter().append('path')
			.attr('class', 'country')
			.attr('d', pathGenerator)
			.attr("fill", 'green')
	});

	// https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar
	svg.call(d3.zoom()
		.scaleExtent([1, 3])
		.on("zoom", event => {
			map.attr("transform", event.transform);
		})
	);
}


function draw3DMap() {
	// Code and guidance from https://observablehq.com/@d3/world-map-svg
	const width = 400;
    const height = 400;

	d3.json("static/data/countries-110m.json").then((world) => {
		let land = topojson.feature(world, world.objects.countries);
		
		let sphere = ({type: "Sphere"})
		let projection = d3.geoOrthographic().fitExtent([[0, 0], [width, height]], sphere)

		let path = d3.geoPath(projection);
		
		let svg = d3.select("#root")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
					.style("border", "1px solid black");
		
		// group containing the globe and country borders
		let globeGroup = svg.append("g");

		// sphere background
		let outline = globeGroup.append("path");
		outline.style("fill", "none");
		
		// grid of longitude and latitude lines (known as a graticule)
		let graticule = d3.geoGraticule10();
		let gridline = globeGroup.append("path");
		gridline.style("fill", "none")
			.style("stroke", "#ccc");

		// countries
		let countries = globeGroup.selectAll(".country")
		countries.data(land.features)
		  	.enter()
			.append("path")
			.attr("class", function(d) { return "country " + d.properties.name;  }) 
			.attr("d", path(land));

		// Adding country borders
		let borders = globeGroup.append("path");
		borders.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			.attr("class", "country-border");

		function render() {
			gridline.attr("d", path(graticule))
			// outline.attr("d", path(sphere));
			countries.attr("d", path(land));
			borders.attr("d", path(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; })))
		}

		// svg.call(render);
        globeGroup.call(d3.zoom().on("zoom", (event) => {
            projection.rotate([event.transform.x / 2, -event.transform.y / 2]);
            render();
        }))

        // render the initial view
        render();
	});
}
