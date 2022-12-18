//Run time vars
const PORT = 4002;
const PATH = "/user";

//Imports
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

//End points
app.post(`${PORT}/login`, (req, res) => {
    res.send("Need to implement login");
});

app.post(`${PORT}/signup`, (req, res) => {
    res.send("Need to implement signup");
});

app.get(`${PORT}/data/:userId`, (req, res) => {
    res.send("Need to implement get user data");
});

//Starting server
app.listen(PORT, () => {
    console.log("Gateway service has started! on port " + PORT);
});