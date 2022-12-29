import React, { useState } from "react";
import "./component.css";

function Login(props) {
    const [usernameInput, setusernameInput] = useState("");
    const [passwordInput, setpasswordInput] = useState("");
    
    const handleLogin = () => {
        if(usernameInput.length !== "" && passwordInput.length !== "") {
            props.loginFunc(usernameInput, passwordInput, loginData);
        }   
    }

    const loginData = (data) => {
        if(data.loggedIn) {
            props.screenChanger("main");
        }
    }

    return (
        <div className="main__component">
            <h3>Login</h3>
            <div className="main__login">
                <h3>Username</h3>
                <input onChange={(e) => setusernameInput(e.target.value)}/>
                <h3>Password</h3>
                <input onChange={(e) => setpasswordInput(e.target.value)}/>
                <button onClick={handleLogin}>Login</button>
            </div>
        </div>
    );
}

export default Login;