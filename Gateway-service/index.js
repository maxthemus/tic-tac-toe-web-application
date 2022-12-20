//Run time vars
const PORT = 4000;
const PATH = "/api";
const USER_URL = "http://localhost:4002/user";
const cookieAge = 1000 * 60 * 60 * 24;

//Imports
const express = require("express");
const axios = require("axios");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const app = express();
app.use(express.json());
app.use(session({
    secret:"KEY",
    saveUninitialized: false,
    cookie: {maxAge:cookieAge},
    resave: false
}));
app.use(cookieParser());    

//End points

/** USER services */
app.post(`${PATH}/user/login`, (req, res) => {
    if("username" in req.body && "password" in req.body) {
        axios.post(`${USER_URL}/login`, {
            username:req.body.username,
            password:req.body.password
        }).then(response => {
            if("loggedIn" in response.data) {
                if(response.data.loggedIn) {
                    //creating user session
                    req.session.userId = response.data.userId;
                    req.session.username = response.data.username;

                    res.send({
                        message:"Logged in",
                        userId: req.session.userId,
                        username: req.session.username,
                        loggedIn:true
                    });
                } else {
                    res.send({
                        message:response.data.message,
                        loggedIn:false
                    });
                }
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



//TESTING END POINTS FOR DEBUGGING
app.get("/test/session", (req, res) => {
    res.send({
        userId: req.session.userId,
        username: req.session.username
    });
});


//Starting server
app.listen(PORT, () => {
    console.log("Gateway service has started! on port " + PORT);
});

//Functions

