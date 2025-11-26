require('dotenv').config();
const app = require('./src/app')
const connectDB = require('./src/db/db');

// Only connect to the real DB and start the server when not running tests
if (process.env.NODE_ENV !== 'test') {
	// Connect to the database
	connectDB();    

	app.listen(3001, () => {
	  console.log('Product Server is running on port 3001');
	});
}


module.exports = app;