import User from '../models/User.js';
import Room from '../models/Room.js';
import Booking from '../models/Booking.js';
import Fine from '../models/Fine.js';
import GatePass from '../models/GatePass.js';

// @desc    Get essential dashboard metrics (Optimized for speed)
// @route   GET /api/stats/summary
export const getDashboardSummary = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const [totalStudents, availableRoomsCount, pendingFeesData, activeFinesData, pendingGatePasses] = await Promise.all([
        User.countDocuments({ role: 'Student' }),
        Room.countDocuments({ status: 'Available', occupied: { $lt: 1 } }), // Simplified for summary
        Booking.aggregate([
          { $match: { status: 'Approved', payment_status: 'Unpaid' } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Fine.aggregate([
          { $match: { status: 'Unpaid' } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        GatePass.countDocuments({ status: 'Pending' })
      ]);

      return res.json({
        totalStudents,
        availableRooms: availableRoomsCount,
        pendingFees: pendingFeesData[0]?.total || 0,
        activeFines: activeFinesData[0]?.total || 0,
        pendingGatePasses
      });
    } else {
      // Student summary
      const [fines, pendingGatePasses] = await Promise.all([
        Fine.find({ student_id: req.user._id, status: 'Unpaid' }).select('amount').lean(),
        GatePass.countDocuments({ student_id: req.user._id, status: 'Pending' })
      ]);

      return res.json({
        pendingFines: fines.reduce((sum, f) => sum + f.amount, 0),
        pendingGatePasses
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === 'Admin') {
      const [totalStudents, verifiedStudents, totalRooms, roomStats, pendingBookings, pendingGatePassesCount, pendingFinesData] = await Promise.all([
        User.countDocuments({ role: 'Student' }),
        User.countDocuments({ role: 'Student', isVerified: true }),
        Room.countDocuments(),
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
        Booking.aggregate([
          { $match: { status: 'Approved', payment_status: 'Unpaid' } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        GatePass.countDocuments({ status: 'Pending' }),
        Fine.aggregate([
          { $match: { status: 'Unpaid' } },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
      ]);

      const stats = roomStats[0] || { totalCapacity: 0, totalOccupied: 0, availableRooms: 0 };
      const { totalCapacity, totalOccupied, availableRooms } = stats;
      
      const pendingRevenue = pendingBookings[0]?.total || 0;
      const pendingFinesTotal = pendingFinesData[0]?.total || 0;

      return res.json({
        role: 'Admin',
        totalStudents,
        verifiedStudents,
        totalRooms,
        availableRooms,
        pendingRevenue,
        pendingFines: pendingFinesTotal,
        pendingGatePasses: pendingGatePassesCount,
        occupancyRate: totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0
      });

    } else {
      // Student Dashboard Stats
      const [user, bookings, gatePasses, fines] = await Promise.all([
        User.findById(req.user._id).populate('room_id').lean(),
        Booking.find({ student_id: req.user._id }).populate('room_id').lean(),
        GatePass.find({ student_id: req.user._id }).sort('-createdAt').limit(5).lean(),
        Fine.find({ student_id: req.user._id, status: 'Pending' }).lean()
      ]);

      let roommates = [];
      if (user.room_id) {
        roommates = await User.find({ 
          room_id: user.room_id._id, 
          _id: { $ne: user._id } 
        }).select('name email').lean();
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
