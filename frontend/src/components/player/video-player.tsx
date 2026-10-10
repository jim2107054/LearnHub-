'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  Settings,
  Subtitles,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api-client';

interface VideoPlayerProps {
  lectureId: string;
  courseSlug: string;
  videoSrc?: string;
  initialTime?: number;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

export function VideoPlayer({
  lectureId,
  courseSlug,
  videoSrc,
  initialTime = 0,
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [streamConflictModal, setStreamConflictModal] = useState(false);

  // Heartbeat tracking ref (flush every 10 seconds)
  const lastHeartbeatRef = useRef<number>(0);

  // Send progress heartbeat to backend
  const sendProgressHeartbeat = useCallback(
    async (seconds: number) => {
      try {
        await apiClient(`/learning/lectures/${lectureId}/progress`, {
          method: 'POST',
          body: JSON.stringify({
            seconds_watched: Math.round(seconds),
          }),
        });
      } catch (err: unknown) {
        const error = err as { code?: string; status?: number };
        if (error?.code === 'concurrent_stream_limit' || error?.status === 403) {
          setStreamConflictModal(true);
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      }
    },
    [lectureId]
  );

  // Initialize HLS or native playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    const src = videoSrc || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

    if (src.includes('.m3u8') && Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      const hls = new Hls({
        capLevelToPlayerSize: true,
        autoStartLoad: true,
      });
      hlsRef.current = hls;
      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });
    } else {
      // Native MP4 / WebM fallback
      video.src = src;
      video.onloadedmetadata = () => {
        setIsLoading(false);
        if (initialTime > 0) {
          video.currentTime = initialTime;
        }
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, [videoSrc, initialTime]);

  // Video event handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    const current = video.currentTime;
    const dur = video.duration || 0;
    setCurrentTime(current);
    setDuration(dur);

    if (onTimeUpdate) {
      onTimeUpdate(current, dur);
    }

    // Heartbeat every 10 seconds
    const now = Math.floor(current);
    if (now > 0 && now % 10 === 0 && now !== lastHeartbeatRef.current) {
      lastHeartbeatRef.current = now;
      sendProgressHeartbeat(current);
    }
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      sendProgressHeartbeat(video.currentTime); // Flush on pause
    } else {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const target = parseFloat(e.target.value);
    video.currentTime = target;
    setCurrentTime(target);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const val = parseFloat(e.target.value);
    video.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setShowSettings(false);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Keyboard accessibility shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft':
        case 'j':
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 5);
          break;
        case 'ArrowRight':
        case 'l':
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 5);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video w-full bg-black select-none overflow-hidden group rounded-lg"
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => {
          setIsPlaying(false);
          sendProgressHeartbeat(duration);
          if (onEnded) onEnded();
        }}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 pointer-events-none">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {/* Center Big Play Button when paused */}
      {!isPlaying && !isLoading && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/40 transition group"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-2xl transition-transform group-hover:scale-110">
            <Play className="h-8 w-8 ml-1" />
          </div>
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        {/* Progress Scrubber */}
        <div className="relative mb-3 flex items-center">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/30 rounded-lg appearance-none cursor-pointer accent-primary"
          />
        </div>

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1 rounded hover:bg-white/20 transition"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>

            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
                }
              }}
              className="p-1 rounded hover:bg-white/20 transition"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="h-4 w-4" />
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                type="button"
                onClick={toggleMute}
                className="p-1 rounded hover:bg-white/20 transition"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 h-1 bg-white/30 rounded accent-white cursor-pointer"
              />
            </div>

            {/* Time Display */}
            <span className="font-mono text-slate-300">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Playback Speed Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSettings(!showSettings)}
                className="px-2 py-1 rounded hover:bg-white/20 font-bold transition flex items-center gap-1"
              >
                <span>{playbackSpeed}x</span>
                <Settings className="h-4 w-4" />
              </button>

              {showSettings && (
                <div className="absolute bottom-full right-0 mb-2 w-28 rounded-lg bg-popover text-popover-foreground border shadow-xl p-1 text-xs divide-y divide-border/50">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">
                    Speed
                  </div>
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSpeedChange(s)}
                      className={`w-full text-left px-2 py-1 rounded hover:bg-accent transition ${
                        playbackSpeed === s ? 'text-primary font-bold' : ''
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1 rounded hover:bg-white/20 transition"
              aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Concurrent Stream Conflict Modal (LRN-12) */}
      {streamConflictModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="max-w-sm rounded-xl bg-card border p-6 text-center space-y-4 shadow-2xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-foreground">Playback Paused</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You are currently streaming this course from another device or browser session. LearnHub allows one concurrent video stream per account.
            </p>
            <Button
              onClick={() => {
                setStreamConflictModal(false);
                togglePlay();
              }}
              className="w-full text-xs font-semibold"
            >
              Resume Playback Here
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
