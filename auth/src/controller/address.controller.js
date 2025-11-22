// Import user model
const userModel = require("../model/user.model");

// Get user Address ******************************************************************************************

const getUserAddressController = async (req, res) => {
  try {
    const id = req.user.userId;

    const user = await userModel.findById(id).select("address");

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    return res.status(200).json({
      message: "User addresses fetched successfully",
      address: user.address,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Add user Address ******************************************************************************************

const addUserAddressController = async (req, res) => {
  try {
    const id = req.user.userId;

    const { street, city, state, zip, phone, country, isDefault } = req.body;

    const user = await userModel.findByIdAndUpdate(
      { _id: id },
      {
        $push: {
          address: {
            street,
            city,
            state,
            zip,
            phone,
            country,
            isDefault,
          },
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        message: "User Not Found",
      });
    }

    const addedAddress = user.address[user.address.length - 1];

    return res.status(200).json({
      message: "User address added successfully",
      address: addedAddress,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};


// Update User Address ******************************************************************************************

const updateUserAddressController = async (req, res) => {
  const id = req.user.userId;
  const addressId = req.params.addressId;

  const { street, city, state, pincode, country, phone, isDefault } = req.body;

  try {
    const updatedUser = await userModel.findOneAndUpdate(
      { _id: id, "address._id": addressId },
      {
        $set: {
          "address.$.street": street,
          "address.$.city": city,
          "address.$.state": state,
          "address.$.pincode": pincode,
          "address.$.country": country,
          "address.$.phone": phone,
          "address.$.isDefault": isDefault,
        },
      },
      { new: true }
    );


    if (!updatedUser) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      address: updatedUser.address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete user Address ******************************************************************************************

const deleteUserAddressController = async (req, res) => {
  try {
    const id = req.user.userId;
    const addressId = req.params.addressId;

    const user = await userModel.findByIdAndUpdate(
      id ,
      {
        $pull: { address: { _id: addressId } } // remove specific address
      },
      { new: true } // return updated user
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Address deleted successfully",
      addresses: user.address
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
};



module.exports = {
  getUserAddressController,
  addUserAddressController,
  updateUserAddressController,
  deleteUserAddressController
};
