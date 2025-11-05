import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import socketService from '../services/socketService';
import { Users, Play, Check, X, Heart, Target, ArrowRight, Shield } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  character?: any;
  role?: any;
  life?: number;
  maxLife?: number;
  hand?: any[];
  equipment?: any[];
  weapon?: any;
  isDead?: boolean;
  position?: number;
  bangPlayed?: number;
}

interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  currentPhase: string;
  turnNumber: number;
  gameLog: string[];
  awaitingResponse: any;
  winner?: any;
}

export default function GameRoom() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [room, setRoom] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Get initial room info
    socketService.getRoomInfo(roomId).then(setRoom).catch(() => {
      setError('Room not found');
      setTimeout(() => navigate('/'), 2000);
    });

    // Set up listeners
    socketService.onRoomUpdated((updatedRoom) => {
      setRoom(updatedRoom);
    });

    socketService.onGameStarted((state) => {
      setGameState(state);
    });

    socketService.onGameStateUpdated((state) => {
      setGameState(state);
    });

    socketService.onResponseRequired((data) => {
      console.log('Response required:', data);
    });

    return () => {
      socketService.leaveRoom(roomId);
      socketService.offRoomUpdated();
      socketService.offGameStarted();
      socketService.offGameStateUpdated();
      socketService.offResponseRequired();
    };
  }, [roomId, navigate]);

  useEffect(() => {
    if (gameState && socketService.getSocket()) {
      const myId = socketService.getSocket()?.id;
      const player = gameState.players.find(p => p.id === myId);
      setCurrentPlayer(player || null);
    }
  }, [gameState]);

  const handleToggleReady = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      await socketService.toggleReady(roomId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      await socketService.startGame(roomId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDrawCards = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      await socketService.drawCards(roomId, 2);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayCard = async () => {
    if (!roomId || !selectedCard) return;
    setLoading(true);
    try {
      await socketService.playCard(roomId, selectedCard, selectedTarget || undefined);
      setSelectedCard(null);
      setSelectedTarget(null);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndTurn = async () => {
    if (!roomId) return;
    setLoading(true);
    try {
      await socketService.endTurn(roomId);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToBang = async (missedCardIds: string[]) => {
    if (!roomId) return;
    setLoading(true);
    try {
      await socketService.respondToBang(roomId, missedCardIds);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isMyTurn = currentPlayer && gameState && 
    gameState.players[gameState.currentPlayerIndex]?.id === currentPlayer.id;

  // Lobby view (before game starts)
  if (!gameState || room?.status === 'waiting') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-900 to-stone-900 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-stone-800 rounded-2xl shadow-2xl border-4 border-amber-600 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-amber-700 to-red-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1" style={{ fontFamily: 'serif' }}>
                    Room: {roomId}
                  </h1>
                  <p className="text-amber-100">Waiting for players...</p>
                </div>
                <div className="bg-stone-900/50 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2 text-white">
                    <Users size={20} />
                    <span className="font-bold">{room?.players.length || 0}/7</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Players List */}
            <div className="p-6">
              <h2 className="text-xl font-bold text-stone-200 mb-4">Players</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {room?.players.map((player: any) => (
                  <div
                    key={player.id}
                    className={`bg-stone-700 rounded-lg p-4 flex items-center justify-between ${
                      player.id === socketService.getSocket()?.id ? 'ring-2 ring-amber-500' : ''
                    }`}
                  >
                    <div>
                      <span className="text-white font-semibold">{player.name}</span>
                      {player.isHost && (
                        <span className="ml-2 text-xs bg-amber-600 text-white px-2 py-1 rounded">
                          HOST
                        </span>
                      )}
                    </div>
                    {player.isReady ? (
                      <Check className="text-green-500" size={20} />
                    ) : (
                      <X className="text-red-500" size={20} />
                    )}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleToggleReady}
                  disabled={loading}
                  className={`w-full py-3 px-6 rounded-lg font-bold transition-all ${
                    room?.players.find((p: any) => p.id === socketService.getSocket()?.id)?.isReady
                      ? 'bg-stone-600 hover:bg-stone-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  } disabled:opacity-50`}
                >
                  {room?.players.find((p: any) => p.id === socketService.getSocket()?.id)?.isReady
                    ? 'Not Ready'
                    : 'Ready'}
                </button>

                {room?.players.find((p: any) => p.id === socketService.getSocket()?.id && p.isHost) && (
                  <button
                    onClick={handleStartGame}
                    disabled={loading || room.players.length < 4 || !room.players.every((p: any) => p.isReady || p.isHost)}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-stone-600 disabled:to-stone-700 text-white font-bold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                  >
                    <Play size={20} />
                    <span>Start Game</span>
                  </button>
                )}

                {room?.players.length < 4 && (
                  <div className="bg-amber-900/50 border-2 border-amber-600 text-amber-200 px-4 py-3 rounded-lg text-center">
                    Need at least 4 players to start
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 bg-red-900/50 border-2 border-red-600 text-red-200 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game view
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-red-900 to-stone-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="bg-stone-800 rounded-xl shadow-xl border-2 border-amber-600 p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'serif' }}>
                BANG! - Room {roomId}
              </h2>
              <p className="text-stone-300">Turn {gameState.turnNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-stone-300">Current Phase:</p>
              <p className="text-xl font-bold text-amber-400 capitalize">{gameState.currentPhase}</p>
            </div>
          </div>
        </div>

        {/* Winner Banner */}
        {gameState.winner && (
          <div className="bg-gradient-to-r from-amber-600 to-yellow-500 rounded-xl p-6 mb-4 text-center">
            <h2 className="text-3xl font-bold text-white mb-2">Game Over!</h2>
            <p className="text-xl text-stone-900">{gameState.winner.message}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Players Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Other Players */}
            <div className="bg-stone-800 rounded-xl shadow-xl border-2 border-stone-700 p-4">
              <h3 className="text-lg font-bold text-white mb-3">Players</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {gameState.players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`bg-stone-700 rounded-lg p-3 ${
                      player.isDead ? 'opacity-50' : ''
                    } ${
                      index === gameState.currentPlayerIndex ? 'ring-2 ring-amber-500' : ''
                    } ${
                      selectedTarget === player.id ? 'ring-2 ring-red-500' : ''
                    } cursor-pointer transition-all`}
                    onClick={() => {
                      if (!player.isDead && player.id !== currentPlayer?.id) {
                        setSelectedTarget(player.id === selectedTarget ? null : player.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-semibold">{player.name}</span>
                          {player.role?.revealed && (
                            <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded">
                              {player.role.name}
                            </span>
                          )}
                        </div>
                        <p className="text-stone-400 text-sm">{player.character?.name}</p>
                      </div>
                      {player.isDead ? (
                        <span className="text-red-500 font-bold">DEAD</span>
                      ) : (
                        <div className="flex items-center gap-1 text-red-500">
                          {Array.from({ length: player.life || 0 }).map((_, i) => (
                            <Heart key={i} size={16} fill="currentColor" />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-stone-400">
                      Cards in hand: {player.hand?.length || 0}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Current Player Hand */}
            {currentPlayer && !currentPlayer.isDead && (
              <div className="bg-stone-800 rounded-xl shadow-xl border-2 border-stone-700 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Your Hand</h3>
                  <div className="flex items-center gap-2">
                    {currentPlayer.role && (
                      <span className="text-sm bg-amber-600 text-white px-3 py-1 rounded">
                        {currentPlayer.role.name}
                      </span>
                    )}
                    <div className="flex items-center gap-1 text-red-500">
                      {Array.from({ length: currentPlayer.life || 0 }).map((_, i) => (
                        <Heart key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {currentPlayer.hand?.map((card: any) => (
                    <div
                      key={card.id}
                      className={`bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg p-3 cursor-pointer transition-all ${
                        selectedCard === card.id ? 'ring-4 ring-amber-500 scale-105' : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedCard(card.id === selectedCard ? null : card.id)}
                    >
                      <div className="text-center">
                        <p className="font-bold text-stone-900 text-sm mb-1">{card.type}</p>
                        <p className="text-xs text-stone-700">{card.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions & Game Log */}
          <div className="space-y-4">
            {/* Actions */}
            {isMyTurn && !gameState.winner && (
              <div className="bg-stone-800 rounded-xl shadow-xl border-2 border-amber-600 p-4">
                <h3 className="text-lg font-bold text-white mb-3">Your Turn</h3>
                <div className="space-y-2">
                  {gameState.currentPhase === 'draw' && (
                    <button
                      onClick={handleDrawCards}
                      disabled={loading}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50"
                    >
                      Draw 2 Cards
                    </button>
                  )}

                  {gameState.currentPhase === 'play' && (
                    <>
                      <button
                        onClick={handlePlayCard}
                        disabled={loading || !selectedCard}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Target size={16} />
                        Play Card
                      </button>

                      <button
                        onClick={handleEndTurn}
                        disabled={loading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <ArrowRight size={16} />
                        End Turn
                      </button>
                    </>
                  )}
                </div>

                {selectedCard && (
                  <div className="mt-3 p-2 bg-stone-700 rounded text-sm text-stone-300">
                    Card selected - {selectedTarget ? 'Target selected' : 'Select target if needed'}
                  </div>
                )}
              </div>
            )}

            {/* Awaiting Response */}
            {gameState.awaitingResponse && gameState.awaitingResponse.target === currentPlayer?.id && (
              <div className="bg-red-900 rounded-xl shadow-xl border-2 border-red-600 p-4">
                <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                  <Shield size={20} />
                  Respond to BANG!
                </h3>
                <p className="text-red-200 mb-3 text-sm">
                  You need {gameState.awaitingResponse.missedRequired} Missed! card(s)
                </p>
                <button
                  onClick={() => {
                    const missedCards = currentPlayer?.hand?.filter((c: any) => c.type === 'Missed!').slice(0, gameState.awaitingResponse.missedRequired) || [];
                    handleRespondToBang(missedCards.map((c: any) => c.id));
                  }}
                  className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all"
                >
                  Respond
                </button>
              </div>
            )}

            {/* Game Log */}
            <div className="bg-stone-800 rounded-xl shadow-xl border-2 border-stone-700 p-4">
              <h3 className="text-lg font-bold text-white mb-3">Game Log</h3>
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {gameState.gameLog.slice(-10).reverse().map((log, index) => (
                  <div key={index} className="text-sm text-stone-300 bg-stone-700/50 px-2 py-1 rounded">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border-2 border-red-600 text-red-200 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
