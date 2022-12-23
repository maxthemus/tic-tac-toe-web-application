//Run time vars
const PORT = 4004;
const PATH = "/game";
let users = new Map(); // Will map user id to the user socket
let gameQueue = [];

//Imports
const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


//End points
app.post(`${PATH}/queue/:userId`, (req, res) => {
    //First we need to see if the userId is corrosponding to a socket
})


//Socket io
io.on("connection", (socket) => {
    stop=false;
    console.log("Testing this works?");
  
    socket.on("authenticate", (data) => {
        console.log("Got auth");
        //Take userId from data and map the userId to the socket in the users map
        if("userId" in data) {
            users.set(data.userId, socket.id); //Mapping the userId to the socket

            //Send acknowledgement
            io.to(socket.id).emit("auth-ack", { valid: true});
        } else {
            //Invalid payload and need to handle ERROR
            io.to(socket.id).emit("authenticate", { valid: false});
        }
    });
})

//Starting server
http.listen(PORT, () => {
    console.log("Game service has started! on port " + PORT);
});

