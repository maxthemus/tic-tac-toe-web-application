//Run time vars
const PORT = 4002;
const PATH = "/user";
const DB_URL = "http://localhost:4001/db";

//Imports
const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());


//End points
app.post(`${PATH}/login`, (req, res) => {
    if("username" in req.body && "password" in req.body) {
        //Send request to data base service to check if user exists
        axios.get(`${DB_URL}/users/username/${req.body.username}`).then(response => {
            if("validUser" in response.data) {
                if(response.data.validUser) {
                    //Check if usernames and passwords match
                    if("username" in response.data.userInfo && "password" in response.data.userInfo) {
                        if(response.data.userInfo.username === req.body.username && response.data.userInfo.password === req.body.password) {
                            res.send({
                                message: "You are logged In",
                                userId: response.data.userInfo.userId,
                                username: response.data.userInfo.username,
                                loggedIn:true
                            });
                        } else {
                            res.send({
                                message:"Incorrect username or password",
                                loggedIn:false
                            });
                        }
                    } else {
                        res.send({
                            message:"Error with internal servers"
                        });
                    }
                } else {
                    res.send({
                        message: "Invalid user",
                        loggedIn: false
                    });
                }
            } else {
                res.send({
                    message:"Error with internal servers"
                });
            }       
        });
    } else {
        res.send({
            message:"Invalid payload",
            loggedIn: false
        });
    }
});

app.post(`${PATH}/signup`, (req, res) => {
    if("username" in req.body && "password" in req.body) {
        //Checkg db if username aleardy exists
        axios.get(`${DB_URL}/users/username/${req.body.username}`).then(response => {
            if("validUser" in response.data) {
                if(response.data.validUser) {
                    //User already exists
                    res.send({
                        message: "User already exists",
                        userCreated: false
                    });
                } else {
                    //Creating the user
                    axios.post(`${DB_URL}/users/create`, {
                        username:req.body.username,
                        password:req.body.password
                    }).then(response => {
                        if("userCreated" in response.data) {
                            if(response.data.userCreated) {
                                res.send({
                                    message: "User has been created",
                                    userId: response.data.userId,
                                    userCreated: response.data.userCreated
                                });
                            } else {
                                res.send({
                                    message:"User not created",
                                    userCreated:false
                                });
                            }
                        } else {
                            res.send({
                                message:"Error with internal servers"
                            });
                        }
                    });
                }
            } else {
                res.send({
                    message:"Invalid payload",
                    userCreated: false
                });
            }
        });
    } else {
        res.send({
            message:"Invalid payload",
            userCreated: false
        });
    }
});

app.get(`${PATH}/data/:userId`, (req, res) => {
    res.send("Need to implement get user data");
});

//Starting server
app.listen(PORT, () => {
    console.log("Gateway service has started! on port " + PORT);
});

//FUNCTIONS