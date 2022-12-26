//Run time vars
const PORT = 4004;
const PATH = "/game";
let users = new Map(); // Will map user id to the user socket
let games = new Map(); // Will map game id to game objects
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
    if(users.has(req.params.userId)) {
        let joinedQueue = joinQueue(req.params.userId); 
    
        if(joinedQueue) {
            io.to(users.get(parseInt(req.params.userId))).emit("join-queue", {message:"you have joined queue"});
        
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

    //Now we want to call the function which will handle the queue
    gameQueueHandler();
});


//Socket io
io.on("connection", (socket) => {

    socket.on("authenticate", (data) => {
        console.log("Got auth");
        //Take userId from data and map the userId to the socket in the users map
        if("userId" in data) {
            users.set(data.userId, socket); //Mapping the userId to the socket

            //Send acknowledgement
            io.to(socket.id).emit("auth-ack", { valid: true});
        } else {
            //Invalid payload and need to handle ERROR
            io.to(socket.id).emit("auth-ack", { valid: false});
        }
    });


    socket.on("game-turn", (data) => {
        //First we want to check if it is that players turn
        if(users.get(data.currentTurn).id === socket.id) {
            //It is a valid update to the game
            console.log("Valid update!");

            //We need to check if the game is over
            let winnerCheck = checkWin(data);
            if(winnerCheck === null) { //No
                 //Switching current turn
                if(data.currentTurn === data.players[0]) {
                    data.currentTurn = data.players[1];
                } else {
                    data.currentTurn = data.players[0];
                }

                games.set(data.id, data); //Updating the game in memory

                //Now we need to send the update to the room
                io.to(`ROOM-${data.id}`).emit("game-update", data);
            } else {
                if(winnerCheck === '-') {
                    data.winner = false;
                } else {
                    data.winner = true;
                    if(winner === 'X') {
                        data.winnerId = data.players[0]
                    } else {
                        datalwinnerId = data.players[1];
                    }
                }


                io.to(`ROOM-${data.id}`).emit("game-over", data);
            }
        } else {
            //Not valid update to game
            console.log("Invalid update!");
        }

    })
});

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
        id: gameId++,
        board: ['-', '-', '-', '-', '-', '-', '-', '-', '-'],
        players: [], //Empty if un initialized
        currentTurn:-1, //If -1 then game is un initialized
        turnNum: 0
    }

    return gameObject;
}

//Every time someone joins the queue this function will be called
function gameQueueHandler () {
    console.log("called!");
    //We want to loop while players in queue is greater then 2
    while(gameQueue.length >= 2) {
        //We want to pop two players of the queue
        let userOne = gameQueue.pop();
        let userTwo = gameQueue.pop();
        
        let gameObject = createGame();
        //Now we want to fill the game object
        gameObject.players.push(userOne);
        gameObject.players.push(userTwo);
        gameObject.currentTurn = userOne;

        //Now we want to communicate to the users that the game has started!
        //First we put users into a room
        let userSocketOne = users.get(userOne);
        let userSocketTwo = users.get(userTwo);
        let roomName = `ROOM-${gameObject.id}`;
        userSocketOne.join(roomName);
        userSocketTwo.join(roomName);

        //Now we want to send a broadcast to room
        io.to(roomName).emit("game-start", gameObject);

        //Add game object to game map
        games.set(gameObject.id, gameObject);
    }
}

//Function to check if game has a winner or if it is over
function checkWin(gameObject) {
    let winner = null;
    //Now we want to loop through the game 
    for(let i = 0; i < 9; i+3) { //Horizontal loop
        console.log(i);//Just for debugging purposes!
        if(gameObject.board[i] === gameObject.board[i+1] && gameObject.board[i+1] === gameObject.board[i+2]) {
            if(gameObject.board[i] !== '-') {
                winner = gameObject.board[i];
            }
        }
    }

    for(let i = 0; i < 3; i++) { //Vertical loop
        if(gameObject.board[i] === gameObject.board[i+3] && gameObject.board[i+3] === gameObject.board[i+6]) {
            if(gameObject.board[i] !== '-') {
                winner = gameObject.board[i];
            }
        }
    }

    //Diagonal botL -> topR
    if(gameObject.board[2] === gameObject.board[4] && gameObject.board[4] === gameObject.board[7]) {
        if(gameObject.board[i] !== '-') {
            winner = gameObject.board[2];
        }
    }

    //Diagonal topL -> botR
    if(gameObject.board[0] === gameObject.board[4] && gameObject.board[4] === gameObject.board[8]) {
        if(gameObject.board[i] !== '-') {
            winner = gameObject.board[0];
        }
    }

    if(winner === null && turnNum >= 9) {
        //There is no winner and game is tie
        return " "; //Empty has won
    }
    return winner; //Else we return the game winner
}