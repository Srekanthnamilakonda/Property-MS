// jshint esversion:6
const express = require("express");
const path = require("path");
const Tenant = require("../models/tenant");
const bcrypt = require("bcrypt");
const router = express.Router();

// Render registration form
function register(req, res) {
    res.render("tenant/register", {
        layout: 'layout', // Use main layout
        viewTitle: "Tenant Registration Form"
    });
}

// Handle tenant registration (create or update)
async function regsub(req, res) {
    try {
        const tenantData = {
            email: req.body.email,
            firstname: req.body.firstname,
            middlename: req.body.middlename,
            lastname: req.body.lastname,
            dob: req.body.dob,
            phonenumber: req.body.phonenumber,
            occupation: req.body.occupation,
            annualincome: req.body.annualincome,
            address: req.body.address
        };

        if (req.body.tenantpassword && req.body.tenantpassword.trim() !== "") {
            tenantData.tenantpassword = await bcrypt.hash(req.body.tenantpassword, 10);
        }

        if (req.body._id && req.body._id.trim() !== "") {
            await Tenant.findByIdAndUpdate(req.body._id, tenantData);
            console.log("Updated tenant:", req.body._id);
        } else {
            const lastTenant = await Tenant.findOne().sort({ tenantid: -1 });
            tenantData.tenantid = lastTenant ? lastTenant.tenantid + 1 : 1110;
            tenantData.tenantpassword = await bcrypt.hash(req.body.tenantpassword, 10);

            const newTenant = new Tenant(tenantData);
            await newTenant.save();
            console.log("Created new tenant:", newTenant);
        }

        res.redirect("/tenant/login/form");
    } catch (err) {
        console.error("Error saving tenant:", err.message || err);
        res.status(500).send("An error occurred while saving the tenant.");
    }
}

// Handle tenant login
async function login(req, res) {
    const { tenantid, password } = req.body;

    try {
        const tenant = await Tenant.findOne({ tenantid });

        if (!tenant) {
            return res.status(404).send("Tenant not found. Please register first.");
        }

        const match = await bcrypt.compare(password, tenant.tenantpassword);

        if (match) {
            req.session.loggedIn = true;
            req.session.tenantId = tenant._id;
            return res.redirect('/tenant/property-registration');
        } else {
            res.status(401).send("Invalid credentials. Please try again.");
        }
    } catch (err) {
        console.error("Error during login:", err.message || err);
        res.status(500).send("An error occurred. Please try again.");
    }
}

// Render login form
function loginGet(req, res) {
    res.render("tenant/login", {
        layout: 'layout', //  Use main layout
        viewTitle: "Tenant Login"
    });
}

module.exports = {
    register,
    regsub,
    login,
    loginGet
};
