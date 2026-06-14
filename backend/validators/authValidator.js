const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email format').max(100, 'Email is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
  age: z.number().int().min(1).max(120).optional(),
  country: z.string().max(100).optional(),
  profilePhoto: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required')
});

const googleLoginSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  profilePhoto: z.string().optional()
});

module.exports = {
  registerSchema,
  loginSchema,
  googleLoginSchema
};
