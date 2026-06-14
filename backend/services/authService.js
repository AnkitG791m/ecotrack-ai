const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const ValidationError = require('../utils/errors/ValidationError');
const AuthError = require('../utils/errors/AuthError');
const NotFoundError = require('../utils/errors/NotFoundError');
const UserDTO = require('../dto/UserDTO');

class AuthService {
  constructor(userRepository, logger) {
    this.userRepository = userRepository;
    this.logger = logger;
  }

  _generateToken(id) {
    return jwt.sign({ id }, env.JWT_SECRET, {
      expiresIn: '30d',
    });
  }

  async registerUser(userData) {
    const { name, email, password, age, country, profilePhoto } = userData;

    // Check if user exists
    const userExists = await this.userRepository.findOne({ email });
    if (userExists) {
      throw new ValidationError('User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await this.userRepository.create({
      name,
      email,
      password: hashedPassword,
      age: age || undefined,
      country: country || 'Global',
      profilePhoto: profilePhoto || undefined,
      points: 100, // starting gift points
    });

    if (!user) {
      throw new ValidationError('Invalid user data');
    }

    this.logger.info(`User registered: ${email}`);

    return {
      token: this._generateToken(user._id),
      user: UserDTO.fromEntity(user)
    };
  }

  async loginUser(email, password) {
    const user = await this.userRepository.findOne({ email });
    if (!user) {
      throw new AuthError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AuthError('Invalid credentials');
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
      await this.userRepository.save(user);
    }

    this.logger.info(`User logged in: ${email}`);

    return {
      token: this._generateToken(user._id),
      pointsAwarded,
      user: UserDTO.fromEntity(user)
    };
  }

  async googleLogin(googleData) {
    const { name, email, profilePhoto } = googleData;

    let user = await this.userRepository.findOne({ email });

    if (!user) {
      const generatedPassword = Math.random().toString(36).substring(2, 10);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(generatedPassword, salt);

      user = await this.userRepository.create({
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
        await this.userRepository.save(user);
      }
    }

    this.logger.info(`Google login simulation successful for: ${email}`);

    return {
      token: this._generateToken(user._id),
      user: UserDTO.fromEntity(user)
    };
  }

  async getProfile(userId) {
    const user = await this.userRepository.findByIdWithoutPassword(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return UserDTO.fromEntity(user);
  }

  async updateProfile(userId, updateData) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.name = updateData.name || user.name;
    user.age = updateData.age !== undefined ? updateData.age : user.age;
    user.country = updateData.country || user.country;
    user.profilePhoto = updateData.profilePhoto || user.profilePhoto;

    if (updateData.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(updateData.password, salt);
    }

    const updatedUser = await this.userRepository.save(user);

    this.logger.info(`User profile updated for: ${user.email}`);

    return UserDTO.fromEntity(updatedUser);
  }
}

// Dependency Injection Composition
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

module.exports = new AuthService(userRepository, logger);
// Export class also for testing injection overrides if needed
module.exports.AuthService = AuthService;
