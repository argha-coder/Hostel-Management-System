import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Fine from '../models/Fine.js';
import GatePass from '../models/GatePass.js';

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const [totalStudents, roomStats, pendingBookingsCount, pendingGatePassesCount, pendingFinesCount] = await Promise.all([
        User.countDocuments({ role: 'Student' }),
        Room.aggregate([
          {
            $group: {
              _id: null,
              totalCapacity: { $sum: "$capacity" },
              totalOccupied: { $sum: "$occupied" },
              availableRooms: {
                $sum: {
                  $cond: [
                    {
                      $and: [
                        { $lt: ["$occupied", "$capacity"] },
                        { $eq: ["$status", "Available"] }
                      ]
                    },
                    1,
                    0
                  ]
                }
              }
            }
          }
        ]),
        Booking.countDocuments({ payment_status: 'Pending' }),
        GatePass.countDocuments({ status: 'Pending' }),
        Fine.countDocuments({ status: 'Pending' })
      ]);

      const stats = roomStats[0] || { totalCapacity: 0, totalOccupied: 0, availableRooms: 0 };
      const { totalCapacity, totalOccupied, availableRooms } = stats;
      
      const pendingRevenue = pendingBookingsCount * 5000;

      return res.json({
        role: 'Admin',
        totalStudents,
        availableRooms,
        pendingRevenue,
        pendingFines: pendingFinesCount,
        pendingGatePasses: pendingGatePassesCount,
        occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0
      });
    } else {
      // Student Dashboard Stats
      const [user, bookings, gatePasses, fines] = await Promise.all([
        User.findById(req.user._id).populate('room_id'),
        Booking.find({ student_id: req.user._id }).populate('room_id'),
        GatePass.find({ student_id: req.user._id }).sort('-createdAt').limit(5),
        Fine.find({ student_id: req.user._id, status: 'Pending' })
      ]);

      let roommates = [];
      if (user.room_id) {
        roommates = await User.find({ 
          room_id: user.room_id._id, 
          _id: { $ne: user._id } 
        }).select('name email');
      }

      return res.json({
        role: 'Student',
        user: {
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
          room: user.room_id ? {
            room_number: user.room_id.room_number,
            capacity: user.room_id.capacity,
            occupied: user.room_id.occupied,
            status: user.room_id.status
          } : null
        },
        roommates,
        pendingFinesAmount: fines.reduce((sum, f) => sum + f.amount, 0),
        bookings: bookings.map(b => ({
          _id: b._id,
          room_number: b.room_id?.room_number,
          start_date: b.start_date,
          duration: b.duration,
          payment_status: b.payment_status,
          status: b.status,
          amount: b.amount,
          createdAt: b.createdAt
        })),
        gatePasses
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
