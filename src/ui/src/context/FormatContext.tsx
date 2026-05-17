import React, { createContext, useContext, useState, useEffect } from 'react';
import { Game, Format, GameId } from '../types/index';

interface FormatContextType {
  games: Game[];
  formats: Format[];
  selectedGame: GameId;
  selectedFormat: string | null;
  setSelectedGame: (gameId: GameId) => void;
  setSelectedFormat: (formatId: string | null) => void;
  loading: boolean;
}

const FormatContext = createContext<FormatContextType | undefined>(undefined);

export const FormatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [selectedGame, setSelectedGame] = useState<GameId>('yugioh');
  const [selectedFormat, setSelectedFormat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/games/${selectedGame}/formats`)
      .then(res => res.json())
      .then(data => {
        setFormats(data);
        if (data.length > 0) {
          setSelectedFormat(data[0].id);
        } else {
          setSelectedFormat(null);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [selectedGame]);

  return (
    <FormatContext.Provider value={{ 
      games, 
      formats, 
      selectedGame, 
      selectedFormat, 
      setSelectedGame, 
      setSelectedFormat,
      loading
    }}>
      {children}
    </FormatContext.Provider>
  );
};

export const useFormat = () => {
  const context = useContext(FormatContext);
  if (context === undefined) {
    throw new Error('useFormat must be used within a FormatProvider');
  }
  return context;
};
