import { getDonatedAmount, getPreDonationIncome } from "./utility.js";

export {drawCrowdofPeople, createEventListenerForCrowd};

function onLevelofPyramid(index){
    return Math.floor(( -1 + Math.sqrt(1 + 8 * index) ) / 2) + 1;
}

function indexInRow(index){
    return index - (onLevelofPyramid(index) * (onLevelofPyramid(index) - 1) / 2);
}

function createEventListenerForCrowd() {
    const sliderElement = document.getElementById("slider");
    const crowdContainer = document.getElementById("crowd-container")
 
	sliderElement.noUiSlider.on('update', () => {
        crowdContainer.innerHTML = "";
        drawCrowdofPeople(getDonatedAmount());
    })
}

function drawCrowdofPeople(donationAmount = getPreDonationIncome() * 0.1) {
    const COST_OF_SAVING_A_LIFE = 4500;
    const margin = {top: 0, right: 0, bottom: 0, left: 0};
    const parentElement = document.getElementById("crowd-container")
    parentElement.innerHTML = "";
    const parentWidth = parentElement.clientWidth;  
    const height = 350 - margin.top - margin.bottom;
    const colors = ["light-yellow", "yellow", "orange", "red", "pink", "purple", "dark-purple", "darkest-purple"]
    const stickfigure = "M 3026 12790 c -654 -83 -1182 -573 -1305 -1214 c -44 -224 -37 -438 19 -661 c 126 -501 503 -903 1000 -1065 c 106 -35 154 -45 310 -69 c 32 -5 -323 -9 -856 -10 c -869 -1 -914 -2 -987 -21 c -176 -45 -329 -134 -470 -275 c -167 -167 -299 -403 -352 -630 c -34 -147 -36 -271 -33 -1985 l 3 -1695 l 480 0 l 480 0 l 3 1688 l 2 1687 l 160 0 l 160 0 l 2 -4267 l 3 -4268 l 702 -3 l 703 -2 l 2 2291 l 3 2290 l 145 0 l 145 0 l 3 -2290 l 2 -2291 l 703 2 l 702 3 l 3 4268 l 2 4267 l 160 0 l 160 0 l 2 -1687 l 3 -1688 l 480 0 l 480 0 l 0 1745 c 0 1633 -1 1751 -18 1840 c -77 406 -331 770 -651 930 c -189 94 -130 90 -1165 91 c -596 1 -884 5 -841 11 c 414 58 741 235 994 538 c 379 451 458 1092 202 1623 c -76 157 -158 271 -295 408 c -227 226 -468 357 -775 420 c -114 23 -357 33 -470 19 z"
    const start_x = parentWidth / 1.8;
    const start_y = height * 0.15;
    const years = 10;
    
    let people = (donationAmount / COST_OF_SAVING_A_LIFE * years).toFixed(1);
    let scale, y_spacing, x_spacing, duration;
    
    if (people < 10) {
        scale = 0.016
        y_spacing = -13;
        x_spacing = 120;
        duration = 1000

    }
    else if (people < 20) {
        scale = 0.012
        y_spacing = -11;
        x_spacing = 100;
        duration = 500
    }
    else if (people < 50) {
        scale = 0.008
        y_spacing = -9;
        x_spacing = 80;
        duration = 200
    }
    else {
        scale = 0.007
        y_spacing = -7;
        x_spacing = 50;
        duration = 50;
    }

    let availableRowIndexes = [];
    

    // Adding the svg element
    let svg = d3.select("#crowd-container")
                .append("svg")
                .attr("width", "100%")
                .attr("height", height)
                .attr("id", "crowd-svg");

    // Adding a group element for the crowd
    let crowd = svg.append("g")
                    .attr("class", "pb-5 h-full w-full")
                    .attr("transform", `matrix(${scale} 0 0 -${scale} ${parentWidth} ${height})`);

    // Adding the crowd of people
    const drawings = crowd.selectAll("path")
        .data(d3.range(people))
        .enter()
        .append("path")
        .attr("id", "person")
        .attr("d", stickfigure)
        .style("transform", function(d, i) {
            let level = onLevelofPyramid(i);
            let naturalRowIndex = indexInRow(i);
            
            if (naturalRowIndex == 0) {
                availableRowIndexes = d3.range(level);
            }
            
            let randomRowIndex = availableRowIndexes[Math.floor(Math.random() * availableRowIndexes.length)];
            
            availableRowIndexes = availableRowIndexes.filter(function(value, index, arr){
                return value != randomRowIndex;
            });

            let translate_x = (-start_x - x_spacing * 0.5 * (level - 1)  + randomRowIndex * x_spacing) / scale;
            let translate_y = (start_y - y_spacing * level) / scale;

            return `translate(${translate_x}px,${translate_y}px)`;
        })
        .sort(function(a, b) { 
            return onLevelofPyramid(b) - onLevelofPyramid(a);
        })
        .style("z-index", function(d, i) { 
            return -onLevelofPyramid(i); 
        })
        .style("fill", function () {
            return `var(--${colors[Math.floor(Math.random() * colors.length)]})`
        })
        .style("stroke", "black")
        .style("stroke-width", 0.5 / scale)
        .style("opacity", 0)
        .transition()
        .duration(duration)
        .delay(function(d, i) {
            let level = onLevelofPyramid(i);
            let rowIndex = indexInRow(i);
            return (people - level * (level + 1) / 2 - rowIndex) * 100;
        })
        .style("opacity", 1)
    

    // Adding the text
    d3.select("#crowd-container")
        .append("p")
        .attr("id", "crowd-text")
        .attr("class", "font-bold text-3xl")
        .text(`${people} people every ${years} years...`)

}