import jwt from 'jsonwebtoken';

const generateToken = (userId, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn,
  });
};

export default generateToken;
