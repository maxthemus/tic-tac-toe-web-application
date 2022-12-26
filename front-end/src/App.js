import './App.css';
import {useEffect, useState} from "react";
import {io} from "socket.io-client";
import axios from "axios";
import {BrowserRouter, Routes, Route} from "react-router-dom"

//Import components
import NavBar from './Components/NavBar';
import Main from "./Components/Main";
import Game from "./Components/Game";
import Login from "./Components/Login";
import Signup from './Components/Signup';

const game_service ="http://localhost:4004/";
const socket = io(game_service, {
  autoConnect: true, //Will need to open socket connection using socket.connect();
});

const board = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];

function App() {
  const [screen, setScreen] = useState("main");
  const [loggedIn, setLoggedIn] = useState(false);
  const [myTurn, setMyTurn] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [userId, setuserId] = useState(null);
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
    if(userId !== null) {
      socket.emit("authenticate", {
        userId: userId, //<---- for now its just user ID but could send a user JWT token
      });
    }
  }

  const joinQueue = () => {
    axios.post('http://localhost:4004/game/queue/'+userId).then(res => {
      console.log(res);
    });
  }

  const makeTurn = (index) => {
    if(gameState !== null && myTurn !== null) {
      if(myTurn) {
        socket.emit("game-turn", gameState);
      } else {
        console.log("Not my turn!");
      }
    } else {
      console.log("Not in game!");

      //Could request for game update?
    }
  }

  //Functions for handling login
  const loginUser = (username, password) => {
    console.log(username);
    console.log(password);

  }

  const signUpUser = (username, password) => {
    console.log(username);
    console.log(password);
  }

  const renderMain = () => {
    switch(screen) {
      case "game":
        return(<Game turnMaker={makeTurn} board={gameState !== null ? gameState.board : board}/>);
        break;
      case "login":
        return(<Login loginFunc={loginUser}/>);
        break;
      case "signup":
        return(<Signup signupFunc={signUpUser} />);
        break;

      case "main":
      default:
        return (<Main loggedIn={loggedIn} screenChanger={screenChange} />);
    //
    }
  }

  const screenChange = (newScreen) => {
    setScreen(newScreen);
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
        <NavBar screenChanger={screenChange} loggedIn={loggedIn} />
        
        {renderMain()}
      </header>
    </div>
  );
}

export default App;
