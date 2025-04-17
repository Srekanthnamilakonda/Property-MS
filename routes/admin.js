//jshint esversion:6
const express = require('express');
const router = express.Router();

const Admin = require('../models/admin');
const Tenant = require('../models/tenant');
const Property = require('../models/property');
const Registration = require('../models/registration');
const Loan = require('../models/loan');
const Testimonial = require('../models/testimonial');
const Transaction = require('../models/transaction');
const Cancellation = require('../models/cancellation');
const nodemailer = require('nodemailer');

// LOGIN
router.get('/login', (req, res) => {
  res.sendFile(__dirname + '/../views/alogin.html');
});
router.post('/login', (req, res) => {
  const { adminid, password } = req.body;
  if (adminid == 9999 && password === 'pass') {
    res.redirect('/admin/home');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// HOME (Dashboard)
router.get('/home', (req, res) => {
  res.render('admin/home', { viewTitle: 'Admin Dashboard' });
});

// MODELS MAPPING
const models = {
  tenant: Tenant,
  property: Property,
  registration: Registration,
  loan: Loan,
  testimonial: Testimonial,
  transaction: Transaction,
  cancellation: Cancellation,
};

const ids = {
  tenant: 6110,
  property: 3110,
  loan: 5110,
  transaction: 7110,
  cancellation: 8110,
};

// ADD + UPDATE FORM ROUTES
Object.keys(models).forEach((key) => {
  const Model = models[key];
  const cap = capitalize(key);

  // Render Add Form
  router.get(`/home/add${key}`, (req, res) => {
    res.render(`admin/${key}`, { viewTitle: `Add ${cap}` });
  });

  // Render Update Form
  router.get(`/home/${key}update/:id`, async (req, res) => {
    const doc = await Model.findById(req.params.id).lean();
    res.render(`admin/${key}`, {
      viewTitle: `Update ${cap}`,
      [key]: doc,
    });
  });

  // List Route
  router.get(`/home/${key}list`, async (req, res) => {
    const list = await Model.find({}).lean();
    res.render(`admin/${key}list`, { list });
  });

  // Delete Route
  router.get(`/home/${key}delete/:id`, async (req, res) => {
    await Model.findByIdAndRemove(req.params.id);
    res.redirect(`/admin/home/${key}list`);
  });

  // Post Submit
  router.post(`/${key}sub`, async (req, res) => {
    const isUpdate = req.body._id && req.body._id.trim() !== '';
    try {
      if (isUpdate) {
        await Model.findByIdAndUpdate(req.body._id, req.body, { new: true });
      } else {
        const instance = new Model(req.body);
        if (ids[key]) {
          instance[`${key}id`] = ++ids[key];
        }
        await instance.save();
      }
      res.redirect(`/admin/home/${key}list`);
    } catch (err) {
      if (err.name === 'ValidationError') {
        handleValidationError(err, req.body);
        res.render(`admin/${key}`, {
          viewTitle: isUpdate ? `Update ${cap}` : `Add ${cap}`,
          [key]: req.body,
        });
      } else {
        console.error(err);
        res.status(500).send('Server Error');
      }
    }
  });
});

// Helper Functions
function handleValidationError(err, body) {
  for (let field in err.errors) {
    body[field + 'Error'] = err.errors[field].message;
  }
}
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// OPTIONAL: Nodemailer setup (if needed for confirmation mails)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'nandupanakanti@gmail.com',
    pass: 'MomDad@123',
  },
});

module.exports = router;
