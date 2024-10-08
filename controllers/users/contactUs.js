const { contactUsMail } = require("../../lib/helper");

const contactUsEmail = async (req, res, next) => {
  try {
    const { name, email, phoneNumber, message } = req.body;

    // Validate input data
    if (!name || !email || !phoneNumber || !message) {
      return res.status(400).json({ error: 'All fields (name, email, phone number, message) are required.' });
    }

    // Call the helper function to send the email
    await contactUsMail(name, email, phoneNumber, message);

    // Respond with success
    return res.status(200).json({ success: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Error sending contact us email:', error);
    
    // Handle error and pass it to the next middleware (if applicable)
    return res.status(500).json({ error: 'An error occurred while sending your message. Please try again later.' });
  }
};

module.exports = {
    contactUsEmail
};
