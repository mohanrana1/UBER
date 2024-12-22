import dotenv from 'dotenv'; // Import dotenv at the top
dotenv.config({ path: './.env' }); // Load environment variables

import http from 'http';
import app from './app.js';
import connectDB from './db/db.js';


// Create HTTP server with Express app
const server = http.createServer(app);


// Set up error handling for the server
server.on("error", (error) => {
  console.error("Server Error: ", error);
  throw error; // You can optionally exit the process here, but throwing an error will also stop the app
});


connectDB()
  .then(() => {
    // Start the server after DB connection is established
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port: ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection failed!', error);
    process.exit(1); // Exit the process if MongoDB connection fails
  });
