// jshint esversion:6
const Tenant = require("../models/tenant");
const bcrypt = require("bcrypt");

// Render registration form
function register(req, res) {
    res.render("tenant/register", {
        viewTitle: "Tenant Registration Form"
    });
}

// Handle registration
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
        console.error("Error during tenant registration:", err.message);
        res.status(500).send("An error occurred during registration.");
    }
}

// Render login page
function loginGet(req, res) {
    const error = req.session.loginError;
    req.session.loginError = null;

    res.render("tenant/login", {
        viewTitle: "Tenant Login",
        error
    });
}

// Export all
module.exports = {
    register,
    regsub,
    loginGet
};
