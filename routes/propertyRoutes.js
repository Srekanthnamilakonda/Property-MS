const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// POST /property/register
router.post('/register', async (req, res) => {
  try {
    const {
      propertyName,
      number: propertyId, // Change the field name to match the form input
      address,
      mobile,
      alternateMobile,
      email,
      description,
    } = req.body;

    // Create a new property instance
    const newProperty = new Property({
      propertyName,
      propertyId,
      address,
      mobile,
      alternateMobile,
      email,
      description,
    });

    // Save the property in the database
    const savedProperty = await newProperty.save();
    res.status(201).json({
      message: 'Property registered successfully!',
      data: savedProperty,
    });
  } catch (error) {
    console.error('Error saving property:', error.message);
    res.status(500).json({
      message: 'Failed to register property',
      error: error.message,
    });
  }
});

module.exports = router;
