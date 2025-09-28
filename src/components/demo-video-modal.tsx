'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

type DemoVideoModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function DemoVideoModal({ isOpen, onClose }: DemoVideoModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Démo de UNIKORP</DialogTitle>
          <DialogDescription>
            Découvrez comment UNIKORP peut transformer votre gestion d'entreprise.
          </DialogDescription>
        </DialogHeader>
        <div className="aspect-video p-6">
          <iframe
            className="w-full h-full rounded-lg"
            src="https://www.youtube.com/embed/dQw4w9WgXcQ"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </DialogContent>
    </Dialog>
  );
}
