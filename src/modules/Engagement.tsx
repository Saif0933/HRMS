import {
  CheckCircle,
  Frown,
  Heart,
  Laugh, Meh,
  Send, Smile
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

export const Engagement: React.FC = () => {
  const { feedPosts, setFeedPosts, activeSubModule, setActiveSubModule, addAuditLog, employees } = useApp();

  const activeUser = employees[0]; // Aarav Sharma

  // Social feed input state
  const [newPostText, setNewPostText] = useState('');
  const [commentTextMap, setCommentTextMap] = useState<Record<string, string>>({});

  // Survey States
  const [wfhRating, setWfhRating] = useState<number | null>(null);
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const newPost = {
      id: `PST${Math.floor(Math.random() * 1000)}`,
      author: activeUser.name,
      authorRole: activeUser.role,
      authorAvatar: activeUser.avatar,
      content: newPostText,
      likes: 0,
      comments: [],
      reactions: [
        { type: "👍", count: 0 },
        { type: "❤️", count: 0 }
      ],
      date: "Just now"
    };

    setFeedPosts(prev => [newPost, ...prev]);
    addAuditLog("Posted Announcement", "Engagement Module", `Shared an update on the feed: "${newPostText.slice(0, 30)}..."`);
    setNewPostText('');
  };

  const handleLikePost = (postId: string) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const liked = !post.likedByMe;
        return {
          ...post,
          likedByMe: liked,
          likes: liked ? post.likes + 1 : post.likes - 1
        };
      }
      return post;
    }));
  };

  const handleAddComment = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentTxt = commentTextMap[postId];
    if (!commentTxt || !commentTxt.trim()) return;

    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `C${Math.floor(Math.random() * 1000)}`,
              user: activeUser.name,
              text: commentTxt,
              date: "Just now"
            }
          ]
        };
      }
      return post;
    }));

    setCommentTextMap(prev => ({ ...prev, [postId]: '' }));
  };

  const handleReaction = (postId: string, reactType: string) => {
    setFeedPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          reactions: post.reactions.map(r => 
            r.type === reactType ? { ...r, count: r.count + 1 } : r
          )
        };
      }
      return post;
    }));
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveSubModule('feed')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'feed' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Social Announcement Feed
        </button>
        <button 
          onClick={() => setActiveSubModule('mood')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'mood' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Mood Analysis Gauge
        </button>
        <button 
          onClick={() => setActiveSubModule('surveys')}
          className={`py-3 px-5 text-sm font-semibold border-b-2 transition-all ${
            activeSubModule === 'surveys' 
              ? 'border-primary text-primary' 
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          Surveys & Feedback
        </button>
      </div>

      {/* ======================================= */}
      {/* 1. SOCIAL ANNOUNCEMENT FEED             */}
      {/* ======================================= */}
      {activeSubModule === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in text-xs">
          
          {/* Create announcement & suggestions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">Publish HR Update</h3>
            
            <form onSubmit={handleCreatePost} className="space-y-3.5">
              <textarea 
                value={newPostText} 
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder="What is happening in the company? Share team updates..." 
                rows={4} 
                required 
                className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-350"
              />
              <button 
                type="submit" 
                className="w-full py-2 bg-primary text-white rounded-xl font-bold hover:scale-105 transition-all shadow-md shadow-primary/10"
              >
                Post Update
              </button>
            </form>
          </div>

          {/* Social feed posts */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 lg:col-span-2">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm border-b pb-2">FactoCorp Communication Wall</h3>
            
            <div className="space-y-6">
              {feedPosts.map((post) => (
                <div key={post.id} className="p-4 border rounded-xl space-y-4 bg-slate-50 dark:bg-slate-950/40">
                  <div className="flex gap-3">
                    <img src={post.authorAvatar} alt={post.author} className="h-10 w-10 rounded-full object-cover shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white leading-none">{post.author}</p>
                      <span className="text-[9px] text-slate-400 font-semibold">{post.authorRole} • {post.date}</span>
                    </div>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>

                  {post.image && (
                    <img src={post.image} alt="Announcement attachment" className="w-full h-48 object-cover rounded-xl border" />
                  )}

                  {/* Likes/reactions section */}
                  <div className="flex items-center gap-4 border-y py-2 text-slate-400">
                    <button 
                      onClick={() => handleLikePost(post.id)}
                      className={`flex items-center gap-1.5 font-bold ${
                        post.likedByMe ? 'text-rose-500' : 'hover:text-slate-600 dark:hover:text-slate-300'
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${post.likedByMe ? 'fill-rose-500' : ''}`} />
                      <span>{post.likes} Likes</span>
                    </button>
                    
                    <div className="flex gap-1 bg-white dark:bg-slate-900 border px-2 py-0.5 rounded-full">
                      {post.reactions.map((r, i) => (
                        <button 
                          key={i} 
                          onClick={() => handleReaction(post.id, r.type)}
                          className="hover:scale-110 transition-transform font-medium"
                          title="React"
                        >
                          {r.type} <span className="text-[9px] text-slate-400">{r.count}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border text-[11px]">
                          <div className="flex justify-between font-bold">
                            <span className="text-slate-850 dark:text-white">{comment.user}</span>
                            <span className="text-[9px] text-slate-400">{comment.date}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-1">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    <form 
                      onSubmit={(e) => handleAddComment(post.id, e)} 
                      className="flex gap-2 items-center"
                    >
                      <input 
                        type="text" 
                        placeholder="Write a comment..." 
                        value={commentTextMap[post.id] || ''}
                        onChange={(e) => setCommentTextMap({ ...commentTextMap, [post.id]: e.target.value })}
                        className="flex-1 px-3 py-1.5 border rounded-lg focus:outline-none bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-350"
                      />
                      <button 
                        type="submit" 
                        disabled={!(commentTextMap[post.id] || '').trim()}
                        className="p-1.5 bg-primary text-white rounded-lg hover:scale-105 transition-all disabled:opacity-50"
                      >
                        <Send className="h-3.5 w-3.5" />
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 2. MOOD ANALYSIS                        */}
      {/* ======================================= */}
      {activeSubModule === 'mood' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Company Pulse Mood Analysis</h3>
            <p className="text-slate-400 mt-1">Aggregate employee sentiment scores compiled anonymously through weekly micro-checkins.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
              <Laugh className="h-8 w-8 text-emerald-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-white">Thrilled (52%)</p>
              <p className="text-[10px] text-slate-400">Feeling highly motivated</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
              <Smile className="h-8 w-8 text-blue-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-white">Content (32%)</p>
              <p className="text-[10px] text-slate-400">Steady focus & good progress</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
              <Meh className="h-8 w-8 text-amber-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-white">Neutral (12%)</p>
              <p className="text-[10px] text-slate-400">Tired or facing blockers</p>
            </div>
            <div className="p-4 border rounded-xl bg-slate-50 dark:bg-slate-950 space-y-2">
              <Frown className="h-8 w-8 text-rose-500 mx-auto" />
              <p className="font-bold text-slate-800 dark:text-white">Stressed (4%)</p>
              <p className="text-[10px] text-slate-400">Experiencing heavy workload</p>
            </div>
          </div>
        </div>
      )}

      {/* ======================================= */}
      {/* 3. SURVEYS & FEEDBACK                   */}
      {/* ======================================= */}
      {activeSubModule === 'surveys' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 animate-fade-in text-xs">
          <div>
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Active Corporate Surveys</h3>
            <p className="text-slate-400 mt-1">Provide feedback anonymously to shape corporate policy revisions.</p>
          </div>

          <div className="border rounded-xl p-4 bg-slate-50 dark:bg-slate-950 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div>
                <span className="font-bold text-slate-850 dark:text-white text-sm">WFH Hybrid Policy Review 2026</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Closes tomorrow at 5:00 PM</span>
              </div>
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
            </div>

            {surveySubmitted ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto" />
                <p className="font-bold text-slate-800 dark:text-white">Thank you for submitting your survey!</p>
                <p className="text-slate-450 text-[10px]">Your feedback was anonymized and recorded successfully.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="font-bold text-slate-700 dark:text-slate-350">Question: How satisfied are you with our current 3-day work from office mandate?</p>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setWfhRating(rating)}
                      className={`h-9 w-9 rounded-lg font-bold border transition-colors ${
                        wfhRating === rating 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-650'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 max-w-xs">
                  <span>Very Unsatisfied</span>
                  <span>Extremely Pleased</span>
                </div>

                <button
                  disabled={wfhRating === null}
                  onClick={() => { setSurveySubmitted(true); addAuditLog("Completed Survey", "Engagement Module", "Responded to WFH hybrid policy pulse survey"); }}
                  className="px-4 py-1.5 bg-primary text-white rounded-lg font-bold hover:scale-105 transition-all shadow-md shadow-primary/10 disabled:opacity-50"
                >
                  Submit Survey Feedback
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

// Help helper for the check circle
const CheckCircle2: React.FC<any> = ({ className }) => <CheckCircle className={className} />;
