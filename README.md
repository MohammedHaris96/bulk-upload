🚀 NestJS MongoDB Auto-Seeder App

This is a basic NestJS application that automatically seeds a MongoDB database on startup.

What it does on app start:

🔍 Checks if the database is empty

📦 If empty, inserts ~2 million records

✅ If data already exists, it skips seeding and continues startup normally

This project is mainly intended for testing large datasets, performance tuning, and pagination scenarios.

🚀 Getting Started

npm install

Create a .env file in the project root and add the following variables:

PORT=3000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret_string
JWT_EXPIRATION=1d

Start the Application - npm start
