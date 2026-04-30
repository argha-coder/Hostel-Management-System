import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: false, // Set to false for local development
    sameSite: 'lax', // Changed from strict to lax for better cross-origin compatibility
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};
