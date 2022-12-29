import React, { useState } from "react";

function Signup(props) {
    const [usernameInput, setusernameInput] = useState("");
    const [passwordInput, setpasswordInput] = useState("");
    const [passwordMatch, setpasswordMatch] = useState("");

    const handleSignup = () => {
        if(usernameInput !== "" && passwordInput !== "") {
            if(passwordMatch === passwordInput) {
                props.signupFunc(usernameInput, passwordInput);
            } //Else we want to alert that passwords don't match
        }
    };

    return ( 
        <div className="main__component">
            <h3>Sign up</h3>
            <div className="main__signup">
                <h3>Username</h3>
                <input onChange={(e) => setusernameInput(e.target.value)} />
                <h3>Password</h3>
                <input onChange={(e) => setpasswordInput(e.target.value)} /> 
                <h3>Re-type password</h3>
                <input onChange={(e) => setpasswordMatch(e.target.value)} />
                <button onClick={() => handleSignup()}>Sign up</button>
            </div>
        </div>
    );
}

export default Signup;