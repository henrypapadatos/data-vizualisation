import GNI_PER_CAPITA from "../data/gni_per_capita.json" assert { type: "json" };
export {draw2DMap};

function draw2DMap(income, adults, cildren) {
	// Code and tutorial from https://bost.ocks.org/mike/map
	let country_ratios = {};

	// const margin = {top: 20, right: 10, bottom: 40, left: 100};
	const margin = {top: 0, right: 0, bottom: 0, left: 0};
	const width = 1100 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
	const mapContainer = d3.select("#visuals").append("div").attr("id", "map-container");

	d3.json("static/data/updated-countries-50m.json").then((world) => {
		const land = topojson.feature(world, world.objects.countries);
		const projection = d3.geoNaturalEarth1().fitSize([width, height], land);
		
		// Adding the svg element
		let svg = d3.select("#map-container")
					.append("svg")
					.attr("width", width)
					.attr("height", height)
                    .attr("id", "map-svg");
		
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

		// Adding individual countries as paths
		map.selectAll(".country")
			.data(land.features)
		  	.enter()
			.append("path")
			.attr("class", function(country) { return "country " + country.properties.code;  }) 
			.attr("d", d3.geoPath().projection(projection))
			.attr("fill", function(country) { 
				// Color based on the proportion of your average income compared to other countries
				
				if (!(country.properties.code in GNI_PER_CAPITA)) {
					return "white";
				}
				let ppp_avg_income = GNI_PER_CAPITA[country.properties.code]["income"]
				let ratio = income /  (ppp_avg_income * adults);

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
				// Update the information box with the country name
				d3.select("#map-container")
					.append("div")
					.attr("id", "info-box")
					.html(() => {
						if (country_ratios[country.target.__data__.properties.code] == undefined) {
							return `<h3>${country.target.__data__.properties.name}</h3><p>No data available</p>`
						}
						return `<h3>${country.target.__data__.properties.name}</h3>
                                <p>Has <strong>${country_ratios[country.target.__data__.properties.code]} times</strong> lower average income that your</p>`	
					})
					.style("left", (country.x + 0 + "px"))
					.style("top", (country.y + 0 +"px"));
			})
			.on("mouseout", function(country) {
				// Hide the information box
				d3.select('#info-box').remove();
			});

		// https://observablehq.com/@harrystevens/introducing-d3-geo-scale-bar
		map.call(d3.zoom()
			.scaleExtent([1, 3])
			.translateExtent([[0, 0], [width, height]])
			.on("zoom", event => {
				map.attr("transform", event.transform);
                d3.selectAll(".country").attr("stroke-width", 1 / event.transform.k  + "px");
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
