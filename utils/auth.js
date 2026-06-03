import { cookies } from 'next/headers';
import { verifyToken } from './jwt';

/**
 * Helper to verify if the current request session is an authenticated admin
 * @returns {Promise<Object|null>} Decoded JWT payload if valid, null otherwise
 */
export async function verifyAdminSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch (error) {
    console.error('Session verify helper error:', error);
    return null;
  }
}
