// jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// MongoDB connection
mongoose.connect(process.env.DB_PATH, {
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(() => console.log("MongoDatabase Connected Successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

const session = require('express-session');
app.use(session({
    secret: 'yourSecretKey',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// View engine setup (final, cleaned)
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'layout',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    helpers: {
        eq: function (a, b) {
            return a === b;
        }
    }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get("/", (req, res) => {
    res.render("admin/home");
});

let admin = require('./routes/admin');
let tenant = require('./routes/tenant');
app.use('/admin', admin);
app.use('/tenant', tenant);

// Start server
app.listen(3000, () => {
    console.log("Server started on port 3000.");
});
