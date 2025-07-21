
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Send, Phone, Video, Search, PlusCircle, Smile, Paperclip, Users, User, FileImage, FileText, MessageCircle, X, Check, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

// --- MOCK DATA & TYPES ---

type User = {
  id: string;
  name: string;
  avatarUrl: string;
  isOnline: boolean;
};

type Message = {
  id: string;
  text: string;
  senderId: string;
  timestamp: string;
  isUnread?: boolean;
};

type ContactType = 'Client' | 'Fournisseur' | 'Interne' | 'Partenaire';
type Channel = 'WhatsApp' | 'Messenger' | 'Instagram' | 'LinkedIn' | 'Email';

type Conversation = {
  id: string;
  name?: string; // For group chats
  userIds: string[];
  messages: Message[];
  contactType?: ContactType;
  channel?: Channel;
};

const currentUser: User = { id: 'user0', name: 'Moi', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true };

const users: Record<string, User> = {
  'user0': { id: 'user0', name: 'Utilisateur Actuel', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  'user1': { id: 'user1', name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  'user2': { id: 'user2', name: 'Marie Martin', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  'user3': { id: 'user3', name: 'Pierre Durand', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
  'user4': { id: 'user4', name: 'Équipe Support', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  'user5': { id: 'user5', name: 'Sophie André', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
};

const initialConversations: Conversation[] = [
  { id: 'conv1', userIds: ['user0', 'user1'], messages: [{ id: 'msg1', text: "Bonjour, j'ai une question sur ma commande...", senderId: 'user1', timestamp: '14:30', isUnread: true }], contactType: 'Client', channel: 'WhatsApp' },
  { id: 'conv2', userIds: ['user0', 'user2'], messages: [{ id: 'msg2', text: 'Merci pour votre aide !', senderId: 'user2', timestamp: '12:15', isUnread: true }], contactType: 'Client', channel: 'Messenger' },
  { id: 'conv3', userIds: ['user0', 'user3'], messages: [{ id: 'msg3', text: 'Parfait, je vous tiens au courant', senderId: 'user0', timestamp: '11:45' }], contactType: 'Fournisseur', channel: 'Instagram' },
  { id: 'conv4', name: "Équipe Support", userIds: ['user0', 'user4'], messages: [{ id: 'msg4', text: 'Réunion prévue à 15h', senderId: 'user4', timestamp: '09:30' }], contactType: 'Interne', channel: 'LinkedIn' },
  { id: 'conv5', userIds: ['user0', 'user5'], messages: [{ id: 'msg5', text: 'Nouvelle collaboration possible ?', senderId: 'user5', timestamp: '16:20', isUnread: true }], contactType: 'Partenaire', channel: 'Email' },
];

const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🚀', '🎉', '💡', '🤔', '🔥', '💯', '✅'];

const platformIcons: Record<Channel, { icon: React.FC<any>, color: string }> = {
    WhatsApp: { icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path fill="currentColor" d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01zM12.04 20.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18l-3.12.82l.83-3.04l-.2-.31a8.264 8.264 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24c2.205 0 4.28.86 5.825 2.405a8.188 8.188 0 0 1 2.405 5.825c-.005 4.54-3.705 8.24-8.245 8.24zM16.56 14.31c-.13-.07-1.54-1-1.77-.83c-.23.17-.44.83-.26 1c.17.17.44.13.7.07s1.77-.7 2.12-1.63c.35-.94.3-1.4.13-1.57c-.17-.17-.44-.14-.52-.14s-1 .41-1.17.61zM10.12 6.87c-.22 0-.46.04-.68.09c-.58.13-1.13.3-1.58.55s-.83.56-1.12.92c-.29.35-.5.78-.63 1.28c-.12.5-.16 1.08-.02 1.71c.14 0.64.44 1.29.89 1.9c.45.62 1.05 1.2 1.78 1.7c.73.5 1.57.88 2.49 1.13c.92.25 1.88.35 2.82.29c1.01-.06 1.94-.35 2.73-.85c.79-.5 1.44-1.17 1.91-1.96c.47-.79.74-1.68.8-2.63c.06-.95-.06-1.87-.36-2.73c-.3-.86-.8-1.62-1.45-2.25c-.65-.63-1.42-1.1-2.28-1.39c-.86-.29-1.8-.39-2.77-.3z"/></svg>, color: "bg-green-500" },
    Messenger: { icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path fill="currentColor" d="m12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c2.215 0 4.38-.6 6.26-1.74l1.3.38c.56.16 1.12.33 1.7.5.42.12.89-.12 1.09-.5.2-.37.1-.82-.2-1.1L21.06 20c.93-1.42 1.44-3.07 1.44-4.78C22.5 5.92 17.76.74 12 0zm-1.13 15.22l-2.09-2.09a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0l2.09 2.09a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0z"/></svg>, color: "bg-blue-600" },
    Instagram: { icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><defs><radialGradient id="insta-gradient" cx="0.3" cy="1.2" r="1.35"><stop offset="0" stop-color="#FDCB52"/><stop offset="0.5" stop-color="#FD8A34"/><stop offset="1" stop-color="#E2306C"/></radialGradient></defs><path fill="url(#insta-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07c1.256.058 2.083.333 2.684.582a4.912 4.912 0 0 1 1.8 1.8c.25.6.523 1.428.582 2.684c.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.06 1.256-.333 2.083-.582 2.684a4.912 4.912 0 0 1-1.8 1.8c-.6.25-1.428.523-2.684.582c-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.256-.058-2.083-.333-2.684-.582a4.912 4.912 0 0 1-1.8-1.8c-.25-.6-.523-1.428-.582-2.684c-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.06-1.256.333-2.083.582-2.684a4.912 4.912 0 0 1 1.8-1.8c.6-.25 1.428-.523 2.684-.582C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.14 0-3.51.01-4.73.07c-1.18.053-1.85.29-2.22.44a3.1 3.1 0 0 0-1.14 1.14c-.15.37-.4.94-.44 2.22c-.06 1.22-.07 1.59-.07 4.73s.01 3.51.07 4.73c.04 1.28.29 1.85.44 2.22a3.1 3.1 0 0 0 1.14 1.14c.37.15.94.4 2.22.44c1.22.06 1.59.07 4.73.07s3.51-.01 4.73-.07c1.28-.04 1.85-.29 2.22-.44a3.1 3.1 0 0 0 1.14-1.14c.15-.37.4-.94.44-2.22c.06-1.22.07-1.59.07-4.73s-.01-3.51-.07-4.73c-.04-1.28-.29-1.85-.44-2.22a3.1 3.1 0 0 0-1.14-1.14c-.37-.15-.94-.4-2.22-.44C15.51 3.975 15.14 3.965 12 3.965zM12 7.188a4.812 4.812 0 1 0 0 9.624a4.812 4.812 0 0 0 0-9.624zM12 15a3 3 0 1 1 0-6a3 3 0 0 1 0 6zm6.406-7.875a1.125 1.125 0 1 0 0-2.25a1.125 1.125 0 0 0 0 2.25z"/></svg>, color: "bg-pink-500" },
    LinkedIn: { icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037c-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85c3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125a2.063 2.063 0 0 1 0 4.125zm1.777 13.019H3.557V9h3.553v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z"/></svg>, color: "bg-blue-700" },
    Email: { icon: (props: any) => <svg {...props} viewBox="0 0 24 24"><path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>, color: "bg-gray-500" },
};

function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [selectedConversationId, conversations]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversationId) return;

    const newMessageObj: Message = {
      id: `msg-${Date.now()}`,
      text: newMessage,
      senderId: currentUser.id,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations(prev =>
      prev.map(conv =>
        conv.id === selectedConversationId
          ? { ...conv, messages: [...conv.messages, newMessageObj] }
          : conv
      )
    );
    setNewMessage('');
  };

  const getConversationDetails = useCallback((conv: Conversation) => {
    const otherUserIds = conv.userIds.filter(id => id !== currentUser.id);
    if (conv.name) {
        return {
            name: conv.name,
            avatarUrl: users[otherUserIds[0]]?.avatarUrl || 'https://placehold.co/100x100.png',
            isGroup: true,
            isOnline: false,
        };
    }
    const otherUser = users[otherUserIds[0]];
    return {
        name: otherUser?.name || 'Inconnu',
        avatarUrl: otherUser?.avatarUrl || 'https://placehold.co/100x100.png',
        isGroup: false,
        isOnline: otherUser?.isOnline || false,
    };
  }, []);

  const activeConversation = conversations.find(c => c.id === selectedConversationId);
  const activeContact = activeConversation ? getConversationDetails(activeConversation) : null;
  
  const handleSelectConversation = (convId: string) => {
    setSelectedConversationId(convId);
    setConversations(prev => prev.map(conv => {
        if (conv.id === convId) {
            return {
                ...conv,
                messages: conv.messages.map(m => ({ ...m, isUnread: false }))
            }
        }
        return conv;
    }))
  };

  const PlatformIcon = ({channel, className} : {channel: Channel, className?: string}) => {
    const IconComponent = platformIcons[channel]?.icon;
    return IconComponent ? <IconComponent className={className} /> : null;
  };
  
  const PlatformIndicator = ({channel, className}: {channel: Channel, className?: string}) => {
    const platform = platformIcons[channel];
    if (!platform) return null;
    return <div className={cn("absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-background", platform.color, className)}>{' '}</div>
  }

  return (
    <div className="flex flex-1 overflow-hidden h-full">
        {/* Platforms Sidebar */}
        <div className="w-20 bg-background/30 border-r flex flex-col items-center py-4 space-y-4">
            {Object.entries(platformIcons).map(([name, {icon: Icon, color}]) => (
                <button key={name} className="p-3 rounded-lg hover:bg-muted" title={name}>
                    <Icon className="w-6 h-6 text-muted-foreground" />
                </button>
            ))}
        </div>

        {/* Conversations List */}
        <div className="w-96 border-r flex flex-col bg-background/80 h-full">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold tracking-tight">Communications</h2>
                <Button variant="ghost" size="icon" className="rounded-full" onClick={() => toast({ title: 'Nouvelle conversation' })}>
                    <PlusCircle className="h-5 w-5" />
                </Button>
            </div>
            <div className="p-4 border-b">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Rechercher..." className="pl-9" />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2">
                    {conversations.map(conv => {
                        const details = getConversationDetails(conv);
                        const lastMessage = conv.messages[conv.messages.length - 1];
                        const isUnread = lastMessage?.isUnread && lastMessage?.senderId !== currentUser.id;
                        return (
                            <button
                                key={conv.id}
                                onClick={() => handleSelectConversation(conv.id)}
                                className={cn('w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors hover:bg-muted', selectedConversationId === conv.id && 'bg-primary/10')}
                            >
                                <div className="relative flex-shrink-0">
                                    <Avatar className="h-12 w-12"><AvatarImage src={details.avatarUrl} alt={details.name} data-ai-hint={details.isGroup ? "group chat" : "person face"} /><AvatarFallback>{details.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                                    {conv.channel && <PlatformIndicator channel={conv.channel} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline justify-between">
                                        <p className="font-semibold text-sm truncate">{details.name}</p>
                                        <span className="text-xs text-muted-foreground">{lastMessage?.timestamp}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground truncate">{lastMessage?.senderId === currentUser.id ? 'Vous: ' : ''}{lastMessage?.text || "Aucun message"}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-muted-foreground capitalize">{conv.contactType} • {conv.channel}</span>
                                        {isUnread && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 ml-2" />}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex flex-1 flex-col h-full bg-muted/20">
            {!activeConversation || !activeContact ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-background rounded-full flex items-center justify-center mb-4"><MessageCircle className="h-8 w-8 text-muted-foreground"/></div>
                    <h3 className="text-lg font-medium text-foreground mb-2">Communication Unifiée</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm">Gérez toutes vos conversations depuis un seul endroit</p>
                    <div className="mt-6 text-left text-sm text-muted-foreground space-y-2">
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> WhatsApp Business</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Facebook Messenger</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> Instagram Direct</p>
                        <p className="flex items-center gap-2"><Check className="h-4 w-4 text-green-500"/> LinkedIn Messages</p>
                    </div>
                </div>
            ) : (
                <>
                    {/* Chat Header */}
                    <div className="flex items-center gap-4 border-b p-4 bg-background">
                        <Avatar><AvatarImage src={activeContact.avatarUrl} alt={activeContact.name} data-ai-hint={activeContact.isGroup ? "group chat" : "person face"} /><AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback></Avatar>
                        <div>
                            <h3 className="font-semibold">{activeContact.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1.5">{!activeContact.isGroup && (<><span className={cn("h-2 w-2 rounded-full", activeContact.isOnline ? 'bg-green-500' : 'bg-gray-400')} />{activeContact.isOnline ? 'En ligne' : 'Hors ligne'}</>)}{activeContact.isGroup && `${activeConversation.userIds.length} membres`}</p>
                        </div>
                        <div className="ml-auto flex gap-2">
                            <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedConversationId(null)}><X className="h-5 w-5" /><span className="sr-only">Fermer la conversation</span></Button>
                        </div>
                    </div>
                    {/* Messages */}
                    <ScrollArea className="flex-1" ref={scrollAreaRef}><div className="p-6 space-y-4">{activeConversation.messages.map((message) => {
                        const sender = users[message.senderId] || currentUser;
                        return (<div key={message.id} className={cn("flex items-start gap-3", message.senderId === currentUser.id ? "justify-end" : "justify-start")}>
                            {message.senderId !== currentUser.id && (<Avatar className="h-8 w-8"><AvatarImage src={sender.avatarUrl} alt={sender.name} data-ai-hint="person face" /><AvatarFallback>{sender.name.charAt(0)}</AvatarFallback></Avatar>)}
                            <div className={cn("max-w-[75%] rounded-lg p-3 shadow-sm", message.senderId === currentUser.id ? "bg-primary text-primary-foreground rounded-br-none" : "bg-card rounded-bl-none")}>
                                <p className="text-sm break-words">{message.text}</p>
                                <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
                            </div>
                        </div>)
                    })}</div></ScrollArea>
                    {/* Input Form */}
                    <div className="border-t p-4 bg-background"><form onSubmit={handleSendMessage} className="flex items-center gap-2">
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground"><Paperclip className="h-5 w-5" /></Button>
                        <Popover><PopoverTrigger asChild><Button type="button" variant="ghost" size="icon" className="text-muted-foreground"><Smile className="h-5 w-5" /></Button></PopoverTrigger><PopoverContent className="w-auto p-2"><div className="grid grid-cols-6 gap-1">{EMOJIS.map(emoji => (<button key={emoji} type="button" className="text-2xl p-1 rounded-md hover:bg-muted" onClick={() => setNewMessage(m => m + emoji)}>{emoji}</button>))}</div></PopoverContent></Popover>
                        <Input value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Écrivez votre message..." autoComplete="off" className="flex-1" />
                        <Button type="submit" size="icon" disabled={!newMessage.trim()}><Send className="h-5 w-5" /></Button>
                    </form></div>
                </>
            )}
        </div>
    </div>
  );
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <>
            <Button 
                className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-40 text-white animate-bounce-gentle hover:animate-none"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
                <span className="sr-only">Ouvrir le chat</span>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">5</div>
            </Button>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="w-[90vw] max-w-5xl h-[85vh] p-0 gap-0 overflow-hidden modal-enter">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Chat</DialogTitle>
                        <DialogDescription>Gérez toutes vos communications.</DialogDescription>
                    </DialogHeader>
                    <ChatPage />
                </DialogContent>
            </Dialog>
        </>
    )
}
