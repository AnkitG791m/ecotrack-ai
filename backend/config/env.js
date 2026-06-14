const { cleanEnv, str, port } = require('envalid');
const dotenv = require('dotenv');

// Load environment variables manually first in case it's run standalone
dotenv.config();

const env = cleanEnv(process.env, {
  PORT: port({ default: 5000 }),
  MONGODB_URI: str({ default: 'mongodb://localhost:27017/ecotrack' }),
  JWT_SECRET: str({ default: 'supersecret_ecotrack_jwt_key' }),
  GEMINI_API_KEY: str({ default: '' }),
  NODE_ENV: str({ choices: ['development', 'test', 'production'], default: 'development' }),
  FRONTEND_URL: str({ default: '' }),
  ALLOWED_ORIGINS: str({ default: '' })
});

module.exports = env;
