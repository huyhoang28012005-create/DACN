import { useState, useEffect } from 'react';
import { X, MessageSquare, Send, AlertTriangle, User, Clock, CheckCircle, Settings } from 'lucide-react';
import apiClient from '../../services/apiClient';
import { timeAgo } from '../../utils/timeAgo';
import { toast } from 'react-hot-toast';


interface Comment {
  id: number;
  content: string;
  created_at: string;
  user: {
    id: number;
    name: string;
    avatar_url: string;
    role: string;
  };
  replies?: Comment[];
}

interface ReportDetailModalProps {
  report: any;
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
}

export function ReportDetailModal({ report, isOpen, onClose, currentUser }: ReportDetailModalProps) {

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && report) {
      fetchComments();
    }
  }, [isOpen, report]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient.get(`/api/comments?reportId=${report.id}`);
      setComments(res.data);
    } catch (error) {
      toast.error('Lỗi khi tải bình luận');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (parentId?: number) => {
    if (!newComment.trim()) return;
    try {
      await apiClient.post('/api/comments', {
        content: newComment,
        reportId: report.id,
        parentId: parentId || undefined,
      });
      setNewComment('');
      setReplyingTo(null);
      fetchComments();
      toast.success('Đã gửi bình luận');
    } catch (error) {
      toast.error('Lỗi khi gửi bình luận');
    }
  };

  const handleDeleteComment = async (id: number) => {
    try {
      await apiClient.delete(`/api/comments/${id}`);
      fetchComments();
      toast.success('Đã xóa bình luận');
    } catch (error) {
      toast.error('Lỗi khi xóa bình luận');
    }
  };

  if (!isOpen || !report) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return <AlertTriangle className="w-5 h-5 text-rose-500" />;
      case 'IN_PROGRESS': return <Settings className="w-5 h-5 text-amber-500" />;
      case 'RESOLVED': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      default: return null;
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`flex gap-3 ${isReply ? 'ml-10 mt-3' : 'mt-4'}`}>
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
        {comment.user.avatar_url ? (
          <img src={comment.user.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
        ) : (
          <User className="w-4 h-4 text-blue-600" />
        )}
      </div>
      <div className="flex-1">
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-200 dark:border-slate-700">
          <div className="flex justify-between items-start mb-1">
            <span className="font-bold text-[13px] text-slate-800 dark:text-slate-200">
              {comment.user.name}
              {comment.user.role === 'ADMIN' && (
                <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-700 rounded text-[10px] font-bold">ADMIN</span>
              )}
              {comment.user.role === 'TECHNICIAN' && (
                <span className="ml-2 px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold">KỸ THUẬT</span>
              )}
            </span>
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="text-[13px] text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
            {comment.content}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-1 ml-2">
          {!isReply && (
            <button
              onClick={() => setReplyingTo(comment.id)}
              className="text-[12px] font-medium text-slate-500 hover:text-blue-600 transition-colors"
            >
              Trả lời
            </button>
          )}
          {comment.user.id === currentUser?.userId && (
            <button
              onClick={() => handleDeleteComment(comment.id)}
              className="text-[12px] font-medium text-slate-500 hover:text-rose-600 transition-colors"
            >
              Xóa
            </button>
          )}
        </div>

        {replyingTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Viết phản hồi..."
              className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-[13px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handlePostComment(comment.id);
              }}
            />
            <button
              onClick={() => handlePostComment(comment.id)}
              className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setReplyingTo(null);
                setNewComment('');
              }}
              className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {comment.replies?.map((reply) => renderComment(reply, true))}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center justify-center">
              {getStatusIcon(report.status)}
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
                Chi tiết Sự cố #{report.id}
              </h2>
              <p className="text-[12px] text-slate-500">
                Đăng bởi <span className="font-semibold text-slate-700 dark:text-slate-300">{report.user?.name}</span> • {timeAgo(report.created_at)}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700">
          {/* Report Details */}
          <div className="mb-8">
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-3">
              {report.title}
            </h3>
            <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
              <p className="text-[14px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {report.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {report.equipment && (
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700">
                  Thiết bị: {report.equipment.name}
                </span>
              )}
              {report.room && (
                <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700">
                  Phòng Lab: {report.room.name}
                </span>
              )}
            </div>
          </div>

          <hr className="border-slate-100 dark:border-slate-800 my-6" />

          {/* Comments Section */}
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Thảo luận ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
            </h3>

            {isLoading ? (
              <div className="text-center py-8 text-slate-500 text-sm">Đang tải bình luận...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-500">Chưa có bình luận nào. Hãy là người đầu tiên thảo luận!</p>
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {comments.map(c => renderComment(c))}
              </div>
            )}
          </div>
        </div>

        {/* Comment Input */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800">
          {replyingTo === null && (
            <div className="flex gap-3 items-end">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex shrink-0 items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600">
                <User className="w-5 h-5 text-slate-500" />
              </div>
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Thêm bình luận hoặc cập nhật tiến độ..."
                  className="w-full pl-4 pr-12 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl text-[14px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all resize-none shadow-sm dark:text-white"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handlePostComment();
                    }
                  }}
                />
                <button
                  onClick={() => handlePostComment()}
                  disabled={!newComment.trim()}
                  className="absolute right-3 bottom-3 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
