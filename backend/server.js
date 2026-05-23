import 'dotenv/config';
import app from './app.js';
import connectDB from './config/db.js';

// Connect database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `\x1b[35m%s\x1b[0m`,
    `🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
  );
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`\x1b[31m%s\x1b[0m`, `✖ Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
