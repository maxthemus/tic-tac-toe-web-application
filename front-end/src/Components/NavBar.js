//Importing css
import "./component.css";

//Imports

function NavBar(props) {

    const handleButton = (button) => {
        props.screenChanger(button);
    }

    return (
    <div className="nav">
        <div></div>
        <button onClick={() => handleButton("main")}><h1>Tic Tac Toe</h1></button>
        { props.loggedIn ?
            <div className="nav__login">
                <h5>{props.username}</h5>
                <button onClick={() => props.logoutFunc()}>Logout</button>
            </div> : 
            <div className="nav__login">
                <button onClick={() =>handleButton("login")}>Login</button>
                <button onClick={() =>handleButton("signup")}>Signup</button>
            </div>
        }
    </div>
    );
}

export default NavBar;