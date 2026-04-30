import Notice from '../models/Notice.js';

// @desc    Get all notices
// @route   GET /api/notices
// @access  Private
export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find({})
      .populate('author', 'name role')
      .sort({ createdAt: -1 });
    res.json(notices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Post a new notice (Admin only)
// @route   POST /api/notices
// @access  Private/Admin
export const postNotice = async (req, res) => {
  const { title, content, priority, expiresAt } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  try {
    const notice = await Notice.create({
      title,
      content,
      author: req.user._id,
      priority: priority || 'Normal',
      expiresAt: expiresAt || null
    });

    const populatedNotice = await Notice.findById(notice._id).populate('author', 'name role');
    res.status(201).json(populatedNotice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a notice (Admin only)
// @route   DELETE /api/notices/:id
// @access  Private/Admin
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }
    
    await Notice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Notice removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
