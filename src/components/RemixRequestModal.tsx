/**
 * Remix Request Modal Component
 * Manage remix collaboration requests - both sent and received
 */
import { X, Music, User, DollarSign, Clock, CheckCircle, XCircle, Send } from 'lucide-react';

interface VirtualArtist {
  name: string;
  fame: number;
  style: string;
  genre: string;
}

interface RemixRequest {
  id: string;
  trackId: string;
  trackName: string;
  requestedArtist: string;
  cost: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  date: string;
  isIncoming?: boolean;
  requestingArtist?: string;
  remixVersion?: string;
}

interface Track {
  id: string;
  title: string;
  stats?: {
    catchiness: number;
    soundDesign: number;
  };
}

interface RemixRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  remixRequests: RemixRequest[];
  virtualArtists: VirtualArtist[];
  tracks: Track[];
  money: number;
  onSendRequest: (trackId: string, artistName: string) => void;
  onAcceptRequest: (requestId: string) => void;
  onRejectRequest: (requestId: string) => void;
}

export default function RemixRequestModal({
  isOpen,
  onClose,
  remixRequests,
  virtualArtists,
  tracks,
  money,
  onSendRequest,
  onAcceptRequest,
  onRejectRequest
}: RemixRequestModalProps) {
  if (!isOpen) return null;

  const incomingRequests = remixRequests.filter(r => r.isIncoming);
  const outgoingRequests = remixRequests.filter(r => !r.isIncoming);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-[#0A0A0C] border border-[#1A1A1E] rounded-xl w-full max-w-4xl max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#050507] border-b border-[#1A1A1E] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-[#FF00FF]/20 to-[#00FF95]/20 p-2 rounded-lg">
              <Music className="h-5 w-5 text-[#FF00FF]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Remix Collaboration Hub</h2>
              <p className="text-xs text-slate-400">Send remix requests to artists or manage incoming requests</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#1A1A1E] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
          
          {/* Send Remix Request Section */}
          <div className="bg-[#050507] border border-[#1A1A1E] rounded-xl p-4 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-[#00FF95]" />
              Send Remix Request
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Track Selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Select Your Track</label>
                <select className="w-full bg-[#0A0A0C] border border-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-white focus:border-[#FF00FF] focus:outline-none">
                  <option value="">Choose a track to remix...</option>
                  {tracks.map(track => (
                    <option key={track.id} value={track.id}>
                      {track.title} 
                      {track.stats && ` (${track.stats.catchiness}/100)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Artist Selection */}
              <div className="space-y-2">
                <label className="text-xs text-slate-400 font-medium">Request Remix From</label>
                <select className="w-full bg-[#0A0A0C] border border-[#1A1A1E] rounded-lg px-3 py-2 text-sm text-white focus:border-[#FF00FF] focus:outline-none">
                  <option value="">Choose an artist...</option>
                  {virtualArtists.map(artist => (
                    <option key={artist.name} value={artist.name}>
                      {artist.name} ({artist.fame} fame, {artist.style})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Cost Preview */}
            <div className="flex items-center justify-between bg-[#0A0A0C] rounded-lg p-3">
              <span className="text-xs text-slate-400">Estimated Cost</span>
              <span className="text-sm font-bold text-[#00FF95]">$500 - $1,500</span>
            </div>

            <button className="w-full bg-gradient-to-r from-[#FF00FF] to-[#00FF95] text-black font-bold py-2.5 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Send className="h-4 w-4" />
              Send Remix Request
            </button>
          </div>

          {/* Incoming Requests */}
          {incomingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="h-4 w-4 text-[#FF00FF]" />
                Incoming Remix Requests ({incomingRequests.length})
              </h3>
              
              <div className="space-y-2">
                {incomingRequests.map(request => (
                  <div key={request.id} className="bg-[#050507] border border-[#FF00FF]/30 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">{request.requestingArtist}</span>
                          <span className="text-xs text-slate-400">wants to remix</span>
                          <span className="text-sm font-bold text-[#00FF95]">{request.trackName}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {request.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Offer: ${request.cost}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAcceptRequest(request.id)}
                          className="p-2 bg-[#00FF95]/20 hover:bg-[#00FF95]/30 rounded-lg transition-colors"
                          title="Accept"
                        >
                          <CheckCircle className="h-4 w-4 text-[#00FF95]" />
                        </button>
                        <button
                          onClick={() => onRejectRequest(request.id)}
                          className="p-2 bg-[#FF4444]/20 hover:bg-[#FF4444]/30 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4 text-[#FF4444]" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outgoing Requests */}
          {outgoingRequests.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="h-4 w-4 text-[#00FF95]" />
                Sent Requests ({outgoingRequests.length})
              </h3>
              
              <div className="space-y-2">
                {outgoingRequests.map(request => (
                  <div key={request.id} className="bg-[#050507] border border-[#1A1A1E] rounded-xl p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-white">"{request.trackName}"</span>
                          <span className="text-xs text-slate-400">→</span>
                          <span className="text-sm font-bold text-[#FF00FF]">{request.requestedArtist}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Sent {request.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Paid: ${request.cost}
                          </span>
                        </div>
                      </div>
                      
                      <StatusBadge status={request.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {remixRequests.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Music className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">No remix requests yet</p>
              <p className="text-xs">Send a request to collaborate with other artists!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Pending' },
    accepted: { bg: 'bg-[#00FF95]/20', text: 'text-[#00FF95]', label: 'Accepted' },
    rejected: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Rejected' },
    completed: { bg: 'bg-purple-500/20', text: 'text-purple-500', label: 'Completed' },
  };

  const { bg, text, label } = config[status] || config.pending;

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
      {label}
    </span>
  );
}
