import Room from '../models/Room.js';
import User from '../models/User.js';

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
export const getRooms = async (req, res) => {
  try {
    const rooms = await Room.find({});
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign a student to a room
// @route   POST /api/rooms/assign
// @access  Private/Admin
export const assignRoom = async (req, res) => {
  const { student_id, room_id } = req.body;

  try {
    const student = await User.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newRoom = await Room.findById(room_id);
    if (!newRoom) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (newRoom.occupied >= newRoom.capacity) {
      return res.status(400).json({ message: 'Room is already at full capacity' });
    }

    // Handle old room if student was already assigned
    if (student.room_id) {
      const oldRoom = await Room.findById(student.room_id);
      if (oldRoom) {
        oldRoom.occupied = Math.max(0, oldRoom.occupied - 1);
        if (oldRoom.occupied < oldRoom.capacity && oldRoom.status === 'Occupied') {
          oldRoom.status = 'Available';
        }
        await oldRoom.save();
      }
    }

    // Assign new room
    student.room_id = room_id;
    await student.save();

    newRoom.occupied += 1;
    if (newRoom.occupied >= newRoom.capacity) {
      newRoom.status = 'Occupied';
    }
    await newRoom.save();

    res.json({ message: 'Room assigned successfully', student, room: newRoom });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unassign a student from a room
// @route   POST /api/rooms/unassign
// @access  Private/Admin
export const unassignRoom = async (req, res) => {
  const { student_id } = req.body;

  try {
    const student = await User.findById(student_id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    if (!student.room_id) {
      return res.status(400).json({ message: 'Student is not assigned to any room' });
    }

    const room = await Room.findById(student.room_id);
    if (room) {
      room.occupied = Math.max(0, room.occupied - 1);
      if (room.occupied < room.capacity && room.status === 'Occupied') {
        room.status = 'Available';
      }
      await room.save();
    }

    student.room_id = undefined;
    await student.save();

    res.json({ message: 'Student unassigned successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a room
// @route   POST /api/rooms
// @access  Private/Admin
export const createRoom = async (req, res) => {
  const { room_number, capacity, status } = req.body;

  try {
    const roomExists = await Room.findOne({ room_number });
    if (roomExists) {
      return res.status(400).json({ message: 'Room already exists' });
    }

    const room = await Room.create({
      room_number,
      capacity,
      status
    });

    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update room status
// @route   PUT /api/rooms/:id
// @access  Private/Admin
export const updateRoom = async (req, res) => {
  const { status, occupied } = req.body;

  try {
    const updatedRoom = await Room.findByIdAndUpdate(
      req.params.id,
      { $set: { status, occupied } },
      { new: true, runValidators: true }
    );

    if (updatedRoom) {
      res.json(updatedRoom);
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
export const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);

    if (room) {
      res.json({ message: 'Room removed' });
    } else {
      res.status(404).json({ message: 'Room not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
