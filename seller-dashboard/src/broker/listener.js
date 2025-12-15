const { subscribeToQueue } = require("./broker");
const userModel = require("../models/user.model");

module.exports = async function () {

  // subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
  //   console.log("QUEUE DATA =>", data);

  //   await userModel.create({
  //     authUserId: data.id, // IMPORTANT (microservices ref)
  //     username: data.username,
  //     email: data.email,
  //     role: data.role,
  //     address: data.address,
  //     fullName: {
  //       firstName: data.fullName?.firstName,
  //       lastName: data.fullName?.lastName,
  //     },
  //   });
  // });

     subscribeToQueue("AUTH_SELLER_DASHBOARD.USER_CREATED", async (user) => {
        await userModel.create(user)
    })


};
