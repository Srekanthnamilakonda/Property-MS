
const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const Tenant = require('../models/tenant');

router.get('/', (req, res) => {
    res.render('login', { viewTitle: "Login" });
});

router.post('/login', async (req, res) => {
    const { userType, userid, password } = req.body;

    if (userType === 'admin') {
        if (userid == 9999 && password === 'pass') {
            req.session.admin = true;
            return res.redirect('/admin/home');
        } else {
            return res.status(401).send("Invalid admin credentials.");
        }
    }

    if (userType === 'tenant') {
        try {
            const tenant = await Tenant.findOne({ tenantid: userid, tenantpassword: password });
            if (!tenant) return res.status(401).send("Invalid tenant credentials.");
            req.session.loggedIn = true;
            req.session.tenantId = tenant.tenantid;
            return res.redirect('/tenant/dashboard');
        } catch (err) {
            console.error(err);
            return res.status(500).send("Server error");
        }
    }

    res.status(400).send("Invalid user type.");
});

module.exports = router;
