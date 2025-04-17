// jshint esversion:6
const express = require('express');
const router = express.Router();
const path = require('path');
const tenant = require('../controllers/tenant.controller');
const Registration = require('../models/registration');
const Tenant = require('../models/tenant');

// Serve tenant login form
router.get("/login/form", tenant.loginGet);

// Register a new tenant (optional route if you support sign-up)
router.post("/register", tenant.register);
router.post("/regsub", tenant.regsub);

// Handle login
router.post("/login", async (req, res) => {
    const { tenantid, tenantpassword } = req.body;
    try {
        const user = await Tenant.findOne({ tenantid, tenantpassword });
        if (!user) {
            return res.status(401).send("Invalid credentials");
        }

        req.session.loggedIn = true;
        req.session.tenantId = user.tenantid;
        req.session.tenantName = user.tenantname;
        res.redirect("/tenant/dashboard");
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).send("Server error");
    }
});

// Middleware to check session auth
function isAuthenticated(req, res, next) {
    if (req.session && req.session.loggedIn) {
        next();
    } else {
        res.redirect('/tenant/login/form');
    }
}

// Tenant dashboard (protected)
router.get('/dashboard', isAuthenticated, async (req, res) => {
    const tenantName = req.session.tenantName || '';
    const properties = []; // Optional: fetch registered properties later if stored
    res.render('tenant/dashboard', { tenant: { name: tenantName }, properties });
});

// Property registration form (protected)
router.get('/property-registration', isAuthenticated, (req, res) => {
    res.render('tenant/propertyregistration', {
        tenantName: req.session.tenantName
    });
});

// Optional: Fix broken link for /property/register
router.get('/property/register', isAuthenticated, (req, res) => {
    res.redirect('/tenant/property-registration');
});

// Handle property registration form submission
let rid = 4110;
router.post('/registrationsub', (req, res) => {
    let registration = new Registration();

    registration.propertyId = req.body.number;
    registration.propertyName = req.body.propertyName;
    registration.address = req.body.address;
    registration.mobile = req.body.mobile;
    registration.alternateMobile = req.body.alternateMobile || '';
    registration.email = req.body.email;
    registration.description = req.body.description || '';
    registration.registrationDate = Date.now();
    registration.registrationStatus = 'Pending';
    registration.annualIncome = req.body.annualIncome;

    registration.save(err => {
        if (!err) {
            res.sendFile(path.join(__dirname, '../routes/successRegistration.html'));
        } else {
            console.error('Error inserting registration:', err);
            res.status(500).send("Error saving registration.");
        }
    });
});

module.exports = router;
