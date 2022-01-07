COMP 2406 Assignment 4
Program Author: Jonah Habtom

Favicon Source: https://www.pngall.com/restaurant-png/download/65831

How to Run Sever: 
-Navigate to the assignment4 directory
-Create a folder/directory named a4
-Start the mongo daemon with mongod --dbpath=a4
-In the terminal, type npm install to install the required dependencies for the server
-In the terminal, run the database initializer by typing node database-initializer.js
-To start the server, type node server.js
-In a web browser, type in http://localhost:3000/ to access the home page

Notable Design Decisions:
-Created a new collection inside the database called orders. This will hold all the orders made by users. Each order will have a mongo generated id, a username corresponding to the user who made the order, the name of the restaurant ordered from, an object of items and the quantities ordered, and the subtotal, tax, delivery fee, and total for the order.
-Created two schemas, a User schema and a Order schema. These made it easier to search the database for users and orders and also made it easier to add separate users when a new user registers and add a new order when a user makes one.
-Created a new client file to handle sending requests for registering a new user, logging in a user, and updating the user's privacy setting. All redirects are done in the client when a repsonse is received, other than the redirect when the user logouts out, which is done server side.
"# Restaurant_Order_Database" 
