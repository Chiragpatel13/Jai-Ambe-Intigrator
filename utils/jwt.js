import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_jwt_key_jai_ambe_integrator_2026_change_me';

/**
 * Sign a JWT token for the admin session
 * @param {Object} payload - Session payload (e.g. { id, username })
 * @returns {string} - Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });
}

/**
 * Verify a JWT token
 * @param {string} token - The token to verify
 * @returns {Object|null} - Decoded payload or null if invalid
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
