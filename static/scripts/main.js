
function whenDocumentLoaded(action) {
	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", action);
	} else {
		action();
	}
}

function draw2DMap() {
	// Code and tutorial from https://bost.ocks.org/mike/map/
	console.log("draw2DMap");

	const margin = {top: 20, right: 10, bottom: 40, left: 100};
	const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;


	d3.json("static/data/countries-50m.json").then((world) => {
		const land = topojson.feature(world, world.objects.countries);
		const projection = d3.geoNaturalEarth1().fitSize([width, height], land);

		let svg = d3.select("#root")
					.append("svg")
					.attr("width", width)
					.attr("height", height);
		
		// Adding a group element for the map
		let map = svg.append("g").attr("class", "map");

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
			.attr("class", function(d) { return "country " + d.properties.name;  }) 
			.attr("d", d3.geoPath().projection(projection));

		// Adding country borders
		map.append("path")
			.datum(topojson.mesh(world, world.objects.countries, function(a, b) { return a !== b; }))
			.attr("d", d3.geoPath().projection(projection))
			.attr("class", "country-border");

		var legend_x = width 
		var legend_y = height 
			
		const legend = svg.append("g").attr("class", "legend").attr("transform", "translate(" + legend_x + "," + legend_y + ")");
		legend
			.append("rect")
			.attr("width", 100)
			.attr("height", 20)
			.attr("fill", "yellow")
			.attr("stroke", "black");

		legend
			.append("text")
			.attr("x", 10)
			.attr("y", 15)
			.text("Legend");

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

});
