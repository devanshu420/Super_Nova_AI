require('dotenv').config();
const app = require("./src/app")
const connectDB = require('./src/db/db');
const {connect} = require("./src/broker/broker")

// Only connect to the real DB and start the server when not running tests
if (process.env.NODE_ENV !== 'test') {
	// Connect to the database
	connectDB(); 
	connect();   

	app.listen(3003, () => {
	  console.log('Server is running on port 3003');
	});
}