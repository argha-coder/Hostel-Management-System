import GatePass from '../models/GatePass.js';

// @desc    Apply for a new gate pass (Student)
// @route   POST /api/gatepass
// @access  Private/Student
export const applyForGatePass = async (req, res) => {
  const { reason, departure_time, return_time } = req.body;

  try {
    // Validation: Check if departure_time is in the past
    const now = new Date();
    const departureDate = new Date(departure_time);
    
    // Set both to start of minute for fair comparison
    now.setSeconds(0, 0);
    departureDate.setSeconds(0, 0);

    if (departureDate < now) {
      return res.status(400).json({ message: 'Departure time cannot be in the past' });
    }

    if (new Date(return_time) <= departureDate) {
      return res.status(400).json({ message: 'Return time must be after departure time' });
    }

    const gatePass = await GatePass.create({
      student_id: req.user._id,
      reason,
      departure_time,
      return_time,
      status: 'Pending'
    });

    // Populate student info for immediate UI feedback if needed
    const populatedGatePass = await gatePass.populate('student_id', 'name email');
    res.status(201).json(populatedGatePass);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get student's own gate passes (Student)
// @route   GET /api/gatepass/my
// @access  Private/Student
export const getMyGatePasses = async (req, res) => {
  try {
    const gatePasses = await GatePass.find({ student_id: req.user._id }).sort('-createdAt');
    res.json(gatePasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all gate passes (Admin/Warden)
// @route   GET /api/gatepass
// @access  Private/Admin
export const getAllGatePasses = async (req, res) => {
  try {
    const gatePasses = await GatePass.find({}).populate('student_id', 'name email').sort('-createdAt');
    res.json(gatePasses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update gate pass status (Admin/Warden)
// @route   PUT /api/gatepass/:id
// @access  Private/Admin
export const updateGatePassStatus = async (req, res) => {
  const { status, review_note } = req.body;
  console.log(`Updating GatePass ${req.params.id} to status: ${status}, note: ${review_note}`);

  try {
    const updateData = {};
    if (status) updateData.status = status;
    if (review_note !== undefined) updateData.review_note = review_note;
    updateData.reviewed_by = req.user._id;

    const updatedGatePass = await GatePass.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('student_id', 'name email');

    if (!updatedGatePass) {
      console.log(`GatePass ${req.params.id} not found`);
      return res.status(404).json({ message: 'Gate pass not found' });
    }

    console.log(`Successfully updated GatePass ${req.params.id} to status: ${updatedGatePass.status}`);
    res.json(updatedGatePass);
  } catch (error) {
    console.error(`Error updating GatePass ${req.params.id}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};
