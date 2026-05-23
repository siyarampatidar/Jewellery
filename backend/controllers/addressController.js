import Address from '../models/Address.js';

/**
 * @desc    Add new address
 * @route   POST /api/users/addresses
 * @access  Private
 */
export const addAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      fullName,
      mobileNumber,
      alternateMobile,
      flatHouse,
      area,
      landmark,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      addressType,
      isDefault,
    } = req.body;

    if (!fullName || !mobileNumber || !flatHouse || !area || !city || !state || !pincode) {
      return res.status(400).json({ success: false, message: 'All required fields must be provided.' });
    }

    // Check if user has any addresses yet
    const addressCount = await Address.countDocuments({ userId });
    
    // If it's the first address, it should automatically be default
    const setAsDefault = addressCount === 0 ? true : !!isDefault;

    if (setAsDefault) {
      // Set all other user addresses to non-default
      await Address.updateMany({ userId }, { isDefault: false });
    }

    const newAddress = new Address({
      userId,
      fullName,
      mobileNumber,
      alternateMobile: alternateMobile || '',
      flatHouse,
      area,
      landmark: landmark || '',
      city,
      state,
      country: country || 'India',
      pincode,
      latitude: latitude || null,
      longitude: longitude || null,
      addressType: addressType || 'Home',
      isDefault: setAsDefault,
    });

    const savedAddress = await newAddress.save();

    res.status(201).json({
      success: true,
      message: 'Address added successfully.',
      address: savedAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user addresses
 * @route   GET /api/users/addresses
 * @access  Private
 */
export const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update address
 * @route   PUT /api/users/addresses/:id
 * @access  Private
 */
export const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;
    
    const {
      fullName,
      mobileNumber,
      alternateMobile,
      flatHouse,
      area,
      landmark,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      addressType,
      isDefault,
    } = req.body;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
    }

    if (isDefault && !address.isDefault) {
      // Set all other user addresses to non-default
      await Address.updateMany({ userId }, { isDefault: false });
      address.isDefault = true;
    } else if (isDefault === false && address.isDefault) {
      // User is trying to unset default. Check if there are other addresses.
      // If there are, we should set another address as default, but standard ecommerce requires at least one default.
      // Let's just keep it default if it's the only one, otherwise keep it default unless they set another.
      const otherAddress = await Address.findOne({ userId, _id: { $ne: addressId } });
      if (otherAddress) {
        otherAddress.isDefault = true;
        await otherAddress.save();
        address.isDefault = false;
      } else {
        // Only one address, must remain default
        address.isDefault = true;
      }
    }

    // Update other fields if provided
    if (fullName) address.fullName = fullName;
    if (mobileNumber) address.mobileNumber = mobileNumber;
    if (alternateMobile !== undefined) address.alternateMobile = alternateMobile;
    if (flatHouse) address.flatHouse = flatHouse;
    if (area) address.area = area;
    if (landmark !== undefined) address.landmark = landmark;
    if (city) address.city = city;
    if (state) address.state = state;
    if (country) address.country = country;
    if (pincode) address.pincode = pincode;
    if (latitude !== undefined) address.latitude = latitude;
    if (longitude !== undefined) address.longitude = longitude;
    if (addressType) address.addressType = addressType;

    const updatedAddress = await address.save();

    res.status(200).json({
      success: true,
      message: 'Address updated successfully.',
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete address
 * @route   DELETE /api/users/addresses/:id
 * @access  Private
 */
export const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
    }

    const wasDefault = address.isDefault;

    await Address.deleteOne({ _id: addressId, userId });

    // If we deleted the default address, set another address as default
    if (wasDefault) {
      const remainingAddress = await Address.findOne({ userId }).sort({ createdAt: -1 });
      if (remainingAddress) {
        remainingAddress.isDefault = true;
        await remainingAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Set address as default
 * @route   PUT /api/users/addresses/:id/default
 * @access  Private
 */
export const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or unauthorized.' });
    }

    // Set all other addresses for this user to isDefault = false
    await Address.updateMany({ userId }, { isDefault: false });

    // Set this one to default
    address.isDefault = true;
    const updatedAddress = await address.save();

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully.',
      address: updatedAddress,
    });
  } catch (error) {
    next(error);
  }
};
