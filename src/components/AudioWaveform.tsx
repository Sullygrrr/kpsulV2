import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react-native';

interface AudioWaveformProps {
  audioUrl: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioUrl }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (waveformRef.current) {
      const ws = WaveSurfer.create({
        container: waveformRef.current,
        waveColor: 'rgba(255, 255, 255, 0.2)',
        progressColor: 'rgba(255, 255, 255, 0.8)',
        cursorColor: 'transparent',
        barWidth: 2,
        barGap: 3,
        barRadius: 3,
        height: 48,
        normalize: true,
        fillParent: true
      });

      wavesurfer.current = ws;

      const loadAudio = async () => {
        try {
          await ws.load(audioUrl);
          setError(false);
        } catch (err) {
          // Ignorer les erreurs d'abort car elles sont normales lors de la destruction
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(true);
          }
        }
      };

      loadAudio();

      const handleFinish = () => setIsPlaying(false);
      ws.on('finish', handleFinish);

      return () => {
        ws.un('finish', handleFinish);
        if (ws.isPlaying()) {
          ws.stop();
        }
        ws.destroy();
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (wavesurfer.current && !error) {
      wavesurfer.current.playPause();
      setIsPlaying(!isPlaying);
    }
  };

  if (error) {
    return (
      <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/[0.02] border border-white/10">
        <div className="text-sm text-white/60">
          Le message audio n'est pas disponible
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg bg-white/[0.02] border border-white/10">
      <button
        onClick={togglePlayPause}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full 
                 bg-white/10 hover:bg-white/20 transition-colors"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 text-white" />
        ) : (
          <Play className="w-4 h-4 text-white" />
        )}
      </button>
      <div ref={waveformRef} className="flex-grow" />
    </div>
  );
};

export default AudioWaveform;