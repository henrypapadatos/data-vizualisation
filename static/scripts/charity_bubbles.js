export {drawCharityBubbles};
function drawCharityBubbles() {
    console.log("drawBubbles");
    bubbles();
}
function bubbles(){
    var width = 1000, height = 1000;
    const bubblesContainer = d3.select("#bubbles-container")
    let isTransitioning = false;
    let causeDescriptionHere = null;
    const TRANS_DURATION = 1000;

    var svg = bubblesContainer
        .append("svg")
        .attr("height", height)
        .attr("width", width)
        .append("g")
        .attr("transform","translate(0,0)");
    

    const cornerBoxData = [
        { className: 'top-left', top: height * (1/6), left: width * (1/5), text: 'Global Health and Development' },
        { className: 'top-right', top: height * (1/6), left: width * (3.5/5), text: 'Catastrophic Risks' },
        { className: 'bottom-left', top:  height * (4/6), left: width * (1/5), text: 'Animal Welfare' },
        { className: 'bottom-right', top: height * (4/6), left:  width * (3.5/5), text: 'Funds' }
    ];
    
    bubblesContainer.selectAll('.cause_area-box')
        .data(cornerBoxData)
        .join('div')
        .attr('class', 'cause_area-box')
        .style('position', 'absolute')
        .style('top', d => d.top ? d.top + 'px' : null)
        .style('left', d => d.left ? d.left + 'px' : null)
        .style('background-color', 'white')
        .style('border', '2px solid #ba2934')
        .style('padding', '10px')
        .style('font', 'sans-serif')
        .style('font-size', '20px')
        .style('opacity', '1.0') 
        .style("border-radius", "0.5rem")

        .text(d => d.text);

    const buttons = [
        {id : 'button_separation', text : 'Cause Separation'},
        {id : 'combine', text : 'Combine'},
        //{id: 'All', text : 'All'},
        {id : 'button_Animal_Welfare', text : 'Animal Welfare'},
        {id : 'button_Global_Health_and_Development', text : 'Global Health'},
        {id : 'button_Catastrophic_Risks', text : 'Catastrophic Risks'},
        {id : 'button_Funds', text : 'Funds'}
        ]
    const cause_areas = ["Animal Welfare", "Global Health and Development", "Catastrophic Risks", "Funds"];

    const cause_areas_description =  [
        {
          "cause": "Animal Welfare",
          "text": "If you want to reduce the suffering in the world (regardless of who is experiencing it), animal advocacy might be the right cause for you. Over one million land animals are slaughtered every hour in the US alone. We think improving animal welfare is a high-priority cause area because of its massive scale. Right now there are around 31 billion land animals being raised in factory farms so they can be slaughtered for food. These animals often experience intense suffering throughout their lives. Animal advocacy is an extremely neglected cause area. In the US, only about 3% of charitable contributions support animals and the environment, combined. Of that amount, only about 2% goes to farmed animals."
        },
        {
          "cause": "Global Health and Development",
          "text": "If you want to help people living today, supporting global health and development is a pressing matter. There are millions of people in low-income countries whose lives could be improved (and even saved, in some cases) by evidence-based, cost-effective interventions."
        },
        {
          "cause": "Catastrophic Risks",
          "text": "If you’d like to protect future generations (rather than strictly helping individuals living in the present), you should consider supporting efforts to safeguard the long-term future. Most of the work in this area involves preventing global catastrophes such as climate change, pandemics, artificial intelligence, nuclear war and making our world more resilient."
        },
        {
          "cause": "Funds",
          "text": "These funds are supporting work that touches on multiple cause areas. Donors who want to support cross-cause-area work may choose to donate to one of these funds to maximise their impact."
        }
      ];
      
    
    const buttons_section = d3.select("#bubbles-container")
        .append("div")
        .attr("id", "button_section")
        //.attr("class", "flex flex-row absolute rounded-lg")
        .style("display", "flex")
        .style("justify-content", "center")
        .style("border-radius", "0.5rem")
        .style("position", "relative")
        
        .style("top", "-950px")
        .style("gap", "24px")
        .style("height", "auto")    
        //.style("background-color", "gwwc-red")
    buttons.forEach(e => { 
        buttons_section//bubbles.selectAll('button')
            .append("button")
            .attr("id", e.id)
            .attr("class", "bg-gwwc-purple p-10 hover:bg-gwwc-dark-purple active:bg-gwwc-darkest-purple rounded-lg text-white")
            .style("padding", "2.5px 5px")
            
            .text(e.text);
            //.attr("width", "10%")
            //.attr("display", "block");
            
        /*
        d3.select("#" + e.id).append('span')
            .attr("class","text-white font-medium")
            .text(e.text);*/
    });

    // Add div elements for the four corners
    var defs = svg.append("defs"); 

    // radiusScale for
    var radiusScale = d3.scaleSqrt().domain([10,50]).range([25,100])

    // the simulation is a collection of forces
    // about where we cant our circles to go
    // and how we want our circles to move
    // get them in the middle and don't let them collide 


    var forceX_Separate = d3.forceX(function(d)  {
        if(d.cause_area == 'Global Health and Development' || d.cause_area == 'Animal Welfare'){
            return width/4
        }else{
            return (width * (3/4))
        }}).strength(0.05)

    var forceY_Separate = d3.forceY(function(d)  {
        if(d.cause_area == 'Global Health and Development' || d.cause_area == 'Catastrophic Risks'){
            return height/4 + 100
        }else{
            return (height * (3/4) + 100)
        }}).strength(0.05)        

    var forceX_Combine = d3.forceX(d => width / 2).strength(0.05)

    var forceY_Combine = d3.forceY(d => height /2).strength(0.05)


    var simulation = d3.forceSimulation()
        .force("x", forceX_Combine)
        .force("y", forceY_Combine)
        .force("collide", d3.forceCollide(function(d) {
            return radiusScale(d.cost_effectiveness) +5
        }))
        ;

    let separated_bubbles = false;


/*
    d3.select("#All").on('click', () => {
        simulation
            .force("x", forceX_Separate)
            .force("y", forceY_Separate)
            .alphaTarget(0.5)
            .restart();
        d3.select("#bubbles-container").selectAll('.cause_area-box')
            .style('opacity', '1.0');
        separated_bubbles = true;
        });*/
    d3.csv("static/data/charities.csv").then(ready);

    function ready(datapoints) {
        const original_datapoints = datapoints
        var var_datapoints = datapoints


        function ticked(){
            circles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y);
/*             labels
                .attr('x', d => d.x)
                .attr('y', d => d.y)
                .text(d => d.name);  */
        }

        //definitions to add images
        function join_defs(){
            defs.selectAll(".artist-pattern")
            .data(var_datapoints)
            .join("pattern")
            .attr("class", "artist-pattern")
            .attr('id', d => d.id.toLowerCase().replace(/ /g, '-'))
            .attr("height","100%")
            .attr("width", "100%")
            .attr("patternContentUnits","objectBoundingBox")
            .append("image")
            .attr("height", 1)
            .attr("width", 1)
            .attr("preserveAspectRatio", "none")
            .attr("xmlns:xlink", "http://www.w3.org/1999/xlink")
            .attr("xlink:href", d =>  "static/data/images/" + d.image_path)
        }
        
        join_defs()

        // join all the circles with the data
        function join_circles(var_datapoints){
            var circles = svg.selectAll('.charity')
            .data(var_datapoints)
            .join('circle')
            .attr('class', 'charity')
            .attr('r', d => radiusScale(d.cost_effectiveness))
            .attr('fill', d => `url(#${d.id.toLowerCase().replace(/ /g, '-')})`)
            .on("mouseover", function(event, d) {
                // Create a box with some text when hovering over the circle
                var box = d3.select('body')
                    .append("div")
                    .attr("id", "charity-box")
                    //.attr("class", "charity-box")
                    .style("position", "absolute")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px")
                box.style("width", "240px")
                    .style("height", "240px")
                    .style("background-color","white")
                    .style("border","1px solid #ba2934;")
                    .style("padding","10px")
                    .style("font-family","'Metropolis', sans-serif;")
                    .style("font-size","14px")
                    .text(`Name : ${d.name} Description : ${d.description}`);
                // Update the position of the box as the mouse moves
                d3.select('body')
                    .on("mousemove", function() {
                        box.style("left", event.pageX + "px")
                        .style("top", event.pageY + "px");
                    });
            })
			// Remove the box when moving the cursor out of the circle
            .on("mouseout", () =>
				d3.select('#charity-box').remove()
			);
            return circles
        }
        var circles = join_circles(var_datapoints);
        let removedCircles = false;
        let last_clicked_cause = "";
        function merge_bubbles(){
            // put everything back to center
            simulation
                .nodes(var_datapoints)
                .force("x", forceX_Combine)
                .force("y", forceY_Combine)
                .alphaTarget(0.5)
                .restart();
            separated_bubbles = false
   
        }
        function separate_bubbles(){
            simulation
                .nodes(var_datapoints)
                .force("x", forceX_Separate)
                .force("y", forceY_Separate)
                .alphaTarget(0.5)
                .restart();
            separated_bubbles = true
        }
        function filter_cause_area(cause_area){
            //filter the bubbles accordingly
            if (removedCircles == false || (removedCircles = true &&  last_clicked_cause != cause_area)) {
                var_datapoints = original_datapoints.filter(d => d.cause_area == cause_area);
                removedCircles = true;
            } else {
                if(last_clicked_cause == cause_area){
                    var_datapoints = original_datapoints;
                    removedCircles = false;
                }
            }
            circles = join_circles(var_datapoints);
            join_defs();
            last_clicked_cause = cause_area       
            merge_bubbles();
            
        }



        


        function cause_areas_description_out(){
            isTransitioning = true;
            d3.select(causeDescriptionHere).transition().duration(TRANS_DURATION)
                .ease(d3.easeCubicInOut) 
                .style("opacity", 0)
            //.style("font-size", "0px")
                .on("end", function() {
                causeDescriptionHere = null;
                d3.select(this).remove();
                
                isTransitioning = false;
                console.log("REMOVED")
            });
        }
        cause_areas.forEach(cause_area => { 
            d3.select("#button_" + cause_area.replace(/ /g, '_')).on('click', (event, b) => {
                if (isTransitioning) {
                    return; // Ignore the click if a transition is already in progress
                  }
                filter_cause_area(cause_area)
                d3.select("#bubbles-container").selectAll('.cause_area-box')
                .style('opacity', '0.0');

                const textX = 40;
                const textY = height/9;
                const textWidth = 850;
                console.log(causeDescriptionHere)
                function put_text(cause_area){
                    
                    const foreignObject = svg
                    .append("foreignObject")
                    .attr("x", textX)
                    .attr("y", textY)
                    .attr("width", textWidth)
                    .attr("height", 400);

                    const div = foreignObject
                        .append("xhtml:div")
                        .style("width", "100%")
                        .style("height", "100%")
                        .style("word-wrap", "break-word")
                        .style("overflow-wrap", "break-word")
                        .style("text-align", "center")
                        .style("font-size", "18px")
                        .style("color", "black")
                        .style("opacity", 0)
                        .text(cause_areas_description.find(d => d.cause === cause_area).text);
                    isTransitioning = true;
                    div.transition().duration(TRANS_DURATION).ease(d3.easeCubicInOut).style("opacity", 1).on("end", function() {
                        isTransitioning = false; // Reset the flag once the transition is complete
                      }); // Apply a smooth easing function
                    
                    //.style("font-size", "18px")
                    ;
                    causeDescriptionHere = div.node();
                }
                if (causeDescriptionHere) {
                    // Fade out the text element
                    cause_areas_description_out()
                    put_text(cause_area)  
                    //put_text(cause_area)
                  } else {
                    put_text(cause_area)

                    
                  }
           
            });
            
        });
        d3.select("#button_separation").on('click', () => {
            if (isTransitioning) {
                return; // Ignore the click if a transition is already in progress
              }
            if (causeDescriptionHere) {
                // Fade out the text element
                cause_areas_description_out()}
            var_datapoints = original_datapoints;
            circles = join_circles(var_datapoints);
            join_defs();  
            separate_bubbles();          
            d3.select("#bubbles-container").selectAll('.cause_area-box')
                .style('opacity', '1.0');
            });
    
        d3.select("#combine").on('click', () => {
            if (isTransitioning) {
                return; // Ignore the click if a transition is already in progress
              }
            if (causeDescriptionHere) {
            // Fade out the text element
                cause_areas_description_out()}  
            var_datapoints = original_datapoints;
            circles = join_circles(var_datapoints);
            join_defs();            
            merge_bubbles();
            d3.select("#bubbles-container").selectAll('.cause_area-box')
                .style('opacity', '0.0');
        });
        //text label
        
/*         const labels = svg.selectAll('.label')
            .data(datapoints)
            .join('text')
            .attr('class', 'label')
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('dy', '.35em')
            .text(d => d.name) */
        
        simulation.nodes(var_datapoints).on('tick', ticked)
        
    }

    //add text

}