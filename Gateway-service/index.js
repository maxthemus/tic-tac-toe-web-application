//Run time vars
const PORT = 4000;
const PATH = "/api";
const USER_URL = "http://localhost:4002/user";

//Imports
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

//End points

/** USER services */
app.post(`${PATH}/user/login`, (req, res) => {
    if("username" in req.body && "password" in req.body) {
        axios.post(`${USER_URL}/login`, {
            username:req.body.username,
            password:req.body.password
        }).then(response => {
            if("loggedIn" in response.data) {
                res.send(response.data);
            } else {
                res.send("Error from the server side");
            }
        });
    } else {
        res.send({
            message:"Invalid payload",
            loggedIn:false
        });
    }
});

app.post(`${PATH}/user/signup`, (req, res) => {
    if("username" in req.body && "password" in req.body) {
        axios.post(`${USER_URL}/signup`, {
            username:req.body.username,
            password:req.body.password
        }).then(response => {
            if("userCreated" in response.data) {
                res.send(response.data);
            } else {
                res.send({
                    message:"Error with internal servers"
                });
            }
        });
    } else {
        res.send({
            message:"Invalid payload",
            userCreated:false
        });
    }
});
/** USER end */




//Starting server
app.listen(PORT, () => {
    console.log("Gateway service has started! on port " + PORT);
});

//Functions

