const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_ecotrack_jwt_key', {
    expiresIn: '30d',
  });
};

/**
 * Register User
 * POST /api/auth/register
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password, age, country, profilePhoto } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please add all required fields' });
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email' });
    }

    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age: age || undefined,
      country: country || 'Global',
      profilePhoto: profilePhoto || undefined,
      points: 100, // starting gift points for profile creation!
    });

    if (user) {
      res.status(201).json({
        success: true,
        token: generateToken(user._id),
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          age: user.age,
          country: user.country,
          profilePhoto: user.profilePhoto,
          role: user.role,
          points: user.points,
          streak: user.streak,
          badges: user.badges,
          completedChallengesCount: user.completedChallengesCount,
          carbonSaved: user.carbonSaved
        }
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Login User
 * POST /api/auth/login
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    // Check for user email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update streak / login dates (Daily login bonus)
    let pointsAwarded = 0;
    const todayStr = new Date().toDateString();
    const lastLoginStr = user.lastLoginDate ? user.lastLoginDate.toDateString() : '';

    if (lastLoginStr !== todayStr) {
      // It's a new day! Award +10 login points
      user.points += 10;
      pointsAwarded = 10;

      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastLoginStr === yesterdayStr) {
        user.streak += 1;
      } else if (lastLoginStr !== todayStr) {
        user.streak = 1;
      }
      user.lastLoginDate = new Date();
      await user.save();
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      pointsAwarded,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        country: user.country,
        profilePhoto: user.profilePhoto,
        role: user.role,
        points: user.points,
        streak: user.streak,
        badges: user.badges,
        completedChallengesCount: user.completedChallengesCount,
        carbonSaved: user.carbonSaved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Google Login Simulation
 * POST /api/auth/google
 */
const googleLogin = async (req, res) => {
  try {
    const { name, email, profilePhoto } = req.body;

    if (!email || !name) {
      return res.status(400).json({ success: false, message: 'Google authentication details missing' });
    }

    let user = await User.findOne({ email });

    // If user does not exist, create a new one with a random password
    if (!user) {
      const generatedPassword = Math.random().toString(36).substring(2, 10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      user = await User.create({
        name,
        email,
        password: hashedPassword,
        profilePhoto: profilePhoto || undefined,
        points: 100, // registration reward
        lastLoginDate: new Date(),
        streak: 1
      });
    } else {
      // Award login bonus if new day
      const todayStr = new Date().toDateString();
      const lastLoginStr = user.lastLoginDate ? user.lastLoginDate.toDateString() : '';

      if (lastLoginStr !== todayStr) {
        user.points += 10;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();

        if (lastLoginStr === yesterdayStr) {
          user.streak += 1;
        } else {
          user.streak = 1;
        }
        user.lastLoginDate = new Date();
        await user.save();
      }
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        country: user.country,
        profilePhoto: user.profilePhoto,
        role: user.role,
        points: user.points,
        streak: user.streak,
        badges: user.badges,
        completedChallengesCount: user.completedChallengesCount,
        carbonSaved: user.carbonSaved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Get Profile
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = req.body.name || user.name;
    user.age = req.body.age !== undefined ? req.body.age : user.age;
    user.country = req.body.country || user.country;
    user.profilePhoto = req.body.profilePhoto || user.profilePhoto;

    // Check if passwords need update
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      success: true,
      user: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        age: updatedUser.age,
        country: updatedUser.country,
        profilePhoto: updatedUser.profilePhoto,
        role: updatedUser.role,
        points: updatedUser.points,
        streak: updatedUser.streak,
        badges: updatedUser.badges,
        completedChallengesCount: updatedUser.completedChallengesCount,
        carbonSaved: updatedUser.carbonSaved
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile
};
