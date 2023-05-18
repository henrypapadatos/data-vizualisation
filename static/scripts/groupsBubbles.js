export { drawGroups };

const response = await fetch("static/data/income_centiles.json"); 
const INCOME_CENTILES = await response.json();

//separate into groups 1 and 2
function drawGroups(income) {



    const NB_CIRCLES = 1000
    //print in console
    console.log("drawGroups");
    function ticked(){
        circles
            .attr('cx', d => d.x)
            .attr('cy', d => d.y);
/*             labels
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .text(d => d.name);  */
    }
    var radiusScale = d3.scaleSqrt().domain([10,50]).range([25,100])

    // Add an event listener to the input element
    let income_input = document.getElementById("value-bubble");
    let reduction = (parseFloat(income_input.innerText) / 100).toFixed(2)
    console.log("income_input", income_input)

    var income_reduced = income - income * reduction;
    console.log("income_reduced event",income_reduced);

    // Call the necessary functions or update specific elements based on the income value
    const closest_centile = INCOME_CENTILES.reduce((closest, current) => {
        if (current.international_dollars > income_reduced) {
          return closest; // Stop iterating when a value greater than outcome_amount is found
        }
        return Math.abs(current.international_dollars - income_reduced) < Math.abs(closest.international_dollars - income_reduced) ? current : closest;
      });
    console.log("closest_centile", closest_centile)

    let proportion_group_poorer = closest_centile.percentage / 100

    let proportion_group_richer = 1 - (proportion_group_poorer)

    console.log("proportions", proportion_group_poorer,  proportion_group_richer)

    var nb_circles_poorer = Math.ceil(NB_CIRCLES * proportion_group_poorer)
    var nb_circles_richer = Math.ceil(NB_CIRCLES * proportion_group_richer)

    var data_circles_poorer = d3.packSiblings(d3.range(nb_circles_poorer).map(d => 8).map(r => ({ r, group: "poorer" })));
    var data_circles_richer = d3.packSiblings(d3.range(nb_circles_richer).map(d => 8).map(r => ({ r, group: "richer" })));
    var mergedData = data_circles_poorer.concat(data_circles_richer);




    

  
    let color =  'beige';//d3.scaleSequential([0, 2 * Math.PI], d3.interpolateRainbow);
    let width = 2300;
    let height = 1200;
    let size = Math.max(width, height);

    // Adding the svg element
    let svg = d3.select("#bubbleGroup-container")
        .append("svg")
        /*
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform","translate(0,0)");
        */
        .attr("viewBox", [0, 0, width, height])
        .style("background", "#333")
        .attr("stroke", "currentColor")
        .attr("stroke-width", 1.5)
        .attr("id", "bubblegroups-svg");
        


    var forceX_Combine = d3.forceX(function(d) {
        if (d.group == "richer"){
            return width/4
        }else{return 3*(width/4)} }
        ).strength(0.06)
        //.alphaDecay(10)
    var forceY_Combine = d3.forceY(height/2).strength(0.06)//.alphaDecay(10)
        
        
    /*
    var forceY_Combine = d3.forceY(d => height /2).strength(0.05)

    var forceX_Combine_Left = d3.forceX(width / 4).strength(0.2)

    var forceY_Combine_Left = d3.forceY(height /4).strength(0.2)    

    var forceX_Combine_Right = d3.forceX((width / 4) * 3).strength(0.2)

    var forceY_Combine_Right = d3.forceY((height /4) * 3).strength(0.2)     
    */
    
    var simulation = d3.forceSimulation()
        .force('charge', d3.forceManyBody().strength(-10))

        .force("x", forceX_Combine)
        .force("y", forceY_Combine)
        //.force("collide", d3.forceCollide(function(d) {
        //    return d.r + 5}).strength(0.01))
      
    function join_circles(var_datapoints){

        var circles = svg.selectAll("circle")
            .data(var_datapoints)
            .join("circle")
            .attr('class', '.income_bubble')
            .attr("fill", d => '#e8c52b')
            .attr("cx", d => Math.cos(d.angle) * (size / Math.SQRT2 + 30))
            .attr("cy", d => Math.sin(d.angle) * (size / Math.SQRT2 + 30))
            .attr("r", d => d.r - 0.25)
            //.transition()
            //.ease(d3.easeCubicOut)
            //.delay(d => Math.sqrt(d.x * d.x + d.y * d.y) * 10)
            //.duration(1000)
            //.attr("cx", d => d.x)
            //.attr("cy", d => d.y)
            return circles
            ;}
             
    let circles = join_circles(mergedData)
    
	const sliderElement = document.getElementById("slider");

    sliderElement.noUiSlider.on('update', (values, handle) => {
		// Update value button
		let newValue = Math.round(parseFloat(values[handle]));
        let income_reduced = income - income * (newValue/100);
        console.log("income_reduced event",income_reduced);
        // Call the necessary functions or update specific elements based on the income value
        const closest_centile = INCOME_CENTILES.reduce((closest, current) => {
            if (current.international_dollars > income_reduced) {
              return closest; // Stop iterating when a value greater than outcome_amount is found
            }
            return Math.abs(current.international_dollars - income_reduced) < Math.abs(closest.international_dollars - income_reduced) ? current : closest;
          });
    
        let proportion_group_poorer = closest_centile.percentage / 100
    
        let proportion_group_richer = 1 - (proportion_group_poorer)
    
    
        var new_rich = nb_circles_poorer - Math.ceil(NB_CIRCLES * proportion_group_poorer)
        var new_poor = nb_circles_richer - Math.ceil(NB_CIRCLES * proportion_group_richer)

        nb_circles_richer +=  new_rich

        nb_circles_poorer += new_poor 

        console.log("new_rich new_poor, ", new_rich,  new_poor)

        if (new_poor > 0) {
            let richIndices = mergedData
              .map((d, i) => (d.group == "richer" ? i : -1))
              .filter(index => index != -1);
            console.log("richIndices", richIndices)
            console.log("rich", mergedData[richIndices])
/*
            richIndices.sort((a, b) => {
              const distanceA = Math.abs(width/4 - mergedData[a].x);
              const distanceB =  Math.abs(width/4 -  mergedData[b].x);
              return distanceA - distanceB;
            });*/
          
            richIndices.slice(0, new_poor).forEach(index => {
              mergedData[index].group = "poorer";
            });
          } else if (new_rich > 0) {
            let poorIndices = mergedData
              .map((d, i) => (d.group == "poorer" ? i : -1))
              .filter(index => index != -1);
            /*
            poorIndices.sort((a, b) => {
                const distanceA =  Math.abs(3*(width/4) - mergedData[a].x);
                const distanceB =  Math.abs(3*(width/4) -  mergedData[b].x);
                return distanceA - distanceB;
            });
          */
            poorIndices.slice(0, new_rich).forEach(index => {
              mergedData[index].group = "richer";
            });
          }
        simulation
                .nodes(mergedData)
                .force("x", forceX_Combine)
                .force("y", forceY_Combine)
                .alphaTarget(0.5)
                .restart();
	});
    console.log("Groups drawned");

  
    // DO ONE SIMULATION FOR EVERYONE AND ADJUST THE CENTER OF GRAVITY IN FUNCTION OF GROUP
    
    
    
    simulation.nodes(mergedData).on('tick', ticked);
    simulation
                .nodes(mergedData)
                .force("x", forceX_Combine)
                .force("y", forceY_Combine)
                .alphaTarget(0.5)
                .restart();

    
    }

