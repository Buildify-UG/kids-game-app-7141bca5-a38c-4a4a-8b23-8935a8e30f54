import { useState, useEffect, useCallback } from 'react';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';

interface Bubble {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  vx: number;
  vy: number;
}

const BUBBLE_COLORS = [
  'bg-red-400',
  'bg-blue-400',
  'bg-green-400',
  'bg-yellow-300',
  'bg-pink-400',
  'bg-purple-400',
  'bg-cyan-400',
  'bg-orange-400',
];

const Index = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [gameActive, setGameActive] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [nextId, setNextId] = useState(0);

  // Spawn bubbles periodically
  useEffect(() => {
    if (!gameActive) return;

    const spawnInterval = setInterval(() => {
      const newBubble: Bubble = {
        id: nextId,
        x: Math.random() * (window.innerWidth - 80),
        y: window.innerHeight,
        size: Math.random() * 30 + 40,
        color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: -(Math.random() * 3 + 2),
      };
      
      setBubbles(prev => [...prev, newBubble]);
      setNextId(prev => prev + 1);
    }, 400);

    return () => clearInterval(spawnInterval);
  }, [gameActive, nextId]);

  // Update bubble positions
  useEffect(() => {
    if (!gameActive) return;

    const animationFrame = setInterval(() => {
      setBubbles(prev => {
        const updated = prev
          .map(bubble => ({
            ...bubble,
            x: bubble.x + bubble.vx,
            y: bubble.y + bubble.vy,
          }))
          .filter(bubble => bubble.y > -100);

        return updated;
      });
    }, 30);

    return () => clearInterval(animationFrame);
  }, [gameActive]);

  const popBubble = useCallback((id: number) => {
    setBubbles(prev => prev.filter(b => b.id !== id));
    setScore(prev => prev + 1);
    
    if (soundEnabled) {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  }, [soundEnabled]);

  const resetGame = () => {
    setBubbles([]);
    setScore(0);
    setGameActive(true);
    setNextId(0);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-amber-100 via-blue-100 to-pink-100 overflow-hidden relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-primary to-transparent p-6">
        <div className="flex justify-between items-center max-w-6xl mx-auto">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-primary-foreground drop-shadow-lg">
              🫧 Bubble Pop 🫧
            </h1>
            <p className="text-primary-foreground text-sm mt-1 drop-shadow">Tap the bubbles!</p>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="bg-secondary text-secondary-foreground p-3 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all"
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>
        </div>
      </div>

      {/* Score Display */}
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20">
        <div className="bg-white bg-opacity-90 rounded-full px-8 py-4 shadow-lg">
          <p className="text-3xl font-bold text-primary text-center">Score: {score}</p>
        </div>
      </div>

      {/* Game Area */}
      <div className="w-full h-full relative">
        {bubbles.map(bubble => (
          <button
            key={bubble.id}
            onClick={() => popBubble(bubble.id)}
            className={`absolute rounded-full ${bubble.color} shadow-lg hover:shadow-2xl transform hover:scale-110 transition-all cursor-pointer border-4 border-white border-opacity-40 active:scale-95`}
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              boxShadow: `inset -2px -2px 8px rgba(0,0,0,0.2), 0 8px 16px rgba(0,0,0,0.15)`,
            }}
            aria-label="Bubble"
          />
        ))}
      </div>

      {/* Reset Button */}
      <button
        onClick={resetGame}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 bg-accent text-accent-foreground px-8 py-4 rounded-full font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center gap-2"
      >
        <RotateCcw size={20} />
        New Game
      </button>

      {/* Instructions */}
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center text-primary drop-shadow-lg">
        <p className="text-lg font-semibold">🎮 Tap bubbles as fast as you can!</p>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-10 text-6xl opacity-30 animate-bounce-gentle">🎨</div>
      <div className="absolute bottom-1/4 right-10 text-6xl opacity-30 animate-bounce-gentle" style={{ animationDelay: '0.5s' }}>🎯</div>
      <div className="absolute top-1/2 right-1/4 text-5xl opacity-20 animate-bounce-gentle" style={{ animationDelay: '1s' }}>⭐</div>
    </div>
  );
};

export default Index;
