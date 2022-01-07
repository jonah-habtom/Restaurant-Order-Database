const express = require("express");
const session = require("express-session");
const mongoose = require("mongoose");
const User = require("./models/userModel");
const Order = require("./models/orderModel");
const MongoDBRestaurant = require("connect-mongodb-session")(session);
const app = express();

const restaurant = new MongoDBRestaurant({
    uri: "mongodb://localhost:27017/a4",
    connection: "sessions"
});
restaurant.on("error", (err) => {console.log(err)});

app.set("view engine", "pug");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(session({
    name: "restaurant-session",
    secret: "secret",
    cookie: {maxAge: 1000*60*30},
    store: restaurant
}));

app.get("/", (req,res) => { res.render("home", {session: req.session})});
app.get("/users", getUsers);
app.get("/logout", logout);
app.get("/users/:userID", getUser);
app.get("/orders/:orderID", getOrder);
app.post("/login", login);
app.post("/register", register);
app.post("/orders", addOrder);
app.put("/user", updateUserPrivacy);

//Renders the login page only if the there is not a user currently logged in
app.get("/login", (req,res) => { 
    if (req.session.loggedin) {
        res.status(403).send("You are currently logged in.");
        return;
    }
    res.render("login", {session: req.session})
});

//Renders the user registration page only if a user is not logged in
app.get("/register", (req,res) => { 
    if (req.session.loggedin) {
        res.status(403).send("You are currently logged in. ");
        return;
    }
    res.render("register", {session: req.session})
});

//Renders the order form page only if the user is not logged in
app.get("/orderform", (req,res) => {
    if (!req.session.loggedin) {
        res.status(403).send("You are not currently logged in.");
        return;
    }
    res.render("orderform", {session: req.session})
});

//Function that handles registering a new user
function register(req,res) {
    if (req.session.loggedin) {
        res.status(403).send("You are currently logged in.");
        return;
    }
    let username = req.body.user;
    let password = req.body.pass;
    
    //Sends 400 code if the user does provide a password in the textbox
    if (password == "") {
        res.status(400).send("No password provided.");
        return;
    }

    //Looks for a user with the username entered to make sure there is no duplicates
    User.findOne({username: username}, (err, result) => {
        if (err) {
            res.status(500).send("Error finding user.");
            return;
        }
        //If result is null, no user with that username was found
        if (result == null) {
            //Creates new user
            let newUser = new User();
            newUser.username = username;
            newUser.password = password;
            newUser.privacy = false;

            //Adds new user to the database
            newUser.save((err, result) => {
                if (err) {
                    res.status(500).send("Error saving the new user.");
                }
                //Updates the logged in status for the new user
                req.session.loggedin = true;
                req.session.userId = result._id;
                req.session.username = result.username;
                res.session = req.session;
                res.status(200).send(result._id);
            })
        } else {
            res.status(409).send("That username has already been taken.");
        }
    });
}

//Function that handles a user trying to login
function login(req,res) {
    let username = req.body.user;
    let password = req.body.pass;

    if (req.session.loggedin) {
        res.status(403).send("You are currently logged in.");
        return;
    }

    //Finds the user with the given username and password to log them in
    User.findOne({username: username, password: password}, (err, result) => {
        if (err) {
            res.status(500).send("Error finding user.");
            return;
        }
        //Result is null if no user was found with that username/password
        if (result == null) {
            res.status(404).send("User not found.");
            return;
        }
        //Changes logged in status for the new user
        req.session.loggedin = true;
        req.session.username = result.username;
        req.session.userId = result._id;
        res.session = req.session;
        res.status(200).send(result._id);
    });
}

//Function that handles logging a user out if they are currently logged in
function logout(req,res) {
    if (!req.session.loggedin) {
        res.status(403).send("You are not logged in.");
        return;
    }
    req.session.destroy();
    res.redirect("/");
}

//Function that handles getting the list of non-private users from the database
function getUsers(req,res) {
    //Gets the query for the name of the user
    let name = req.query.name;
    
    //If no name was entered, sets the name to nothing so all users can appear
    if (name == undefined) {
        name = "";
    }

    //Finds the users with the name and that are not private
    User.find({privacy: false, username: {"$regex": name, "$options": "i"}}, (err, result) => {
        if(err) {
            res.send(500).send("Error getting users.");
            return;
        }
        res.render("users", {users: result, session: req.session})
    });
}

//Function that handles getting a specific user based on the user id
function getUser(req, res) {
    let userID = req.params.userID;
    
    //Finds the user with the id
    User.findOne({_id: userID}, (err, result) => {
        if (err) {
            res.status(500).send("Error finding user.");
            return;
        }
        //result is null if no user exists with that id
        if (result == null) {
            res.status(404).send("User does not exist");
            return;
        }
        //Sends 403 error if the user is private and the user is not logged in as the private user
        if (result.privacy == true && result.username != req.session.username) {
            res.status(403).send("User is private. You do not have permission to view this profile.");
            return;
        }
        if (result.privacy == false || req.session.username == result.username) {
            //Gets all the orders made by the user and renders the profile page for the user
            Order.find({username: result.username}, (err1, orders) => {
                if (err1) {
                    res.status(500).send("Error getting orders for the user.");
                    return;
                }
                res.render("profile", {user: result, orders: orders, session: req.session});
            });
        }
    });
}

//Function that handles changes to the privacy for a user
function updateUserPrivacy(req,res) {
    //Finds the user to update the privacy for
    User.findOne({username: req.session.username}, (err, result) => {
        if (err) {
            res.status(500).send("Error finding user.");
            return;
        }
        if (result != null) {
            if (req.body.on == true) {
                result.privacy = true;
            } else {
                result.privacy = false;
            }
            //Save the new privacy setting for the user
            result.save((err1, result) => {
                if (err1) {
                    res.status(500).send("Could not save privacy setting.");
                }
                res.status(200).send();
            })
        } else {
            res.status(404).send("User does not exist");
            return;
        }
    });
}

//Function that handles getting a specific order
function getOrder(req,res) {
    let orderID = req.params.orderID;
    
    //Finds the order based on the given order ID
    Order.findById(orderID, (err, result) => {
        if (err) {
            res.status(500).send("Error finding order.");
            return;
        }
        if (result != null) {
            //Finds the user that made the order
            User.findOne({username: result.username}, (err, user) => {
                if (err) {
                    res.status(500).send("Error finding user.");
                    return;
                }
                if (user != null) {
                    //If the user who made the order is not private or if the user is currently logged in, show the order summary to the user
                    if (result.username == req.session.username || user.privacy == false) {
                        res.render("orderSummary", {session: req.session, order: result});
                    } else {
                        res.status(403).send("Order summary cannot be accessed.");
                    }
                }
            });
        } else {
            res.status(404).send("Order does not exist.");
        }
    })
}

//Function that handles adding a new order to the database
function addOrder(req,res) {
    //Creates a new order and fills out all of its properties
    let newOrder = new Order();
    newOrder.restaurantName = req.body.restaurantName;
    newOrder.username = req.session.username;
    newOrder.items = req.body.order;
    newOrder.subtotal = req.body.subtotal;
    newOrder.tax = req.body.tax;
    newOrder.fee = req.body.fee;
    newOrder.total = req.body.total;

    //Saves the new order to the database
    newOrder.save((err, result) => {
        if (err) {
            res.status(500).send("Could not save the new order.");
        }
        res.status(200).send();
    });
}

mongoose.connect("mongodb://localhost:27017/a4")
let db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to database"));
db.once("open", function() {
    app.listen(3000);
    console.log("Server listening at http://localhost:3000");
});