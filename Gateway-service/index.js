//Run time vars
const PORT = 4000;
const PATH = "/api";

//Imports
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

//End points

/** USER services */
app.post(`${PATH}/user/login`, (req, res) => {
    res.send("Not implemented yet");
});

app.post(`${PATH}/user/signup`, (req, res) => {
    res.send("Not implemented yet");
});
/** USER end */




//Starting server
app.listen(PORT, () => {
    console.log("Gateway service has started! on port " + PORT);
});

//Functions

