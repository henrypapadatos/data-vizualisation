import { draw2DMap } from "./maps.js";

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


whenDocumentLoaded(() => {
	// Draw 2D map
	d3.json("static/data/gni_per_capita.json").then( data => {
		draw2DMap(data, 100000, 1, 0);
	});
	
});
