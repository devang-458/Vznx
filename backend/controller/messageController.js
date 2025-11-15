const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const senderId = req.user._id;

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        const message = await Message.create({
            sender: senderId,
            receiver: receiverId,
            content: content
        });

        res.status(201).json({ message: 'Message sent successfully', data: message });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getMessages = async (req, res) => {
    try {
        const { otherUserId } = req.params;
        const currentUserId = req.user._id;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        }).sort({ createdAt: 'asc' });

        res.status(200).json({ data: messages });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const getConversations = async (req, res) => {
    try {
        const currentUserId = req.user._id;

        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { sender: currentUserId },
                        { receiver: currentUserId }
                    ]
                }
            },
            {
                $group: {
                    _id: {
                        $cond: {
                            if: { $eq: ["$sender", currentUserId] },
                            then: "$receiver",
                            else: "$sender"
                        }
                    },
                    lastMessage: { $last: "$$ROOT" }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $project: {
                    _id: 1,
                    'user.name': 1,
                    'user.profileImageUrl': 1,
                    'lastMessage.content': 1,
                    'lastMessage.createdAt': 1
                }
            }
        ]);

        res.status(200).json({ data: conversations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}

module.exports = {
    sendMessage,
    getMessages,
    getConversations
};
