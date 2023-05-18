
export { drawGroups };

const response = await fetch("static/data/income_centiles.json");
const INCOME_CENTILES = await response.json();

function drawGroups(income) {
  const WORLD_POPULATION = 7764951032
  const NB_CIRCLES = 200;
  const POP_PER_CIRCLE = Math.ceil(WORLD_POPULATION/NB_CIRCLES)
  const SIZE_CIRCLE = 16;
  const COLOR_POOR = "#cc4115"; 
  const COLOR_RICH =   "#F5D9D0"; 
  console.log("drawGroups");

  // Scale for circle radius
  const radiusScale = d3.scaleSqrt().domain([10, 50]).range([25, 100]);

  // Get the income reduction value from the input element
  const incomeInput = document.getElementById("value-bubble");
  let donation_fraq = (parseFloat(incomeInput.innerText) / 100);
  console.log("income_input", incomeInput);

  let [proportionGroupPoorer, proportionGroupRicher] = findGroupProportions(income, donation_fraq)

  console.log("proportions", proportionGroupPoorer, proportionGroupRicher);

  // Calculate the number of circles for the poorer and richer groups
  let nbCirclesPoorer = Math.ceil(NB_CIRCLES * proportionGroupPoorer);
  let nbCirclesRicher = Math.ceil(NB_CIRCLES * proportionGroupRicher);

  // Generate data for the poorer and richer groups
  const generateData = (group, count) =>
    d3.packSiblings(d3.range(count).map(() => ({ r: SIZE_CIRCLE, group })));

  const dataCirclesPoorer = generateData("poorer", nbCirclesPoorer);
  const dataCirclesRicher = generateData("richer", nbCirclesRicher);
  const mergedData = [...dataCirclesPoorer, ...dataCirclesRicher];

  const color = "beige";
  const width = 2300;
  const height = 1200;
  const size = Math.max(width, height);

  // Create the SVG element
  const svg = d3
    .select("#bubbleGroup-container")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("background", "black")
    .attr("stroke", "currentColor")
    .attr("stroke-width", 1.5)
    .attr("id", "bubblegroups-svg");



  // Define the forces for circle positioning
  const forceXCombine = d3
    .forceX(d => (d.group === "richer" ? width / 4 : 3 * (width / 4)))
    .strength(0.06);
  const forceYCombine = d3.forceY(height / 2).strength(0.06);

  // Create the simulation
  const simulation = d3
    .forceSimulation()
    .force("charge", d3.forceManyBody().strength(-(SIZE_CIRCLE + 1)))
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .force("collision", d3.forceCollide().radius(d => d.r + 0.5))
    .stop();

  // Join circles and set initial attributes
  const joinCircles = data =>
    svg
      .selectAll("circle")
      .data(data)
      .join("circle")
      .attr("fill", color)
      //.attr("cx", d => Math.cos(d.angle) * (size / Math.SQRT2 + 30))
      //.attr("cy", d => Math.sin(d.angle) * (size / Math.SQRT2 + 30))
      .attr("r", d => d.r - 0.25)
      //.transition()
      //.ease(d3.easeCubicOut)
      //.delay(d => Math.sqrt(d.x * d.x + d.y * d.y) * 10)
      //.duration(1000);
      //.attr("cx", d => d.x)
      //.attr("cy", d => d.y)
      ;

  // Draw the circles
  const circles = joinCircles(mergedData);

  /*
  title_richer.append("text")
    .attr("class", ".title-bubble-group")
    .attr("x", 50)
    .attr("y", 40)
    .text(d => `People richer than you (${(proportionGroupRicher * 100).toFixed(2)}%)`)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "4vh").attr("color", "white").attr("fill","white");
  title_poorer.append("text")
    .attr("class", ".title-bubble-group")
    .attr("x", 50)
    .attr("y", 40)
    .text(d => `People poorer than you (${(proportionGroupPoorer * 100).toFixed(2)}%)`)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "4vh").attr("color", "white").attr("fill","white");      

*/

  var title_poorer = svg.append("g").attr("class", "title").attr("transform",`translate(${7.25*(width / 12)}, ${(height/10) })`);
  var title_richer = svg.append("g").attr("class", "title").attr("transform", `translate(${width / 12}, ${height/10})`);
  var title_richer_text = title_richer.append("text")
    .attr("class", ".title-bubble-group")
    .attr("x", 50)
    .attr("y", 40)
    .text(d => `People richer than you (${(proportionGroupRicher * 100).toFixed(2)}%)`)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "4vh").attr("color", "white").attr("fill","white");
  var title_poorer_text = title_poorer.append("text")
    .attr("class", ".title-bubble-group")
    .attr("x", 50)
    .attr("y", 40)
    .text(d => `People poorer than you (${(proportionGroupPoorer * 100).toFixed(2)}%)`)
    .attr("alignment-baseline", "middle")
    .attr("font-size", "4vh").attr("color", "white").attr("fill","white");   
    // Get the slider element
    const sliderElement = document.getElementById("slider");

  // Event listener for slider update
  let newRich, newPoor = 0;
  sliderElement.noUiSlider.on("update", (values, handle) => {
    donation_fraq =Math.round(parseFloat(values[handle]))/100;
    [proportionGroupPoorer, proportionGroupRicher] = findGroupProportions(income, donation_fraq)
    // Calculate the number of circles for the poorer and richer groups
    newRich = nbCirclesPoorer - Math.ceil(NB_CIRCLES * proportionGroupPoorer);
    newPoor = nbCirclesRicher - Math.ceil(NB_CIRCLES * proportionGroupRicher);
    // update the total
    nbCirclesRicher += newRich;
    nbCirclesPoorer += newPoor;

    // Update the group assignment of circles
    if (newPoor > 0) {
      let richIndices = mergedData
        .map((d, i) => (d.group === "richer" ? i : -1))
        .filter(index => index !== -1);
/*
            poorIndices.sort((a, b) => {
                const distanceA =  Math.abs(3*(width/4) - mergedData[a].x);
                const distanceB =  Math.abs(3*(width/4) -  mergedData[b].x);
                return distanceA - distanceB;
            });
          */
      richIndices.slice(0, newPoor).forEach(index => {
        mergedData[index].group = "poorer";
      });
    } else if (newRich > 0) {
      let poorIndices = mergedData
        .map((d, i) => (d.group === "poorer" ? i : -1))
        .filter(index => index !== -1);
/*
            poorIndices.sort((a, b) => {
                const distanceA =  Math.abs(3*(width/4) - mergedData[a].x);
                const distanceB =  Math.abs(3*(width/4) -  mergedData[b].x);
                return distanceA - distanceB;
            });
          */
      poorIndices.slice(0, newRich).forEach(index => {
        mergedData[index].group = "richer";
        });
      }
      
    // Update the simulation with new forces and restart it
    simulation
      .nodes(mergedData)
      .force("x", forceXCombine)
      .force("y", forceYCombine)
      .alphaTarget(0.5)
      .restart();
    title_richer_text.text(d => `People richer than you (${(proportionGroupRicher * 100).toFixed(2)}%)`);
    title_poorer_text.text(d => `People poorer than you (${(proportionGroupPoorer * 100).toFixed(2)}%)`);

    });

  // Update circle positions on simulation tick
  simulation.nodes(mergedData).on("tick", () => {
    circles.attr("cx", d => d.x).attr("cy", d => d.y);
    circles.attr("fill", d => (d.group === "poorer" ? "#cc4115" : "#F5D9D0"));
  });

  // Start the simulation
  simulation
    .nodes(mergedData)
    .force("x", forceXCombine)
    .force("y", forceYCombine)
    .alphaTarget(0.5)
    .restart();

  console.log("Groups drawn");

  // ADD
  const legend = svg.append("g").attr("class", "legend").attr("transform", "translate(50, 1000)");

  // Add legend title
  legend
    .append("text")
    .attr("class", "legend-title")
    .attr("x", 0)
    .attr("y", 0)
    .text("Legend")
    .attr("color", "white")
    .attr("font-size", "6vh");

  // Add legend circles
  const legendCircles = legend
    .selectAll(".legend-circle")
    .data([{ r: 16, group: "poorer" }, { r: 16, group: "richer" }])
    .enter()
    .append("circle")
    .attr("class", "legend-circle")
    .attr("cx", 20)
    .attr("cy", (_, i) => 60 + i * 40)
    .attr("r", d => d.r)
    .attr("fill", d => (d.group === "poorer" ? COLOR_POOR : COLOR_RICH));

  // Add legend labels
  const legendLabels = legend
    .selectAll(".legend-label")
    .data([{ group: "poorer", label: `${POP_PER_CIRCLE.toExponential(2)} poorer people` }, { group: "richer", label: `${POP_PER_CIRCLE.toExponential(2)} richer people` }])
    .enter()
    .append("text")
    .attr("class", "legend-label")
    .attr("x", 50)
    .attr("y", (_, i) => 60 + i * 40)
    .text(d => d.label)
    .attr("alignment-baseline", "middle")
    .attr("fill", "white")
    .attr("font-size", "4vh")
    .attr("color", "white");

  
}
// Find the proportions of poorer and richer based on income and donation
function findGroupProportions(income, donation_fraq) {
  let incomeReduced = income - income * donation_fraq;

  let closestCentile =  INCOME_CENTILES.reduce(
    (closest, current) =>
      current.international_dollars > incomeReduced &&
      Math.abs(current.international_dollars - incomeReduced) >= Math.abs(closest.international_dollars - incomeReduced)
        ? closest
        : current,
    INCOME_CENTILES[0]
  );
  let proportionGroupPoorer = closestCentile.percentage / 100;
  let proportionGroupRicher = 1 - proportionGroupPoorer;
  return [proportionGroupPoorer, proportionGroupRicher]
}