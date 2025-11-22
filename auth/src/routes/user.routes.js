const express = require('express');

const router = express.Router();

//middleware and controllers would be imported here
const { 
    registerController ,
    loginController , 
    getCurrentUserController , 
    logOutUserController ,
    
} = require('../controller/auth.controller');

const {
    addUserAddressController,
    getUserAddressController,
    updateUserAddressController,
    deleteUserAddressController 

} = require("../controller/address.controller")

const validator = require('../middleware/validator.middleware');
const authMiddleware = require('../middleware/auth.middleware');

// Define user-related routes here **********************************************************************

// POST /api/auth/register
router.post('/register' , validator.registerUserValidator , registerController);

// POST /api/auth/login
router.post('/login' , validator.loginUserValidator , loginController);

// GET /api/auth/me
router.get('/me' , authMiddleware , getCurrentUserController);

// GET /api/auth/logout
router.get("/logout" , logOutUserController )


// ADRESS Related routes here **********************************************************************************

//POST /api/auth/users/me/addresses
router.post("/users/me/addresses" , validator.addUserAddressValidations ,  authMiddleware , addUserAddressController )

//GET /api/auth/users/me/addresses
router.get('/users/me/addresses' , authMiddleware , getUserAddressController )

//PATCH /api/auth/users/me/addresses/:addressId
router.patch('/users/me/addresses/:addressId' , authMiddleware , updateUserAddressController )

//DELETE /api/auth/users/me/addresses/:addressId
router.delete("/users/me/addresses/:addressId" , authMiddleware , deleteUserAddressController )




module.exports = router;