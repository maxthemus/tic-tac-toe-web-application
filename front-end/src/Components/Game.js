import React from "react";

function Game(props) {

    const handleTileInput = (index) => {
        //First we check if in game
        if(props.inGame) {
            props.turnMaker(index);
        }
    }

    const tileChacater = (index) => {
        if(props.board === null) {
            return "-";
        } else {
            return props.board[index];
        }
    }

    const gameOverPopup = () => {
        return props.gameOverInfo();
    }

    const otherPlayerInfo = () => {
        if(props.myCharacter === 'X') {
            return `(O) ${props.otherUsername}`;
        } else if(props.myCharacter === 'O') {
            return `(X) ${props.otherUsername}`;
        }
        return `(${props.myCharacter}) ...`
    }

    return (
        <div className="main__component">
            <h3>{props.inGame ? "in game" : "in queue"}</h3>
            <div className="game__main">
                <div className="game__info">
                    <h3>user 1 ({props.myCharacter})</h3>
                </div>
                <div className="game__board">
                    <div className="board___row">
                        <button className="board__tile" onClick={() =>handleTileInput(0)}>{tileChacater(0)}</button>
                        <button className="board__tile" onClick={() =>handleTileInput(1)}>{tileChacater(1)}</button>
                        <button className="board__tile" onClick={() =>handleTileInput(2)}>{tileChacater(2)}</button>
                    </div>
                    <div className="board___row">
                        <button className="board__tile" onClick={() =>handleTileInput(3)}>{tileChacater(3)}</button>
                        <button className="board__tile" onClick={() =>handleTileInput(4)}>{tileChacater(4)}</button>
                        <button className="board__tile" onClick={() =>handleTileInput(5)}>{tileChacater(5)}</button>
                    </div>
                    <div className="board___row">
                        <button className="board__tile" onClick={() =>handleTileInput(6)}>{tileChacater(6)}</button>
                        <button className="board__tile" onClick={() =>handleTileInput(7)}>{tileChacater(7)}</button>
                        <button className="board__tile" onClick={() =>handleTileInput(8)}>{tileChacater(8)}</button>
                    </div>
                </div>
                <div className="game__info">
                    <h3>{otherPlayerInfo()}</h3>
                </div>
            </div>
            
            {
                gameOverPopup()
            }

        </div>
    );
}

export default Game;