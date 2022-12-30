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

//Run time var
const gateWayLink = "http://localhost:4000/api";
const game_service ="http://localhost:4004/";
const socket = io(game_service, {
  autoConnect: false, //if false need to open socket connection using socket.connect();
});

const board = ['-', '-', '-', '-', '-', '-', '-', '-', '-'];
const gameStateTemp = {
  id: 0,
  board: board,
  players: [], //Empty if un initialized
  currentTurn:-1, //If -1 then game is un initialized
  turnNum: 0
}; //Is the default game state
let userId = null;

function App() {
  //Navigation
  const [screen, setScreen] = useState("main");
  const [loggedIn, setLoggedIn] = useState(false);
  const [inQueue, setinQueue] = useState(false); //For when in queue
  const [inGameOver, setinGameOver] = useState(false); //For when game is over screen
  
  //Game State
  const [inGame, setinGame] = useState(false); //By default not in game
  const [socketConn, setsocketCon] = useState(false);
  const [myTurn, setMyTurn] = useState(false);
  const [gameState, setGameState] = useState(gameStateTemp);
  const [gameInfo, setGameInfo] = useState("Tie game");
  const [myCharacter, setmyCharacter] = useState('-'); //By default your character is empty
  const [otherUsername, setotherUsername] = useState("...");

  //User state
  //const [userId, setuserId] = useState(0);
  const [auth, setauth] = useState(false);
  const [username, setUsername] = useState("");


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
      setGameState(data);
      setinGame(true);
      setMyTurn(data.currentTurn === userId);

      if(userId === data.players[0]) {
        setmyCharacter('X');
        getOtherUserInfo(data.players[1]);
      } else {
        setmyCharacter('O');
        getOtherUserInfo(data.players[0]);
      }
    });

    
    socket.on('join-queue', (data) => {
      console.log(data);
    });

    socket.on("game-update", (data) => {
      console.log(data);
      setGameState(data); //Overwrites the current game state

      //Now we override the is my turn
      setMyTurn(data.currentTurn === userId);
    });

    socket.on("game-over", (data) => {
      console.log("GAME OVER!");
      console.log(data);
      setinGame(false);
      
      if(data.winner) {
        //Now we need to check if player is winner or not
        if(data.winnerId === userId) {
          //Won the game
          setGameInfo("You Won");
        } else {
          //Lost game
          setGameInfo("You Lost");
        }
      } else {
        //Tie game
        setGameInfo("Tie game");
      }
      //Now we want to display game over pop up
      setinGameOver(true);//This will trigger the displaying of the game over pop up
    });
  
    return () => {
      socket.off("auth-ack");
      socket.off("join-queue");
      socket.off("game-start");
      socket.off("game-upate");
      socket.off("game-over");
    }
  }, [socket]);
  

  const connectToGameServer = () => {
    console.log("Connecting to server!");
    socket.connect();
    console.log(`Socket connected : ${socket.id}`);
  }

  const authenticateWithServer = (id) => {
    console.log("Sending auth : " + id);
    //sends the user id to the socket server using the authenticate 
    if(id !== null) {
      socket.emit("authenticate", {
        userId: id, //<---- for now its just user ID but could send a user JWT token
      });
    }
  }

  const sendAuth = () => {
    authenticateWithServer(userId);
  }

  const getOtherUserInfo = (userId) => {
    axios.get(`${gateWayLink}/user/data/username/${userId}`).then(payload => {
      let data = payload.data;
      if("validUser" in data) {
        if(data.validUser) {
          if("username" in data) {
            setotherUsername(data.username);
          } else {
            //Handle error
          }
        }
      } else {
        //Handle error
      }
    });
  }

  const joinQueue = () => {
    resetGameState();

    axios.post('http://localhost:4004/game/queue/'+userId).then(res => {
      console.log("Joining queue");
      console.log(res);
    });
  }

  const makeTurn = (index) => {
    if(gameState !== null && myTurn) {
      if(gameState.board[index] === "-") {
        setMyTurn(false);
        if(gameState.players[0] === userId) {
          gameState.board[index] = 'X';
        } else {
          gameState.board[index] = "O";
        }

        socket.emit("game-turn", gameState);
        console.log("Turn made!");
      } else {
        console.log("Not in game!");

        //Could request for game update?
      }  
    }
  }

  //Function for handling login
  const loginUser = (username, password, _callback) => {
    axios.post(`${gateWayLink}/user/login`, {
      username:username,
      password:password
    }).then(payload => {
      let data = payload.data;
      console.log(data);

      if("loggedIn" in data) {
        setLoggedIn(data.loggedIn);
        //Set user state!
        if(data.loggedIn) {
          userId =  data.userId;
          setUsername(data.username);
          
          connectToGameServer(); //Once logged in we need to connect sockets
          authenticateWithServer(data.userId);
        }
      }
      _callback(data);
    });
  }
  //Function for handling user logout
  const logoutUser = () => {
    console.log("Logging Out");

    setLoggedIn(false);
    setinQueue(false);

    //We will want to reset user data
    setUsername("");
    setauth(false); 
    //reset game state
    resetGameState();
    
    //Change back to main menu
    screenChange("main");

    //Now we want to disconnect userInfo
    socket.disconnect();
  }

  const signUpUser = (username, password) => {
    axios.post(`${gateWayLink}/user/signup`, {
      username:username,
      password:password
    }).then(data => {
      screenChange("login");
    });
  }

  const renderMain = () => {
    switch(screen) {
      case "game":
        return(<Game username={username} otherUsername={otherUsername} myCharacter={myCharacter} myTurn={myTurn} turnMaker={makeTurn} board={gameState.board} inGame={inGame} gameOver={inGameOver} gameOverInfo={winnerInfo} gameState={gameState}/>);
        break;
      case "login":
        return(<Login loginFunc={loginUser} screenChanger={screenChange}/>);
        break;
      case "signup":
        return(<Signup signupFunc={signUpUser} />);
        break;

      case "main":
      default:
        if(inGameOver) {
          setinGameOver(false); 
        }
        return (<Main sendJoinQueue={joinQueue} authSender={sendAuth} auth={auth} loggedIn={loggedIn} screenChanger={screenChange} />);
    }
  }

  const screenChange = (newScreen) => {
    setScreen(newScreen);
  }

  const resetGameState = () => {
    //Now we need to reset game states!
    setinGame(false);
    setMyTurn(false);
    setGameState(gameStateTemp); //back to default state
    setmyCharacter('X');
  }


  //Function for printing winner info
  const winnerInfo = () => {
    if(inGameOver) {
      return (
          <div className="game__popup">
              <h3 className='popup__title'>{gameInfo}</h3>
              <div className='popup__menu'>
                <button onClick={() => {setinGameOver(false); setinQueue(true); joinQueue(); screenChange("game");}}>Play again</button>
                <button onClick={() => {setinGameOver(false); screenChange("main");}}>Main Menu</button>
              </div>
          </div>
      );
  } else {
      return (<div></div>);
  }
  }
  
  return (
    <div className="App">
      <header className="App-header">
        <NavBar logoutFunc={logoutUser} screenChanger={screenChange} loggedIn={loggedIn} username={username} />
        
        {renderMain()}
      </header>
    </div>
  );
}

export default App;
