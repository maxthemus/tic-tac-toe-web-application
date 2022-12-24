import './App.css';
import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import axios from "axios";

const game_service ="http://localhost:4004/";
const socket = io(game_service, {
  autoConnect: false, //Will need to open socket connection using socket.connect();
});

function App() {
  const [gameState, setGameState] = useState(null);
  const [userId, setuserId] = useState(0);
  const [temp, setTemp] = useState(0);
  const [auth, setauth] = useState(false);

  useEffect(() => {

    socket.on('auth-ack', (data) => {
      if("valid" in data) {
        console.log("AUTH == " + data.valid);
        setauth(data.valid);

      } else {
        //Throw some sort of error or try to re auth
      }
    });

    socket.on('game-start', (data) => {
      console.log(data);
      setGameState(data);
    });

    socket.on('join-queue', (data) => {
      console.log(data);
    });

    socket.on("game-update", (data) => {
      console.log(data);
      setGameState(data); //Overwrites the current game state
    });

    socket.on("game-over", (data) => {
      console.log(data);
      alert("The game is over!");
    })
  
    return () => {
      socket.off("auth-ack");
      socket.off("join-queue");
      socket.off("game-start");
      socket.off("game-upate");
    }
  }, [socket]);
  

  const connectToGameServer = () => {
    console.log("Connecting to server!");
    socket.connect();
    console.log(socket.id);
  }

  const authenticateWithServer = () => {
    console.log("Sending auth : " + userId);
    //sends the user id to the socket server using the authenticate 
    socket.emit("authenticate", {
      userId: userId, //<---- for now its just user ID but could send a user JWT token
    });
  }

  const joinQueue = () => {
    axios.post('http://localhost:4004/game/queue/'+userId).then(res => {
      console.log(res);
    });
  }

  const makeTurn = () => {
    if(gameState !== null) {
      socket.emit("game-turn", gameState);
    } else {
      console.log("Not in game!");
    }
  }

  
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={connectToGameServer}>Connect to server!</button>
        <button onClick={authenticateWithServer}>Authenticate</button>
        <h3> we are auth : {auth ? "true" : "false"}</h3>
        <button onClick={joinQueue}>Join queue</button>
        <input onChange={(e) => {setTemp(e.target.value)}}/>
        <button onClick={() => {setuserId(temp)}}>Set userId</button>
        <button onClick={makeTurn}>updateGame</button>
      </header>
    </div>
  );
}

export default App;
