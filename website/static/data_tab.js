// Use this file to make the button that generates a random descriptor along with the rest of the encounter's information.

// Select the button element by its id
var button = document.getElementById("descriptionButton");

// Add a click event listener to the button
button.addEventListener("click", function() {
  generateNewStory(data);
});

//Translate the json to a variable
const url = "http://127.0.0.1:5000/api/v1.0/all_data"
let data; // Store the fetched data

// Fetch the JSON data and call init when done
d3.json(url).then(function(fetchedData) {
    data = fetchedData;
    generateNewStory(data);
});

function generateNewStory(data) {
    // Generate a random number between 0 and 65113
    var min = 0;
    var max = 65113;
    var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

    // Filter the data once
    const sighting = data.filter(result => result.id === randomNumber);
    console.log(randomNumber); // Output the random number
    console.log(sighting); // Output the sighting associated with the ID

    let comments;
    let id; 
    let date;
    let city;
    let state;
    let duration;
    let shape;
    let latitude;
    let longitude;
    let date_reported;

    sighting.forEach(elt => {
        comments = elt.comments;
        id = elt.id;
        date = elt.datetime;
        city = elt.city;
        state = elt.state;
        duration = elt.duration_seconds;
        shape = elt.shape;
        latitude = elt.latitude;
        longitude = elt.longitude;
        date_reported = elt.date_posted;
    })

    var sightingComments = document.getElementById("sighting-comments");
    sightingComments.innerHTML = `<strong>\"${comments}\"</strong>`;
    
    // THE BELOW CODE WORKS BUT SHOWCASES A WEAKNESS OF THE DATA
    // var sightingDetails = document.getElementById("sighting-details");
    // sightingDetails.innerHTML = `
    //     <strong>#ID:</strong> ${id} <br/>
    //     <strong>Date seen:</strong> ${date} <br/>
    //     <strong>Date reported:</strong> ${date_reported} <br/>
    //     <strong>Location:</strong> ${city}, ${state} <br/>
    //     <strong>Duration in seconds:</strong> ${duration} <br/>
    //     <strong>Description:</strong> ${shape} <br/>
    //     <strong>Coordinates:</strong> (${latitude},${longitude})`;

}