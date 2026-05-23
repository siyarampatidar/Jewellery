/**
 * Dynamic input validation helper rules
 */

export const validateRegisterInput = (data) => {
  const { name, email, mobile, password, confirmPassword } = data;

  if (!name || name.trim().length < 2) {
    return 'Full Name is required and must be at least 2 characters';
  }

  if (!email || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return 'A valid email address is required';
  }

  if (!mobile || !/^\+?[1-9]\d{1,14}$/.test(mobile.replace(/\s+/g, ''))) {
    return 'Please enter a valid mobile number (with country code if applicable)';
  }

  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};

export const validateLoginInput = (data) => {
  const { identifier, password } = data;

  if (!identifier) {
    return 'Email or Mobile number is required';
  }

  if (!password) {
    return 'Password is required';
  }

  return null;
};

export const validateResetPasswordInput = (data) => {
  const { password, confirmPassword } = data;

  if (!password || password.length < 6) {
    return 'Password must be at least 6 characters long';
  }

  if (password !== confirmPassword) {
    return 'Passwords do not match';
  }

  return null;
};
