import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { Users, Plus, LogIn } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const connectToServer = async () => {
      try {
        await socketService.connect();
        setIsConnected(true);
      } catch (err) {
        setError('Failed to connect to game server');
        console.error(err);
      }
    };

    connectToServer();

    return () => {
      socketService.disconnect();
    };
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const generatedRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
      await socketService.createRoom(generatedRoomId, playerName.trim());
      navigate(`/room/${generatedRoomId}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!roomId.trim()) {
      setError('Please enter room ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await socketService.joinRoom(roomId.trim().toUpperCase(), playerName.trim());
      navigate(`/room/${roomId.trim().toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || 'Failed to join room');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-900 to-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-stone-800 rounded-2xl shadow-2xl border-4 border-amber-600 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-700 to-red-700 p-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-2" style={{ fontFamily: 'serif' }}>
              BANG!
            </h1>
            <p className="text-amber-100 text-lg">The Wild West Card Game</p>
          </div>

          {/* Content */}
          <div className="p-8 space-y-6">
            {/* Connection Status */}
            <div className="flex items-center justify-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-stone-300">
                {isConnected ? 'Connected to server' : 'Connecting...'}
              </span>
            </div>

            {/* Player Name Input */}
            <div>
              <label className="block text-stone-300 mb-2 font-semibold">Your Name</label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-stone-700 border-2 border-stone-600 rounded-lg text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none transition-colors"
                disabled={loading || !isConnected}
              />
            </div>

            {/* Create Room Button */}
            <button
              onClick={handleCreateRoom}
              disabled={loading || !isConnected}
              className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-stone-600 disabled:to-stone-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg disabled:cursor-not-allowed"
            >
              <Plus size={24} />
              <span className="text-lg">Create New Room</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-stone-800 text-stone-400">or</span>
              </div>
            </div>

            {/* Join Room Section */}
            <div>
              <label className="block text-stone-300 mb-2 font-semibold">Room ID</label>
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                placeholder="Enter room ID"
                className="w-full px-4 py-3 bg-stone-700 border-2 border-stone-600 rounded-lg text-white placeholder-stone-400 focus:border-amber-500 focus:outline-none transition-colors uppercase"
                disabled={loading || !isConnected}
              />
            </div>

            <button
              onClick={handleJoinRoom}
              disabled={loading || !isConnected}
              className="w-full bg-gradient-to-r from-red-700 to-red-800 hover:from-red-600 hover:to-red-700 disabled:from-stone-600 disabled:to-stone-700 text-white font-bold py-4 px-6 rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg disabled:cursor-not-allowed"
            >
              <LogIn size={24} />
              <span className="text-lg">Join Room</span>
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/50 border-2 border-red-600 text-red-200 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Player Count Info */}
            <div className="bg-stone-700/50 rounded-lg p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-stone-300 mb-1">
                <Users size={20} />
                <span className="font-semibold">4-7 Players Required</span>
              </div>
              <p className="text-stone-400 text-sm">
                Gather your posse and prepare for a showdown!
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-stone-400 text-sm">
          <p>A multiplayer adaptation of the classic BANG! card game</p>
        </div>
      </div>
    </div>
  );
}
