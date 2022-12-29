//Run time vars
const PORT = 4001;
//TEMP vars
let users = [];
let nextId = 1;


const express = require("express"); //Importing express to project

const app = express();
app.use(express.json());

//End points
app.post("/db/users/create", (req,res) => {
    if("username" in req.body && "password" in req.body) { 
        //Payload is correct
        let userExists = false;
        for(let i in users) {
            if(users[i].username === req.body.username) {
                userExists = true;
                break;
            }
        }

        if(userExists ) {
            res.send({
                message: "user already exists",
                userCreated: false
            });
        } else {
            let tempUser = {userId:nextId++, username:req.body.username, password:req.body.password};
            users.push(tempUser);

            res.send({
                message:" user created!",
                userCreated: true,
                userId: tempUser.userId
            });
        }
    } else {
        //Incorrect paylaod
        res.send({
            message:"Invalid payload!",
            userCreated: false
        });
    }
});

app.get("/db/users/userId/:id", (req,res) => {
    console.log(users);
    let userExists = -1;
    for(let i in users) {
        if(parseInt(users[i].userId) === parseInt(req.params.id)) {
            userExists = i;
            break;
        }
    }

    if(userExists === -1) {
        //User doesn't exist
        res.send({
            message: "Invalid user",
            validUser: false
        });
    } else {
        res.send({
            message: "User found",
            validUser: true,
            userInfo: users[userExists]
        });
    }
});

app.get("/db/users/username/:username", (req,res) => {
    let userExists = -1;
    for(let i in users) {
        if(users[i].username === req.params.username) {
            userExists = i;
            break;
        }
    }

    if(userExists === -1) {
        //User doesn't exist
        res.send({
            message: "Invalid user",
            validUser: false
        });
    } else {
        res.send({
            message: "User found",
            validUser: true,
            userInfo: users[userExists]
        });
    }
});


app.listen(PORT, () => {
    console.log("Database service has started! on port " + PORT);
});

//Functions
