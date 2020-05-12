// Initialize Firebase RealTime Database
var firebaseConfig = {
    apiKey: "AIzaSyA8HvyZRVKh4pIVR_AGe1Afl3YjqqVT6DM",
    authDomain: "train-scheduler-dc292.firebaseapp.com",
    databaseURL: "https://train-scheduler-dc292.firebaseio.com",
    projectId: "train-scheduler-dc292",
    storageBucket: "train-scheduler-dc292.appspot.com",
    messagingSenderId: "327329180117",
    appId: "1:327329180117:web:c9b068ce1214955be3f55c",
    measurementId: "G-YQMDNR12QZ"
};

firebase.initializeApp(firebaseConfig);
var dataRef = firebase.database();

//Initial values
var name = "";
var destination = "";
var firstTrain = "";
var frequency = 0;

//Retrieve the values of the user input
$("#add-train-schedule").on("click", function (event) {
    event.preventDefault();

    name = $("#train-name").val().trim();
    destination = $("#destination").val().trim();
    firstTrain = $("#first-train").val().trim();
    frequency = $("#frequency").val().trim();

    //Push to the database
    dataRef.ref().push({
        name: name,
        destination: destination,
        firstTrain: firstTrain,
        frequency: frequency,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });

    //empty input field
    $("#train-name").val("");
    $("#destination").val("");
    $("#first-train").val("");
    $("#frequency").val("");
});

dataRef.ref().on("child_added", function (childSnapshot) {

    var firstTime = childSnapshot.val().firstTrain;
    var trainFrequency = childSnapshot.val().frequency
    //calculate the next arrival and the minutes away
    var firstTrainConverted = moment(firstTime, "HH:mm").subtract(1, "years");
    var diffTime = moment().diff(moment(firstTrainConverted), "minutes");
    var trainRemainder = diffTime % trainFrequency;
    //If Frequency input or First Train Time inputs are not completed, the Minutes away and next arrival are Unknown
    var minutesAway;
    var nextArrival;
    if (trainFrequency === "" || firstTime === "" ) {
        minutesAway = "Unknown";
        nextArrival = "Unknown";
    } else {
        minutesAway = trainFrequency - trainRemainder;
        nextArrival = moment().add(minutesAway, "minutes");
        nextArrival = moment(nextArrival).format("hh:mm")
    };

    // Add the new row in the table
    $("#current-train-schedule").append("<tr id='row-" + childSnapshot.key + "'><td class='train-name'>" +
        childSnapshot.val().name +
        " </td><td class='train-destination'> " + childSnapshot.val().destination +
        " </td><td  class='first-train-frequency'> " + trainFrequency +
        " </td><td  class='train-time'> " + nextArrival +
        "</td><td>" + minutesAway +
        //Add a button 
        "</td><td><button class='remove' data-key='" + childSnapshot.key + "'>X</button></td></tr> ");

    var removebutton = $(".remove")
    // remove the row by a delete button onClick
    removebutton.on("click", function () {
        // Remove the row in Firebase
        dataRef.ref().child($(this).attr("data-key")).remove();
        // Remove the row in the DOM
        $("#row-" + $(this).attr("data-key")).remove();

    });

    // Handle the errors
}, function (errorObject) {
    console.log("Errors handled: " + errorObject.code);
});