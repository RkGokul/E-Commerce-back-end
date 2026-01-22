const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

// @route   POST /api/contact
// @desc    Create a new contact message
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields (name, email, subject, message)',
      });
    }

    // Create new contact document
    const contact = new Contact({
      name,
      email,
      phone: phone || '',
      subject,
      message,
    });

    // Save to database
    await contact.save();

    console.log('Backend: New contact message saved - ID:', contact._id, 'From:', email);

    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you soon!',
      data: contact,
    });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting your message. Please try again.',
      error: error.message,
    });
  }
});

// @route   GET /api/contact
// @desc    Get all contact messages (admin only)
// @access  Private
router.get('/', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: contacts.length,
      data: contacts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   GET /api/contact/:id
// @desc    Get single contact message
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      data: contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

// @route   PUT /api/contact/:id
// @desc    Update contact message status
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['new', 'read', 'replied'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid status (new, read, replied)',
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found',
      });
    }

    res.json({
      success: true,
      message: 'Contact status updated',
      data: contact,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
});

module.exports = router;
