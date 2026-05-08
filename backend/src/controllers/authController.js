import User from '../models/User.js';
import OTP from '../models/OTP.js';
import Room from '../models/Room.js';
import { generateToken } from '../utils/generateToken.js';
import { sendOTP, sendResetEmail } from '../utils/email.js';
import crypto from 'crypto';

// Utility to generate a 6-digit OTP
const generate6DigitOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// @desc    Register new user & request OTP
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  try {


    const userExists = await User.findOne({ email });

    if (userExists) {
      if (userExists.isVerified) {
        return res.status(400).json({ message: 'User already exists' });
      } else {
        // User exists but not verified, allow re-requesting OTP
        // We will just process an OTP down below
      }
    }

    // Generate OTP
    const otpValue = generate6DigitOTP();

    // Store/Update OTP in database and send email in parallel
    console.log(`Storing OTP ${otpValue} for ${email}`);
    await Promise.all([
      OTP.findOneAndUpdate({ email }, { otp: otpValue }, { upsert: true, new: true }),
      sendOTP(email, otpValue)
    ]);

    // Provide generic success for security
    res.status(200).json({
      message: 'OTP sent to email',
      email,
      name,
    });
  } catch (error) {
    console.error(`Registration error for ${email}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Registration OTP and Create User
// @route   POST /api/auth/verify-register
// @access  Public
export const verifyRegisterOTP = async (req, res) => {
  const { name, email, password, otp } = req.body;

  try {
    console.log(`Received verify-register request for: ${email} with OTP: ${otp}`);
    const [otpRecord, userExists] = await Promise.all([
      OTP.findOne({ email, otp }),
      User.findOne({ email })
    ]);

    if (!otpRecord) {
      console.log('OTP Record not found for:', email, 'with OTP:', otp);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // OTP is valid
    let user = userExists;

    if (user && user.isVerified) {
       return res.status(400).json({ message: 'User already registered and verified' });
    }

    if (!user) {
      user = await User.create({ name, email, password, isVerified: true });
    } else {
      user.password = password;
      user.isVerified = true;
      await user.save();
    }

    generateToken(res, user._id);

    // Delete the OTP record (don't await to speed up response)
    console.log('OTP verified successfully for:', email);
    OTP.deleteOne({ _id: otpRecord._id }).catch(err => console.error('Failed to delete OTP:', err));

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    console.error(`OTP verification error for ${email}:`, error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get OTP (Login step 1)
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {


    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      // Admin Bypass: Allow all Admin users to skip OTP for immediate access
      if (user.role === 'Admin') {
        generateToken(res, user._id);
        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          message: 'Admin login successful'
        });
      }

      // Check if student user is verified
      if (user.role === 'Student' && !user.isVerified) {
        return res.status(403).json({ message: 'Your account is not verified. Please contact the administrator.' });
      }

      // Valid credentials, generate OTP for 2FA
      const otpValue = generate6DigitOTP();

      // Store/Update OTP in database and send email in parallel
      console.log(`Storing OTP ${otpValue} for ${email}`);
      await Promise.all([
        OTP.findOneAndUpdate({ email }, { otp: otpValue }, { upsert: true, new: true }),
        sendOTP(email, otpValue)
      ]);

      res.status(200).json({
        message: 'OTP sent to email',
        email,
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify Login OTP (Login step 2)
// @route   POST /api/auth/verify-login
// @access  Public
export const verifyLoginOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    console.log(`Received verify-login request for: ${email} with OTP: ${otp}`);
    const [otpRecord, user] = await Promise.all([
      OTP.findOne({ email, otp }),
      User.findOne({ email })
    ]);

    if (!otpRecord) {
      console.log('OTP Record not found for:', email, 'with OTP:', otp);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'Student' && !user.isVerified) {
      return res.status(403).json({ message: 'Your account is not verified. Please contact the administrator.' });
    }

    generateToken(res, user._id);
    
    // Delete the OTP record (don't await to speed up response)
    console.log('OTP verified successfully for:', email);
    OTP.deleteOne({ _id: otpRecord._id }).catch(err => console.error('Failed to delete OTP:', err));

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';
  res.cookie('jwt', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    expires: new Date(0),
  });

  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('room_id');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (Students)
// @route   GET /api/auth/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const search = req.query.search || '';
    const query = { role: 'Student' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .populate('room_id', 'room_number')
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user role or verification status
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;
      user.isVerified = req.body.isVerified !== undefined ? req.body.isVerified : user.isVerified;

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (user) {
      // Handle room occupancy if user was assigned
      if (user.room_id) {
        const room = await Room.findById(user.room_id);
        if (room) {
          room.occupied = Math.max(0, room.occupied - 1);
          if (room.occupied < room.capacity && room.status === 'Occupied') {
            room.status = 'Available';
          }
          await room.save();
        }
      }

      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private
export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(currentPassword))) {
      user.password = newPassword;
      await user.save();
      res.status(200).json({ message: 'Password changed successfully' });
    } else {
      res.status(401).json({ message: 'Invalid current password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Send reset link
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found with this email' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash and set to user model
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    // Set expiry (10 minutes)
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetUrl);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  try {
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
