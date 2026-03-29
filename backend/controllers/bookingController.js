import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import User from '../models/User.js';

// @desc    Create a new booking (Room Request)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  const { room_id, start_date, duration } = req.body;

  try {
    // Check if user already has a pending booking or is already assigned to a room
    const existingUser = await User.findById(req.user._id);
    if (existingUser.room_id) {
      return res.status(400).json({ message: 'The room has already been allotted to you.' });
    }

    const existingPending = await Booking.findOne({ student_id: req.user._id, status: 'Pending' });
    if (existingPending) {
      return res.status(400).json({ message: 'You already have a pending room request.' });
    }

    // Just check if the room is available
    const room = await Room.findById(room_id);
    if (!room || room.status !== 'Available' || room.occupied >= room.capacity) {
      return res.status(400).json({ message: 'Room not found, not available, or already full' });
    }

    const booking = await Booking.create({
      student_id: req.user._id,
      room_id,
      start_date,
      duration: duration || 6, // Default to 6 months if not provided
      amount: 5000 * (duration || 6), // Sample amount logic
      status: 'Pending'
    });

    res.status(201).json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve a booking
// @route   PUT /api/bookings/:id/approve
// @access  Private/Admin
export const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('room_id').populate('student_id');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    const room = await Room.findById(booking.room_id._id);
    if (!room || room.occupied >= room.capacity) {
      return res.status(400).json({ message: 'Room is full or no longer available' });
    }

    // Atomically increment occupied count and update room status if full
    room.occupied += 1;
    if (room.occupied >= room.capacity) {
      room.status = 'Occupied';
    }
    await room.save();

    // Assign user to room
    const user = await User.findById(booking.student_id._id);
    
    // Handle old room if student was already assigned (unlikely but safe)
    if (user.room_id) {
      const oldRoom = await Room.findById(user.room_id);
      if (oldRoom) {
        oldRoom.occupied = Math.max(0, oldRoom.occupied - 1);
        if (oldRoom.occupied < oldRoom.capacity && oldRoom.status === 'Occupied') {
          oldRoom.status = 'Available';
        }
        await oldRoom.save();
      }
    }

    user.room_id = room._id;
    await user.save();

    // Mark booking as Approved
    booking.status = 'Approved';
    await booking.save();

    res.json({ message: 'Booking approved and room assigned', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reject a booking
// @route   PUT /api/bookings/:id/reject
// @access  Private/Admin
export const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.status !== 'Pending') {
      return res.status(400).json({ message: 'Booking is not pending' });
    }

    booking.status = 'Rejected';
    await booking.save();

    res.json({ message: 'Booking rejected', booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('student_id', 'name email').populate('room_id', 'room_number');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings/mybookings
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ student_id: req.user._id }).populate('room_id', 'room_number');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
