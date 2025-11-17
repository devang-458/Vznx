import React, { useState, useEffect } from 'react';
import { IoClose, IoHeartOutline, IoHeart, IoThumbsUp } from 'react-icons/io5';
import axiosInstance from '../utils/axiosinstance';
import moment from 'moment';
import Button from './layouts/Button';

export default function TaskComments({ taskId, onCommentAdded }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const LIMIT = 5; // Reduced limit for embedded view

  useEffect(() => {
    if (taskId) {
      setPage(0); // Reset page when taskId changes
      setComments([]); // Clear comments when taskId changes
      loadComments(0); // Load first page of comments
    }
  }, [taskId]);

  // Effect to refetch comments when onCommentAdded is triggered (from parent)
  useEffect(() => {
    if (onCommentAdded) {
      loadComments(0); // Refetch comments from page 0
    }
  }, [onCommentAdded]);


  const loadComments = async (currentPage) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(
        `/api/tasks/${taskId}/comments?limit=${LIMIT}&skip=${currentPage * LIMIT}`
      );
      if (currentPage === 0) {
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

  return (
    <div className="space-y-4">
      {comments.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-4">No comments yet. Be the first to comment!</p>
      )}

      {comments.map(comment => (
        <div key={comment._id} className="bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <img
              src={comment.author?.profileImageUrl || 'https://ui-avatars.com/api/?name=' + (comment.author?.name || 'User') + '&background=random'}
              alt={comment.author?.name}
              className="w-8 h-8 rounded-full object-cover"
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
                <Button
                  onClick={() => handleReaction(comment._id, '👍')}
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:bg-white px-2 py-1 rounded transition"
                >
                  👍 {comment.reactions?.filter(r => r.emoji === '👍').length || 0}
                </Button>
                <Button
                  onClick={() => handleReaction(comment._id, '❤️')}
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:bg-white px-2 py-1 rounded transition"
                >
                  ❤️ {comment.reactions?.filter(r => r.emoji === '❤️').length || 0}
                </Button>
                <Button
                  onClick={() => handleReaction(comment._id, '🎉')}
                  variant="ghost"
                  size="sm"
                  className="text-xs hover:bg-white px-2 py-1 rounded transition"
                >
                  🎉 {comment.reactions?.filter(r => r.emoji === '🎉').length || 0}
                </Button>
              </div>
            </div>

            {/* Delete Button */}
            <Button
              onClick={() => handleDeleteComment(comment._id)}
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-red-500 transition"
              title="Delete comment"
            >
              <IoClose className="text-lg" />
            </Button>
          </div>
        </div>
      ))}

      {loading && <p className="text-center text-gray-500 py-4">Loading more comments...</p>}

      {comments.length > 0 && comments.length % LIMIT === 0 && ( // Only show load more if there might be more comments
        <Button
          onClick={() => {
            setPage(prev => prev + 1);
            loadComments(page + 1);
          }}
          variant="ghost"
          className="w-full text-blue-600 hover:text-blue-700 font-medium text-sm"
        >
          Load More Comments
        </Button>
      )}
    </div>
  );
}
