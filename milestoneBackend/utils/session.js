// utils/session.js
// getUser reads an Authorization header token and returns a user object.
// In the real system, this should validate tokens from Sessions table.
module.exports.getUser = async function(req) {
  try {
    const auth = req.headers['authorization'] || '';
    // Format: "Bearer <token>"
    const parts = auth.split(' ');
    const token = parts.length === 2 ? parts[1] : null;
    // For the template, accept token 'test-truckowner' or 'test-customer'
    if (!token) return null;
    if (token === 'test-truckowner') {
      return {
        id: 1,
        userId: 10,
        token: token,
        expiresAt: new Date(),
        name: 'Test TruckOwner',
        birthDate: null,
        email: 'owner@example.com',
        password: 'hashed',
        role: 'truckOwner',
        truckId: 5
      };
    }
    if (token === 'test-customer') {
      return {
        id: 2,
        userId: 3,
        token: token,
        expiresAt: new Date(),
        name: 'Test Customer',
        birthDate: null,
        email: 'customer@example.com',
        password: 'hashed',
        role: 'customer',
        truckId: null
      };
    }
    return null;
  } catch (err) {
    return null;
  }
};
