const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supersecret_ecotrack_jwt_key', {
    expiresIn: '30d',
  });
};

class AuthService {
  async registerUser(userData) {
    const { name, email, password, age, country, profilePhoto } = userData;

    // Check if user exists
    const userExists = await userRepository.findOne({ email });
    if (userExists) {
      const err = new Error('User already exists');
      err.statusCode = 400;
      throw err;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      age: age || undefined,
      country: country || 'Global',
      profilePhoto: profilePhoto || undefined,
      points: 100, // starting gift points
    });

    if (!user) {
      const err = new Error('Invalid user data');
      err.statusCode = 400;
      throw err;
    }

    return {
      token: generateToken(user._id),
      user: this._mapUserObject(user)
    };
  }

  async loginUser(email, password) {
    const user = await userRepository.findOne({ email });
    if (!user) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      const err = new Error('Invalid credentials');
      err.statusCode = 401;
      throw err;
    }

    // Update streak / login dates (Daily login bonus)
    let pointsAwarded = 0;
    const todayStr = new Date().toDateString();
    const lastLoginStr = user.lastLoginDate ? user.lastLoginDate.toDateString() : '';

    if (lastLoginStr !== todayStr) {
      user.points += 10;
      pointsAwarded = 10;

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (lastLoginStr === yesterdayStr) {
        user.streak += 1;
      } else {
        user.streak = 1;
      }
      user.lastLoginDate = new Date();
      await userRepository.save(user);
    }

    return {
      token: generateToken(user._id),
      pointsAwarded,
      user: this._mapUserObject(user)
    };
  }

  async googleLogin(googleData) {
    const { name, email, profilePhoto } = googleData;

    let user = await userRepository.findOne({ email });

    if (!user) {
      const generatedPassword = Math.random().toString(36).substring(2, 10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      user = await userRepository.create({
        name,
        email,
        password: hashedPassword,
        profilePhoto: profilePhoto || undefined,
        points: 100,
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
        await userRepository.save(user);
      }
    }

    return {
      token: generateToken(user._id),
      user: this._mapUserObject(user)
    };
  }

  async getProfile(userId) {
    const user = await userRepository.findByIdWithoutPassword(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  async updateProfile(userId, updateData) {
    const user = await userRepository.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    user.name = updateData.name || user.name;
    user.age = updateData.age !== undefined ? updateData.age : user.age;
    user.country = updateData.country || user.country;
    user.profilePhoto = updateData.profilePhoto || user.profilePhoto;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await userRepository.save(user);

    return this._mapUserObject(updatedUser);
  }

  _mapUserObject(user) {
    return {
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
    };
  }
}

module.exports = new AuthService();
