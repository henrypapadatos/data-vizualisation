# Project of Data Visualization (COM-480)

| Student's name | SCIPER |
| -------------- | ------ |
| Henry Papadatos| 284446 |
| Hain Luud| 351637|
| Tanguy Marbot| 316756|

[Milestone 1](#milestone-1) • [Milestone 2](#milestone-2) • [Milestone 3](#milestone-3)

## Milestone 1 (23rd April, 5pm)

**10% of the final grade**

This is a preliminary milestone to let you set up goals for your final project and assess the feasibility of your ideas.
Please, fill the following sections about your project.

*(max. 2000 characters per section)*

### Problematic

Giving is a long-held tradition; ancestral doctrines have advocated for communal solidarity and benevolence for the needy and suffering through sharing of resources. It is still a pillar of human value and the conditions have changed. Today, with an affluent situation and the interconnectedness of the current world, opportunities to mitigate needs might be too consequential to ignore. However, (1) it can be challenging for people to realize how lucky they are in terms of material wealth, and the disparities with other people around the globe. Additionally, with good intention and awareness of inequalities, (2) the knowledge of the different useful levers, and the impact of one’s donations might not be accessible enough. 

In our project, we are seeking to respond to those issues. (1) Our visualizations will provide a clear overview of one’s relative position in terms of material wealth. Colloquially, one could learn “how rich they are” through computations made from users' input and different visualizations demonstrating, for example, on which percentile of the world population they are in terms of income. Users could see “how rich” they would remain if they donated some amount of money regularly. 
 Those visualizations can be enriched by supplementing additional context, such as geography. (2) Follow-up visualizations show the impact of different donations, e.g. how many lives could be saved by providing funding for insecticide bednets. Additionally, suggested charities can be displayed with brief descriptions and relevant figures, e.g. cost-effectiveness. 
 
The target audience is anyone with an income, in a developed country, motivated to learn about their wealth and the impact they can have.

Note that, the “how rich am I” calculator already exists on the Giving What We Can ( nonprofit promoting effective giving) [website](https://howrichami.givingwhatwecan.org/how-rich-am-i). Their implementation is outdated, we contacted them and they are keen on students remaking the “How Rich Am I?” calculator.


### Dataset

The main data we want to display comes from the paper “[The Future of Worldwide Income Distribution](https://www.piie.com/publications/working-papers/future-worldwide-income-distribution#:~:text=Global%20income%20inequality%20is%20projected,developing%20and%20emerging%2Dmarket%20economies.)” (Tomas Hellebrandt (PIIE) and Paolo Mauro (PIIE)) where they analyze the total distribution of wealth in the world for the years 2003 and 2013, they then project the trend to predict the distribution of wealth in 2035. Below is a figure of this distribution. Note that we have 1400 data points for each of the three curves. Raw data can be found [here](https://www.piie.com/sites/default/files/publications/wp/data/wp15-7.xlsx). 

![Screenshot 2023-04-03 141623](https://user-images.githubusercontent.com/63106608/229517400-9b1fe012-ec1d-4509-9eba-d570ba01667d.jpg)


In order to compare the income of someone living in an arbitrary country, we need data about the exchange rate between currencies (to go back to dollars). And we also need data about the “purchasing power parity” (1 dollar goes further in poorer countries). These 2 datasets come from the [OECD](https://data.oecd.org/conversion/purchasing-power-parities-ppp.htm#indicator-chart) and therefore are good quality. 

To compare the revenue of someone to the median revenue of each country, we need the gross national income per capita of each country. This dataset is also of good quality as the data comes from the [world bank](https://data.worldbank.org/indicator/NY.GNP.PCAP.CD). (To display the map, we need a dataset containing the sketch of the country’s borders.) 

Lastly, as we want to display how much impact one can have through donating, we need information about impactful charities: a brief description of their mission and metrics for success evaluation. There is no standard dataset for that, so we will have to compose it. This is not a problem as we don’t need an overly large repertoire of charities and this information is easily retrievable from sources such as [GiveWell](https://www.givewell.org/charities/top-charities). Their framework to evaluate charities includes the cost-effectiveness of interventions. This information can be integrated with the user’s income to highlight the potential impact of donations, e.g. number of lives saved per year if 10% of the salary is donated. 


### Exploratory Data Analysis

We mostly did not have to do data exploration because we already received them already cleaned and aggregated. 

One thing we did have to do is enrich the TopoJSON file for world map data with a parameter for 3-letter country codes so that it could be integrated with the other datasets. Additionally, there were some countries in the GNI dataset for whom we didn’t have the income data, some were named slightly differently and some territories were missing entirely compared to the TopoJSON file. 

What we will also do at the end of the project is updating the now over 5 years old data that was used for the original How Rich Am I calculator. For the income distribution (see figure above), this involves doing a linear interpolation between the 2013 and 2035 data to have the values for 2023.


### Related work

As mentioned before [Giving What We Can](https://www.givingwhatwecan.org/) (GWWC) has already implemented a "[How Rich am I?](https://howrichami.givingwhatwecan.org/how-rich-am-i)" calculator. They use in total 4-7 visualizations and two interactions for their calculator, highlighting how much you earn compared to the rest of the world, how much good donating a fixed percentage of your earnings, and how rich you'd still be after that.

Another source of inspiration is the Our World in Data page for [global income inequality](https://ourworldindata.org/income-inequality). It shows in many ways the problem of income inequality. They also refer to the World bank dataset.

A third source of inspiration has been the [D3.js](https://d3js.org/) and [Observable](https://observablehq.com/) websites that highlight different methods of data visualization and show how one could make them.

Our approach to improving the GWWC calculator is original because we are using new and arguably better visualizations to convey the scale of income inequality. We also plan on adding more ways for the user to interact with the visuals and showing them also different effective charities to donate to. The charities that we will select are empirically effective and have a large positive impact.


## Milestone 2 (7th May, 5pm)

**10% of the final grade**


## Milestone 3 (4th June, 5pm)

**80% of the final grade**


## Late policy

- < 24h: 80% of the grade for the milestone
- < 48h: 70% of the grade for the milestone

