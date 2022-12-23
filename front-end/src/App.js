import './App.css';
import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import axios from "axios";

//For testing purposes
const userID = 1;

const game_service ="http://localhost:4004/";
const socket = io(game_service, {
  autoConnect: false, //Will need to open socket connection using socket.connect();
});

function App() {
  const [auth, setauth] = useState(false);

  useEffect(() => {

    socket.on('auth-ack', (data) => {
      if("valid" in data) {
        setauth(data.valid);
      } else {
        //Throw some sort of error or try to re auth
      }
    });
  
    return () => {
      socket.off("auth-ack");
    }
  }, [socket]);
  

  const connectToGameServer = () => {
    console.log("Connecting to server!");
    socket.connect();
    console.log(socket.id);
  }

  const authenticateWithServer = () => {
    console.log("Sending auth");
    //sends the user id to the socket server using the authenticate 
    socket.emit("authenticate", {
      userId: userID, //<---- for now its just user ID but could send a user JWT token
    });
  }

  
  return (
    <div className="App">
      <header className="App-header">
        <button onClick={connectToGameServer}>Connect to server!</button>
        <button onClick={authenticateWithServer}>Authenticate</button>
        <h3> we are auth : {auth ? "true" : "false"}</h3>
      </header>
    </div>
  );
}

export default App;
