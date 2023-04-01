
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

function draw2DMap(gni_per_capita) {
	// Code and tutorial from https://bost.ocks.org/mike/map/
	console.log("draw2DMap");
	let input = 100000;
	let country_ratios = {};

	// const margin = {top: 20, right: 10, bottom: 40, left: 100};
	const margin = {top: 0, right: 0, bottom: 0, left: 0};
	const width = 1100 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

	d3.json("static/data/updated-countries-50m.json").then((world) => {
		const land = topojson.feature(world, world.objects.countries);
		const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
		
		const mapContainer = d3.select("#root").append("div").attr("id", "map-container");

		// Adding the svg element
		let svg = d3.select("#map-container")
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		
		//let infobox = d3.select("#map-container").append("div").attr("id", "info-box");
		
		// Adding a group element for the map
		let map = svg.append("g").attr("class", "map");

		// Adding legend color scale
		var color = d3.scaleLinear().range(["white", "red"]);
		color.domain([1, 50]);

		// Adding a background rectangle
		map.append("rect")
			.attr("class", "map-background")
			.attr("width", width)
			.attr("height", height);

		// Adding individual countries as paths
		map.selectAll(".country")
			.data(land.features)
		  	.enter()
			.append("path")
			.attr("class", function(country) { return "country " + country.properties.code;  }) 
			.attr("d", d3.geoPath().projection(projection))
			.attr("fill", function(country) { 
				// Color based on the proportion of your average income compared to other countries
				
				if (!(country.properties.code in gni_per_capita)) {
					return "white";
				}
				let ppp_avg_income = gni_per_capita[country.properties.code]["income"]
				let ratio = input /  ppp_avg_income;
				
				ratio = Math.round(ratio)
				country_ratios[country.properties.code] = ratio;

				if (ratio < 1) {
					ratio = 1;
				}
				else if (ratio > 50) {
					ratio = 50;
				}
				return color(ratio); 
			})
			.on("mouseover", function(country) {
				console.log(country.target.__data__.properties.code);
				// Update the information box with the country name
				d3.select("#map-container")
					.append("div")
					.attr("id", "info-box")
					.html(() => {
						console.log(country.target.__data__.properties.code)
						if (country_ratios[country.target.__data__.properties.code] == undefined) {
							return `<h3>${country.target.__data__.properties.name}</h3><p>Has no data</p>`
						}
						return `<h3>${country.target.__data__.properties.name}</h3><p>Has ${country_ratios[country.target.__data__.properties.code]} times lower average income that your</p>`	
					})
					.style("opacity", 1)
					.attr('pointer-events', 'none')
					.style("left", (country.x + 50 + "px"))
					.style("top", (country.y +"px"));
			})
			.on("mouseout", function(country) {
				// Hide the information box
				d3.select('#info-box').remove();
			});

		// Adding country borders
		map.append("path")
			.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			.attr("d", d3.geoPath().projection(projection))
			.attr("class", "country-border");

		// https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar
		map.call(d3.zoom()
			.scaleExtent([1, 5])
			.translateExtent([[0, 0], [width, height]])
			.on("zoom", event => {
				// const sensitivityFactor = 1 + (event.transform.k - 1) * 1.2;
				// map.attr("transform", `translate(${event.transform.x * sensitivityFactor}, ${event.transform.y * sensitivityFactor}) scale(${event.transform.k})`);
				map.attr("transform", event.transform);
			})
		);

	});
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
		// Adding zoom and rotate behavior
		// svg.call(d3.zoom()
		// 	.scaleExtent([1, 10])
		// 	.on("zoom", (event) => {
		// 		projection.rotate([event.transform.x / 2, -event.transform.y / 2, projection.rotate()[2]]);
		// 		render();
		// 	})
		// );

whenDocumentLoaded(() => {
	// d3.json("static/data/gni_per_capita.json").then( data => {
	// 	draw2DMap(data);
	// });
});
