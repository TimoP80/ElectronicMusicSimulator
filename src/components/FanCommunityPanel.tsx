import React from "react";
import { FanCommunity, ForumThread, MusicJournalReview } from "../types";

interface Props {
  communities: FanCommunity[];
  threads: ForumThread[];
  reviews: MusicJournalReview[];
  artistName: string;
}

export default function FanCommunityPanel({ communities, threads, reviews, artistName }: Props) {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-2xl">💬</span>
        <h3 className="text-lg font-bold text-white font-orbitron">Fan Communities</h3>
        <span className="ml-auto text-xs text-gray-400">{communities.length} communities</span>
      </div>

      {/* Communities */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Your Communities</h4>
        <div className="space-y-2">
          {communities.length === 0 ? (
            <div className="text-xs text-gray-500 italic">No fan communities yet. Release music and build a following!</div>
          ) : (
            communities.map(com => (
              <div key={com.id} className="bg-gray-800 rounded p-2">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <span className="text-gray-200 font-medium">{com.name}</span>
                    <span className="text-gray-500 ml-2">
                      {com.platform === "forum" ? "📋" : com.platform === "discord" ? "💬" : com.platform === "subreddit" ? "👽" : "🌐"}
                    </span>
                  </div>
                  <span className="text-gray-400">{com.memberCount} members</span>
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>Sentiment: <span className={com.averageSentiment > 0 ? "text-green-400" : "text-red-400"}>{com.averageSentiment > 0 ? '+' : ''}{com.averageSentiment}%</span></span>
                  <span>Activity: <span className="text-cyan-400">{com.activityLevel}%</span></span>
                  <span>Superfans: <span className="text-yellow-400">{com.dedicatedSuperfans}</span></span>
                </div>
                {com.cultStatus && (
                  <div className="text-xs text-purple-400 mt-1">🌟 Cult Following Status!</div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Forum Threads */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Forum Activity</h4>
        <div className="max-h-40 overflow-y-auto space-y-1">
          {threads.length === 0 ? (
            <div className="text-xs text-gray-500 italic">No forum activity yet.</div>
          ) : (
            threads.slice(-5).reverse().map(thread => (
              <div key={thread.id} className="bg-gray-800 rounded p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-200 font-medium truncate">{thread.title}</span>
                  <span className={`shrink-0 px-1 py-0.5 rounded text-xs ${
                    thread.category === "praise" ? "bg-green-900 text-green-300" :
                    thread.category === "criticism" ? "bg-red-900 text-red-300" :
                    thread.category === "drama" ? "bg-orange-900 text-orange-300" :
                    "bg-gray-700 text-gray-400"
                  }`}>{thread.category}</span>
                </div>
                <div className="text-gray-500 mt-1">{thread.content}</div>
                <div className="flex gap-2 mt-1 text-gray-600">
                  <span>💬 {thread.replies} replies</span>
                  <span>❤️ {thread.likes} likes</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Music Reviews */}
      <div>
        <h4 className="text-sm font-semibold text-gray-300 mb-2">Music Journalism</h4>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {reviews.length === 0 ? (
            <div className="text-xs text-gray-500 italic">No reviews yet. Release music to get noticed!</div>
          ) : (
            reviews.slice(-3).reverse().map(review => (
              <div key={review.id} className="bg-gray-800 rounded p-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-gray-200 font-medium">{review.publication}</span>
                    <span className="text-gray-500 ml-1">by {review.author}</span>
                  </div>
                  <span className={`font-bold ${
                    review.score >= 80 ? "text-green-400" :
                    review.score >= 60 ? "text-yellow-400" :
                    "text-red-400"
                  }`}>{review.score}/100</span>
                </div>
                <div className="text-gray-400 mt-1 italic">{review.content}</div>
                <div className="text-gray-600 mt-1">Influence: {review.influence}%</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
