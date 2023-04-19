// import { draw2DMap } from "./maps.js";
import { drawCrowd } from "./crowd.js";

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
	drawCrowd(70);
	
});
