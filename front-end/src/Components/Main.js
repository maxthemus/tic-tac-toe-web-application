import React from "react";

function Main(props) {

    const joinQueue = () => {
        if(!props.loggedIn) {
            props.screenChanger("login");
        }
    }

    return (
        <div className="main__component">
            <div className="main__menu">
                <button onClick={() => joinQueue()}>Play Game</button>    
            </div>
        </div>
      );
}

export default Main;