const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../User/User'); // Assuming User model is in User/User.js

const client = new OAuth2Client('451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com');

const googleAuth = async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: '451475688741-f88vp91ttocl4of0lv8ja22m7d9ttqip.apps.googleusercontent.com',
    });
    const { name, email, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        name,
        email,
        profilePicture: picture,
        googleId: ticket.getUserId(),
        // Add any other default fields you need for a new user
      });
      await user.save();
    }

    // Generate a JWT for the user session
    const sessionToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({
      message: 'Authentication successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePicture: user.profilePicture,
      },
      token: sessionToken,
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};

module.exports = googleAuth;
