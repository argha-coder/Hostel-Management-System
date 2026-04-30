import Message from '../models/Message.js';
import User from '../models/User.js';

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
export const sendMessage = async (req, res) => {
  const { receiverId, content } = req.body;

  if (!content) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' });
    }

    const message = await Message.create({
      sender: req.user._id,
      receiver: receiverId,
      content,
    });

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'name email role')
      .populate('receiver', 'name email role');

    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get conversation between two users
// @route   GET /api/chat/conversation/:userId
// @access  Private
export const getConversation = async (req, res) => {
  const otherUserId = req.params.userId;

  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: otherUserId },
        { sender: otherUserId, receiver: req.user._id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email role')
    .populate('receiver', 'name email role');

    // Mark messages as read when fetched by the receiver
    await Message.updateMany(
      { sender: otherUserId, receiver: req.user._id, isRead: false },
      { isRead: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all students who have messaged the admin (Admin only)
// @route   GET /api/chat/threads
// @access  Private/Admin
export const getChatThreads = async (req, res) => {
  try {
    // Find all unique students who sent messages to admin or received from admin
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
    .sort({ createdAt: -1 });

    const threadUserIds = new Set();
    messages.forEach(msg => {
      if (msg.sender.toString() !== req.user._id.toString()) {
        threadUserIds.add(msg.sender.toString());
      }
      if (msg.receiver.toString() !== req.user._id.toString()) {
        threadUserIds.add(msg.receiver.toString());
      }
    });

    const threadUsers = await User.find({
      _id: { $in: Array.from(threadUserIds) }
    }).select('name email role');

    res.json(threadUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all admins (Students use this to find wardens)
// @route   GET /api/chat/admins
// @access  Private
export const getAdmins = async (req, res) => {
  try {
    const admins = await User.find({ role: 'Admin' }).select('name email role');
    res.json(admins);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
