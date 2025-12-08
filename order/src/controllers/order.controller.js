const { default: axios } = require("axios");
const orderModel = require("../models/order.model")


async function createOrder(req , res) {

    const user = req.user; 
    const token = req.cookies?.token || req.headers?.authorization?.split(' ')[1];


        try {
            
            const cartResponse = await axios.get(`http://localhost:3002/api/cart` , {
                headers : {
                    Authorization : `Bearer ${token}`
                }
            });




        } catch (error) {
        
            res.status(500).json({
                message : "Internal Server Error " , error : error.message
            })
            
        }

}


module.exports = {
    createOrder
} 