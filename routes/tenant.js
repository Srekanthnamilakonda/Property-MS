//jshint esversion:6
const router = require('express').Router();
const path = require('path');
const tenant = require('../controllers/tenant.controller');
let Registration = require('../models/registration');

// Use different path to serve login form to avoid conflict with POST /login
router.get("/login/form", tenant.loginGet);

// Handle registration
router.post("/register", tenant.register); // Unused? You can remove if not used in frontend
router.post("/regsub", tenant.regsub);

// Handle login submission
router.post("/login", tenant.login);

// Auth middleware for session
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.loggedIn) {
        next();
    } else {
        res.redirect('/tenant/login/form');
    }
};

// Authenticated Property Registration Page
router.get('/property-registration', isAuthenticated, (req, res) => {
    res.render('tenant/propertyregistration', {
        tenantName: req.session.tenantId // Replace if you want to display real name
    });
});

let rid = 4110;
router.post('/registrationsub', (req, res) => {
    console.log("Registration Body:", req.body);

    let registration = new Registration();

    registration.propertyId = req.body.number;
    registration.propertyName = req.body.propertyName;
    registration.address = req.body.address;
    registration.mobile = req.body.mobile; // Should be a single input, or handle array
    registration.alternateMobile = req.body.alternateMobile; // Optional
    registration.email = req.body.email;
    registration.description = req.body.description || ''; // Optional fallback
    registration.registrationDate = Date.now();
    registration.registrationStatus = 'Pending';
    registration.annualIncome = req.body.annualIncome;

    registration.save(function (err) {
        if (!err) {
            console.log("Saved registration to DB");
            res.sendFile(path.join(__dirname, '../routes/successRegistration.html'));
        } else {
            console.log('Error during record insertion : ' + err);
            res.status(500).send("Error saving registration details.");
        }
    });
});

module.exports = router;
