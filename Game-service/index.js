//Run time vars
const PORT = 4004;
const PATH = "/game";
let users = new Map(); // Will map user id to the user socket

//Imports
const express = require("express");
const app = express();

const http = require("http").createServer(app);
const io = require("socket.io")(http);


//End points
app.post(`${PATH}/queue/:userId`, (req, res) => {
    res.send("Needs to be inplemented");
})


//Socket io
io.on("connection", (socket) => {
    console.log("First thing that happens on conneciton");
})

//Starting server
http.listen(PORT, () => {
    console.log("Game service has started! on port " + PORT);
});