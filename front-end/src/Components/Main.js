import React from "react";

function Main(props) {

    const handelQueue = () => {
        if(!props.loggedIn) {
            props.screenChanger("login");
        } else {
            //Checking to see if user is auth
            if(props.auth) {
                //Joining the game
                props.screenChanger("game");
                props.sendJoinQueue();
            } else {
                props.authenticateWithServer();
                console.log("Sending authentication to server");
                
            }
        }
    }

    return (
        <div className="main__component">
            <div className="main__menu">
                <button onClick={() => handelQueue()}>Play Game</button>    
            </div>
        </div>
      );
}

export default Main;