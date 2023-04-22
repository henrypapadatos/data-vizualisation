import { draw2DMap } from "./maps.js";
import { drawCrowd } from "./crowd.js";
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


whenDocumentLoaded(() => {
	drawLineChart();
	draw2DMap();
	drawCrowd(70);

	
});
