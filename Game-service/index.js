//Run time vars
const PORT = 4004;
const PATH = "/game";
let users = new Map(); // Will map user id to the user socket
let usersToGameId = new Map(); //Will map userId to the game id
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
app.get(`${PATH}/user/:userId`, (req, res) => {
    if(users.has(parseInt(req.params.userId))) {
        res.send({
            message: "User has connected socket",
            userConnected: true
        });
    } else {
        res.send({
            message:"User isn't connected by socket",
            userConnected: false
        });
    }
});

app.post(`${PATH}/queue/:userId`, (req, res) => {    
    //First we need to check if user is connect via a socket
    if(users.has(parseInt(req.params.userId))) {
        let joinedQueue = joinQueue(parseInt(req.params.userId)); 
    
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
    console.log("Socket Connected!");

    socket.on("authenticate", (data) => {
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
            data.turnNum++; //Inc turn num

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
                console.log(`WINNER CHECK === ${winnerCheck}`);

                if(winnerCheck === '-') {
                    data.winner = false;
                } else {
                    data.winner = true;
                    if(winnerCheck === 'X') {
                        data.winnerId = data.players[0]
                    } else if (winnerCheck === 'O') {
                        data.winnerId = data.players[1];
                    }
                }

                io.to(`ROOM-${data.id}`).emit("game-over", data);

                //Remove the userId map to gameId
                usersToGameId.delete(data.players[0]);
                usersToGameId.delete(data.players[1]);

                //Now we can delete the game state
                games.delete(data.id);
            }
        } else {
            //Not valid update to game
            console.log("Invalid update!");
        }

    });

    //For handling disconnect
    socket.on("disconnect", (data) => {
        console.log("User disconnected!");
        let userId = null;

        //Search for user id
        for(let [key, value] of users.entries()) {
            if(value === socket) {
                userId = key;
                break;
            }
        }

        console.log(`USER ID === ${userId}`);

        if(userId !== null) {
            //Will search for userId in the queue
            for(i in gameQueue) {
                if(gameQueue[i] === userId) {
                    gameQueue.splice(i, 1);
                    return;
                }
            }

            //Will search for it player is in a game
            if(usersToGameId.has(userId)) {
                //User is in a game
                let userGame = usersToGameId.get(userId);
                let game = games.get(userGame);
                //Now we want to send a game over message to the other playing say that they won
                game.winner = true;
                game.winnerId = (parseInt(game.players[0]) === parseInt(userId) ? game.players[1] : game.players[0]);
                io.to(`ROOM-${game.id}`).emit("game-over", game);

                //Remove the userId map to gameId
                usersToGameId.delete(game.players[0]);
                usersToGameId.delete(game.players[1]);

                //Now we can delete the game state
                games.delete(game.id);
            }     
        }
        users.delete(userId); //Deleting user 
    });
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
    console.log("Queue handler invoked!");
    console.log(`Queue = ${gameQueue}`);
    //We want to loop while players in queue is greater then 2
    while(gameQueue.length >= 2) {
        //We want to pop two players of the queue
        let userOne = parseInt(gameQueue.pop());
        let userTwo = parseInt(gameQueue.pop());
        
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

        //Mapping user id to game Id
        usersToGameId.set(userOne, gameObject.id);
        usersToGameId.set(userTwo, gameObject.id);

        //Now we want to send a broadcast to room
        io.to(roomName).emit("game-start", gameObject);

        //Add game object to game map
        games.set(gameObject.id, gameObject);
    }
}

//Function to check if game has a winner or if it is over
function checkWin(gameObject) {
    console.log("Checking for winner!");

    let winner = null;
    //Now we want to loop through the game 
    for(let i = 0; i < 9; i+=3) { //Horizontal loop
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
        if(gameObject.board[2] !== '-') {
            winner = gameObject.board[2];
        }
    }

    //Diagonal topL -> botR
    if(gameObject.board[0] === gameObject.board[4] && gameObject.board[4] === gameObject.board[8]) {
        if(gameObject.board[0] !== '-') {
            winner = gameObject.board[0];
        }
    }

    if(winner === null && gameObject.turnNum >= 9) {
        //There is no winner and game is tie
        return "-"; //Empty has won
    }
    return winner; //Else we return the game winner
}