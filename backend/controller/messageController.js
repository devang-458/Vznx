const { sendMessageToUser } = require('../socket');
const Message = require('../models/Message');
const User = require('../models/User');

const sendMessage = async (req, res) => {
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

    sendMessageToUser(receiverId, senderId, content, message.createdAt);

    res.status(201).json({ message: 'Message sent successfully', data: message });
};

const getMessages = async (req, res) => {
    const { otherUserId } = req.params;
    const currentUserId = req.user._id;

    const messages = await Message.find({
        $or: [
            { sender: currentUserId, receiver: otherUserId },
            { sender: otherUserId, receiver: currentUserId }
        ]
    }).sort({ createdAt: 'asc' });

    res.status(200).json({ data: messages });
};

const getConversations = async (req, res) => {
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
};

module.exports = {
    sendMessage,
    getMessages,
    getConversations
};
