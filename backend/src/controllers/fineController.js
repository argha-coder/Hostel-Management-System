import Fine from '../models/Fine.js';
import User from '../models/User.js';

// @desc    Get all fines (Admin) or student's own fines (Student)
// @route   GET /api/fines
// @access  Private
export const getFines = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Student') {
      query.student_id = req.user._id;
    }
    
    const fines = await Fine.find(query)
      .populate('student_id', 'name email')
      .populate('issued_by', 'name')
      .sort('-createdAt');
    res.json(fines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Issue a new fine (Admin)
// @route   POST /api/fines
// @access  Private/Admin
export const issueFine = async (req, res) => {
  const { student_id, amount, reason } = req.body;

  try {
    const student = await User.findById(student_id);
    if (!student || student.role !== 'Student') {
      return res.status(404).json({ message: 'Student not found' });
    }

    const fine = await Fine.create({
      student_id,
      amount,
      reason,
      issued_by: req.user._id
    });

    const populatedFine = await Fine.findById(fine._id)
      .populate('student_id', 'name email')
      .populate('issued_by', 'name');
    res.status(201).json(populatedFine);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark fine as paid (Admin)
// @route   PUT /api/fines/:id/pay
// @access  Private/Admin
export const markFineAsPaid = async (req, res) => {
  try {
    const fine = await Fine.findById(req.params.id);

    if (fine) {
      fine.status = 'Paid';
      fine.paid_at = Date.now();
      
      const updatedFine = await fine.save();
      const populatedFine = await Fine.findById(updatedFine._id)
        .populate('student_id', 'name email')
        .populate('issued_by', 'name');
      res.json(populatedFine);
    } else {
      res.status(404).json({ message: 'Fine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a fine (Admin)
// @route   DELETE /api/fines/:id
// @access  Private/Admin
export const deleteFine = async (req, res) => {
  try {
    const fine = await Fine.findByIdAndDelete(req.params.id);
    if (fine) {
      res.json({ message: 'Fine removed' });
    } else {
      res.status(404).json({ message: 'Fine not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
