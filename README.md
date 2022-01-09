# Restaurant Ordering System
This project simulates a restaurant ordering website, containing three different restaurants to select from, each with different menu options. 

User profiles and order information is saved in a database, along with session data so users can log in, place orders, and view their own orders. Users are also able to view other users profiles, including their order history, if their privacy setting is set to public. Once logged in, users have access to the order form page to browse the different restaurant menus and place an order.

## Languages, Frameworks and Libraries Used
- Javascript
- CSS
- Pug
- MongoDB
- Mongoose
- Node.js
- Express

## Prerequisites
- MongoDB
- Node.js

## Running the Database and Server 
1. With MongoDB installed, start the mongo daemon with mongod --dbpath=a4
2. Install the required dependencies for running the server using the node package manager (npm install)
3. Initialize the database by running the database initializer file (node database-initializer.js)
4. Start the server (node server.js). The server will run at http://localhost:3000/