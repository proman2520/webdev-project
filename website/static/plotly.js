// Plotly visual where you choose a state and the metadata is populated as well as 
// a bar graph of the cities with the most sightings in that state. The metadata can
// contain the most common shape seen, the average/median duration of the encounter,
// the number of sightings in the state from the data, and maybe the oldest and most 
// recent recorded sightings.

//Translate the json to a variable
const url = "http://127.0.0.1:5000/api/v1.0/all_data"
let data; // Store the fetched data

// Fetch the JSON data and call init when done
d3.json(url).then(function(fetchedData) {
    data = fetchedData;
    init();
});

// Init function
function init() {

    //Use D3 to select the dropdown menu
    let dropdownMenu = d3.select("#selDataset");
        
    let states = [
        "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DC", "DE", "FL", "GA",
        "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
        "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
        "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD",
        "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
    ];
    
    //Add values to the dropdown menu
    states.forEach((state) => {
        dropdownMenu.append("option")
        .text(state).property("value", state);
    });

    // Set the default state.
    let defaultState = states[0];
    console.log(defaultState);

    //Build the initial plots here
    barChart(defaultState);
    pieChart(defaultState);
    metaData(defaultState);

}

// barChart function
function barChart(state) {
// Bar chart that shows the top 10 cities in the state where there were sightings.

    const lowercaseState = state.toLowerCase();
        
    // Filter the data once
    const stateData = data.filter(result => result.state === lowercaseState);

    const cityCounts = {};
    stateData.forEach(elt => {
        const city = elt.city;
        cityCounts[city] = (cityCounts[city] || 0) + 1;
    });

    const sortedCities = Object.entries(cityCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const cities = sortedCities.map(cityData => cityData[0]).reverse();
    const counts = sortedCities.map(cityData => cityData[1]).reverse();

    // Plot
    let trace = {
        x: counts,
        y: cities,
        type: "bar",
        orientation: "h"
    }
    
    // Create the data array and layout
    let bar_data = [trace];
    let layout = {
        title: `Top 10 Cities in ${state} with UFO Sightings`
    };

    // Plot the bar chart
    Plotly.newPlot("bar", bar_data, layout);

}

// pieChart function
function pieChart(state) {
// Pie chart that shows the descriptors (shapes) in the state where there were sightings.
// (ERROR: "Other" and "other" ARE APPEARING AS SEPARATE CATEGORIES.)

    const lowercaseState = state.toLowerCase();
        
    // Filter the data once
    const stateData = data.filter(result => result.state === lowercaseState);

    const shapeCounts = {};
    stateData.forEach(elt => {
        const shape = elt.shape;
        shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
    });

    const sortedShapes = Object.entries(shapeCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        // Get rid of null (ERROR: NULL IS STILL APPEARING)
        .filter(item => (item !== null) && (item !== undefined) && (item !== "") && (item !== "null"));

    // Sum the counts of all items beyond the first 10
    const otherCount = sortedShapes.slice(10).reduce((total, item) => total + item[1], 0);

    // Create a new array combining the top 10 and "other" category
    const combinedData = [
        ...sortedShapes,
        ["Other", otherCount]
    ];

    // Extract labels and values from combinedData
    const labels = combinedData.map(data => data[0]);
    const values = combinedData.map(data => data[1]);

    // Define the data trace for the pie chart
    const pie_data = [
        {
            labels: labels,
            values: values,
            type: "pie"
        }
    ];

    // Define the layout options (optional)
    const layout = {
        title: "State sightings by primary descriptor",
        // Add other layout options here
    };

    // Create the pie chart
    Plotly.newPlot("pie", pie_data, layout);

}

// metaData function
function metaData(state) {
// The metadata should have the number of sightings in the state (of the total), the median duration of the encounter,
// the most common shape seen, the oldest sighting, and the most recent sighting from the data.

    const lowercaseState = state.toLowerCase();
        
    // Filter the data once
    const stateData = data.filter(result => result.state === lowercaseState);

   // Number of sightings
    const sightings = stateData.length;
    /* Math.round() only rounds to integers. Therefore, you need to
    * 10000, Math.round(), / 100 to get a percent. 10000 because you need to go from 0.xxxx to xxxx.0 to xx.xx. */
    const sightingsPct = Math.round((sightings / 65111) * 10000) / 100;

    // Average duration
    let averageDuration = 0;
    stateData.forEach(elt => {
        averageDuration += parseFloat(elt.duration_seconds);
    });
    averageDuration = Math.round((averageDuration / sightings) * 100) / 100;

    // Common shape
    const shapeCounts = {};
    stateData.forEach(elt => {
        const shape = elt.shape;
        shapeCounts[shape] = (shapeCounts[shape] || 0) + 1;
    });

    const sortedShapes = Object.entries(shapeCounts)
        .sort((a, b) => b[1] - a[1]);
        commonShape = sortedShapes[0][0];

    // Oldest and most recent sighting (ERROR: it is returning it a day earlier because of automatic time-zone adjustment)
    let newestSighting = new Date(stateData[0].datetime).getTime();

    let oldestSighting = new Date(stateData[0].datetime).getTime();

    stateData.forEach((elt) => {
        const sightingDate = new Date(elt.datetime).getTime();
    
        if (sightingDate < oldestSighting) {
            oldestSighting = sightingDate;
        }

        if (sightingDate > newestSighting) {
            newestSighting = sightingDate;
        }
    })

    // Convert back to date strings
    oldestSighting = new Date(oldestSighting).toDateString();
    newestSighting = new Date(newestSighting).toDateString();

    // Populate metadata
    d3.select("#sample-metadata").html("");
    d3.select("#sample-metadata").append("h5").html(
        `<u>Sightings:</u> ${sightings}/65111 (${sightingsPct}%)<br/><u>Average duration:</u> ${averageDuration} seconds<br/>\
        <u>Popular descriptor:</u> "${commonShape}"<br/><u>Oldest sighting:</u> ${oldestSighting}<br/>\
        <u>Last sighting in dataset:</u> ${newestSighting}`
    );

}

// optionChanged function
function optionChanged(state) {
    
    //Log new value
    console.log(state);

    //Call all functions
    barChart(state);
    pieChart(state);
    metaData(state);

}