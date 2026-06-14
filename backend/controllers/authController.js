const authService = require('../services/authService');
const asyncHandler = require('../middleware/asyncHandler');
const { registerSchema, loginSchema, googleLoginSchema } = require('../validators/authValidator');
const { HTTP_STATUS } = require('../config/constants');

/**
 * Register User
 * POST /api/auth/register
 */
const registerUser = asyncHandler(async (req, res) => {
  // Validate request body
  const validatedData = registerSchema.parse(req.body);

  const result = await authService.registerUser(validatedData);
  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    ...result
  });
});

/**
 * Login User
 * POST /api/auth/login
 */
const loginUser = asyncHandler(async (req, res) => {
  // Validate request body
  const { email, password } = loginSchema.parse(req.body);

  const result = await authService.loginUser(email, password);
  res.json({
    success: true,
    ...result
  });
});

/**
 * Google Login Simulation
 * POST /api/auth/google
 */
const googleLogin = asyncHandler(async (req, res) => {
  // Validate request body
  const validatedData = googleLoginSchema.parse(req.body);

  const result = await authService.googleLogin(validatedData);
  res.json({
    success: true,
    ...result
  });
});

/**
 * Get Profile
 * GET /api/auth/profile
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await authService.getProfile(req.user.id);
  res.json({
    success: true,
    user
  });
});

/**
 * Update Profile
 * PUT /api/auth/profile
 */
const updateProfile = asyncHandler(async (req, res) => {
  const updatedUser = await authService.updateProfile(req.user.id, req.body);
  res.json({
    success: true,
    user: updatedUser
  });
});

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  getProfile,
  updateProfile
};
