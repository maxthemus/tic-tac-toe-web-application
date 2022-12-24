//Run time vars
const PORT = 4004;
const PATH = "/game";
let users = new Map(); // Will map user id to the user socket
let gameQueue = [];
let gameId = 1;

//Imports
const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());

const http = require("http").createServer(app);
const io = require("socket.io")(http, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});


//End points
app.post(`${PATH}/queue/:userId`, (req, res) => {
    //First we need to check if user is connect via a socket
    if(users.has(parseInt(req.params.userId))) {
        let joinedQueue = joinQueue(req.params.userId); 
    
        if(joinedQueue) {
            io.to(users.get(parseInt(req.params.userId))).emit("message", {message:"message"});
        
            res.send({
                message:"Joined the queue",
                socketConnected:true,
                joinedQueue:true
            });
        } else {
            res.send({
                message:"Already in queue",
                socketConnected: true,
                joinedQueue:false 
            });
        }
    } else {
        res.send({
            message:"Need socket connection",
            socketConnected:false
        });
    }
});


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

//FUNCTIONS
function joinQueue(userId) {
    //Check if user is in queue
    let inQueue = false;
    for(let i = 0; i < gameQueue.length; i++) {
        if(gameQueue[0] === userId) {
            //User is in queue
            inQueue = ture;
            break;
        }
    }

    console.log(gameQueue);

    if(inQueue) {
        return false; //Didn't join queue
    } else {
        gameQueue.push(userId);
        console.log(gameQueue);
        return true; //Joined queue
    }
}


//Function creates a game object
function createGame() {
    let gameObject = {
        Id: gameId++,
        board: [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        players: [], //Empty if un initialized
        currentTurn:-1, //If -1 then game is un initialized
    }

    return gameObject;
}