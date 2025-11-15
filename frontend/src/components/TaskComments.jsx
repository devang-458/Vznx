import React, { useState, useEffect } from 'react';
import { IoClose, IoHeartOutline, IoHeart, IoThumbsUp, IoReaderOutline } from 'react-icons/io5';
import axiosInstance from '../../utils/axiosinstance';
import moment from 'moment';

export default function TaskComments({ taskId, isOpen, onClose }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 20;

  useEffect(() => {
    if (isOpen && taskId) {
      loadComments();
    }
  }, [isOpen, taskId, page]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/tasks/${taskId}/comments?limit=${LIMIT}&skip=${page * LIMIT}`
      );
      if (page === 0) {
        setComments(response.data.data.comments);
      } else {
        setComments(prev => [...prev, ...response.data.data.comments]);
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const response = await axiosInstance.post(
        `/api/tasks/${taskId}/comments`,
        {
          content: newComment,
          mentions: []
        }
      );
      setComments([response.data.data, ...comments]);
      setNewComment('');
    } catch (error) {
      alert('Error posting comment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;

    try {
      await axiosInstance.delete(`/api/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (error) {
      alert('Error deleting comment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleReaction = async (commentId, emoji) => {
    try {
      const response = await axiosInstance.post(
        `/api/comments/${commentId}/react`,
        { emoji }
      );
      setComments(comments.map(c => 
        c._id === commentId ? response.data.data : c
      ));
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <IoReaderOutline /> Comments ({comments.length})
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <IoClose className="text-2xl" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 && !loading && (
            <p className="text-center text-gray-500 py-8">No comments yet. Start a conversation!</p>
          )}

          {comments.map(comment => (
            <div key={comment._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <img
                  src={comment.author?.profileImageUrl || 'https://via.placeholder.com/40'}
                  alt={comment.author?.name}
                  className="w-10 h-10 rounded-full object-cover"
                />

                {/* Comment Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{comment.author?.name}</span>
                    <span className="text-xs text-gray-500">
                      {moment(comment.createdAt).fromNow()}
                    </span>
                    {comment.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
                  </div>

                  <p className="text-sm text-gray-800 mt-1 word-wrap">{comment.content}</p>

                  {/* Reactions */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => handleReaction(comment._id, '👍')}
                      className="text-xs hover:bg-white px-2 py-1 rounded transition"
                    >
                      👍 {comment.reactions?.filter(r => r.emoji === '👍').length || 0}
                    </button>
                    <button
                      onClick={() => handleReaction(comment._id, '❤️')}
                      className="text-xs hover:bg-white px-2 py-1 rounded transition"
                    >
                      ❤️ {comment.reactions?.filter(r => r.emoji === '❤️').length || 0}
                    </button>
                    <button
                      onClick={() => handleReaction(comment._id, '🎉')}
                      className="text-xs hover:bg-white px-2 py-1 rounded transition"
                    >
                      🎉 {comment.reactions?.filter(r => r.emoji === '🎉').length || 0}
                    </button>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteComment(comment._id)}
                  className="text-gray-400 hover:text-red-500 transition"
                  title="Delete comment"
                >
                  <IoClose className="text-lg" />
                </button>
              </div>
            </div>
          ))}

          {comments.length > 0 && (
            <button
              onClick={() => setPage(prev => prev + 1)}
              className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Load More Comments
            </button>
          )}
        </div>

        {/* Add Comment */}
        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={handleAddComment} className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment... Use @ to mention someone"
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <button type="button" className="text-gray-500 hover:text-gray-700 p-2">
                  📎
                </button>
              </div>
              <button
                type="submit"
                disabled={!newComment.trim() || loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-sm"
              >
                {loading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
