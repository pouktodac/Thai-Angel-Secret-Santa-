import React, { useEffect, useState } from 'react';

const Snowfall: React.FC = () => {
  const [snowflakes, setSnowflakes] = useState<{ id: number; left: number; duration: number; delay: number }[]>([]);

  useEffect(() => {
    const flakes = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: Math.random() * 5 + 5,
      delay: Math.random() * 5,
    }));
    setSnowflakes(flakes);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute top-[-10px] w-2 h-2 bg-white rounded-full opacity-70 animate-bounce-gentle"
          style={{
            left: `${flake.left}%`,
            animation: `fall ${flake.duration}s linear infinite`,
            animationDelay: `${flake.delay}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(-10vh) translateX(0px); opacity: 0; }
          10% { opacity: 0.8; }
          100% { transform: translateY(110vh) translateX(20px); opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default Snowfall;