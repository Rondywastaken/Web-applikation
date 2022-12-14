// Kalder enviroment
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config()
}

// Konstanter
const express = require("express");
const io = require("socket.io")(3000);
const bcrypt = require("bcrypt");
const passport = require("passport");
const flash = require("express-flash");
const session = require("express-session");
const methodOverride = require("method-override");

const app = express();
const users2 = {};

// tjekker når en bruger er forbundet
io.on("connection", socket => {
    socket.on("new-user", getName => {
        users2[socket.id] = getName;
        socket.broadcast.emit("user-connected", getName);
    });
    socket.on("send-chat-message", message => {
        socket.broadcast.emit("chat-message", { message: message, name: users2[socket.id] });
    });
    socket.on("disconnect", () => {
        socket.broadcast.emit("user-disconnected", users2[socket.id]);
        delete users2[socket.id];
    });
});

// Tjekker for bruger eksistens
const initializePassport = require("./passport-config");
const { name } = require("ejs");
initializePassport(
    passport, 
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
);

const users = [];


// Express app settings
app.set("view-engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/img"));
app.use(flash());

//nøgle der dekrypterer adgangskode
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));


// hovedmenu 
app.get("/", /*checkAuthenticated*/ (req, res) => {
    res.render("index.ejs", { name: req.user.name });
});


// login
app.get("/login", /*checkNotAuthenticated*/ (req, res) => {
    res.render("login.ejs");
});

app.post("/login", /*checkNotAuthenticated*/ passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true

}))

// Registering
app.get("/register", /*checkNotAuthenticated*/ (req, res) => {
    res.render("register.ejs");
});

// Gemmer på bruger og krypterer brugers adgangskode.
app.post("/register", /*checkNotAuthenticated*/ async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        users.push({
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        })
        res.redirect("/login");
    } catch {
        res.redirect("/register");
    }
    console.log(users);
    module.exports = users;
});

// log out
app.delete("/logout", (req, res, next) => {
    req.logOut(function(error) {
        if (error) { return next(error); }
    });
    res.redirect("/login");
});

// checker om du er logget ind
function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect("/login");
}

//checker om du ikke er logget ind
function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/");
    }

    next();
}

// Port
app.listen(5000);


