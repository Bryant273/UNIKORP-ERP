
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import { Button } from './ui/button';
import { Slider } from './ui/slider';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './ui/tooltip';

type DemoVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      const newVolume = value[0];
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };
  
  const handleProgressChange = (value: number[]) => {
    if (videoRef.current) {
        const newTime = (videoRef.current.duration * value[0]) / 100;
        videoRef.current.currentTime = newTime;
    }
  };

  const toggleFullScreen = () => {
    if (videoRef.current?.parentElement) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement.requestFullscreen();
      }
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => {
      setProgress((video.currentTime / video.duration) * 100);
    };
    
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isOpen]);
  
   useEffect(() => {
    if (!isOpen) {
      videoRef.current?.pause();
    }
   }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 border-0 bg-black">
        <DialogHeader className="sr-only">
          <DialogTitle>Vidéo de démonstration</DialogTitle>
          <DialogDescription>Lecteur vidéo présentant une démonstration du logiciel Unikorp.</DialogDescription>
        </DialogHeader>
        <div 
          className="relative aspect-video group w-full"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <video
            ref={videoRef}
            className="w-full h-full rounded-lg"
            onClick={togglePlay}
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
              <Button
                size="icon"
                variant="ghost"
                className="h-20 w-20 bg-white/20 hover:bg-white/30 text-white pointer-events-auto"
                onClick={togglePlay}
              >
                <Play className="h-10 w-10 fill-white" />
              </Button>
            </div>
          )}

          <div className={cn(
            "absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent transition-opacity duration-300",
            (isHovering || !isPlaying) ? "opacity-100" : "opacity-0"
          )}>
            <div className="flex flex-col gap-2">
                 <Slider
                    value={[progress]}
                    onValueChange={handleProgressChange}
                    max={100}
                    step={1}
                    className="w-full"
                  />
                <div className="flex items-center gap-2 text-white">
                  <div className="flex items-center gap-1">
                      <TooltipProvider>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" disabled><SkipBack className="h-5 w-5" /></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Précédent (Bientôt disponible)</p></TooltipContent>
                         </Tooltip>
                         <Button size="icon" variant="ghost" className="h-8 w-8" onClick={togglePlay}>
                            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                          </Button>
                         <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="ghost" className="h-8 w-8" disabled><SkipForward className="h-5 w-5" /></Button>
                            </TooltipTrigger>
                            <TooltipContent><p>Suivant (Bientôt disponible)</p></TooltipContent>
                         </Tooltip>
                      </TooltipProvider>
                  </div>
              
                  <div className="flex items-center gap-2">
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleVolumeChange([volume > 0 ? 0 : 1])}>
                      {volume > 0 ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>
                     <Slider
                        defaultValue={[1]}
                        value={[volume]}
                        onValueChange={handleVolumeChange}
                        max={1}
                        step={0.1}
                        className="w-24"
                      />
                  </div>
                  <div className="flex-1" />
                   <Button size="icon" variant="ghost" className="h-8 w-8" onClick={toggleFullScreen}>
                        <Maximize className="h-5 w-5" />
                   </Button>
                </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
