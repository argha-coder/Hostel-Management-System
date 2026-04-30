import jwt from 'jsonwebtoken';

export const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction, 
    sameSite: isProduction ? 'none' : 'lax', 
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};
