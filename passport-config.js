const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, GetUserByEmail, getUserById) {
    // Validirer brugeren
    const authenticateUser = async (email, password, done) => {
        const user = GetUserByEmail(email);
        // Tjekker om der er en bruger med følgende email
        if (user == null) {
            return done(null, false, { message: "No user with that email was found!" });
        } 

        // Tjekker adgangskode
        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: "Incorrect password!"});
            }
        } catch(e) {
            return done(e);
        }

    }

    passport.use(new LocalStrategy({ usernameField: "email" }, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser((id, done) => { return done(null, getUserById(id)) });
};

module.exports = initialize;