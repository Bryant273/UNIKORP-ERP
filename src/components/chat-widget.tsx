
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Send, Phone, Video, Search, PlusCircle, Smile, Paperclip, Users, User, FileImage, FileText, MessageCircle, X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

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

type ContactType = 'Client' | 'Fournisseur' | 'Interne';

type Conversation = {
  id: string;
  name?: string; // For group chats
  userIds: string[];
  messages: Message[];
  contactType?: ContactType;
};

const currentUser = { id: 'user0', name: 'Moi', avatarUrl: 'https://placehold.co/100x100.png' };

const users: Record<string, User> = {
  user0: { id: 'user0', name: 'Utilisateur Actuel', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user1: { id: 'user1', name: 'Jean Dupont', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user2: { id: 'user2', name: 'Marie Martin', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
  user3: { id: 'user3', name: 'Pierre Durand', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user4: { id: 'user4', name: 'Équipe Support', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
};

const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    userIds: ['user0', 'user1'],
    messages: [
      { id: 'msg1', text: 'Bonjour, j\'ai une question sur ma commande...', senderId: 'user1', timestamp: '14:30', isUnread: true },
    ],
    contactType: 'Client',
  },
  {
    id: 'conv2',
    userIds: ['user0', 'user2'],
    messages: [
      { id: 'msg2', text: 'Merci pour votre aide !', senderId: 'user2', timestamp: '12:15', isUnread: true },
    ],
    contactType: 'Client'
  },
  {
    id: 'conv3',
    userIds: ['user0', 'user3'],
    messages: [
        { id: 'msg3', text: 'Parfait, je vous tiens au courant', senderId: 'user0', timestamp: '11:45', isUnread: true },
    ],
    contactType: 'Fournisseur',
  },
  {
    id: 'conv4',
    name: "Équipe Support",
    userIds: ['user0', 'user4'],
    messages: [
        { id: 'msg4', text: 'Réunion prévue à 15h', senderId: 'user4', timestamp: '09:30' }
    ],
    contactType: 'Interne',
  },
];

const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🚀', '🎉', '💡', '🤔', '🔥', '💯', '✅'];

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
    } else {
        const otherUser = users[otherUserIds[0]];
        return {
            name: otherUser?.name || 'Inconnu',
            avatarUrl: otherUser?.avatarUrl || 'https://placehold.co/100x100.png',
            isGroup: false,
            isOnline: otherUser?.isOnline || false,
        };
    }
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

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-card text-card-foreground h-full">
      <div className="flex flex-1 overflow-hidden h-full">
        {/* Conversations List */}
        <div className="w-[320px] flex-shrink-0 border-r flex flex-col bg-background/50 h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold tracking-tight">Messages</h2>
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
                    className={cn(
                      'w-full text-left p-3 rounded-lg flex items-start gap-3 transition-colors hover:bg-muted',
                      selectedConversationId === conv.id && 'bg-primary/10'
                    )}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={details.avatarUrl} alt={details.name} data-ai-hint={details.isGroup ? "group chat" : "person face"} />
                      <AvatarFallback>{details.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-sm flex items-center gap-2">
                                {details.name} 
                                {conv.contactType === 'Client' && <MessageCircle className="h-3 w-3 text-blue-500"/>}
                            </h3>
                            <span className="text-xs text-muted-foreground">{lastMessage?.timestamp}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-muted-foreground truncate">{lastMessage?.senderId === currentUser.id ? 'Vous: ' : ''}{lastMessage?.text || "Aucun message"}</p>
                            {isUnread && <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 ml-2" />}
                        </div>
                        {conv.contactType && <p className="text-xs text-muted-foreground capitalize">{conv.contactType}</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex flex-1 flex-col h-full">
          {!activeConversation || !activeContact ? (
            <div className="flex-1 h-full flex flex-col items-center justify-center text-muted-foreground bg-muted/30">
                <div className="p-4 border-b w-full">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <div className="h-10 w-10 rounded-full bg-muted border flex items-center justify-center">
                                <span className="text-lg font-bold">?</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">Sélectionner une conversation</h3>
                                <p className="text-xs text-muted-foreground">Choisissez une discussion pour commencer</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="h-16 w-16 rounded-full bg-muted border flex items-center justify-center mb-4">
                        <MessageCircle className="h-8 w-8 text-muted-foreground"/>
                    </div>
                    <p>Sélectionnez une conversation pour commencer à discuter</p>
                </div>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="flex items-center gap-4 border-b p-4">
                <Avatar>
                  <AvatarImage src={activeContact.avatarUrl} alt={activeContact.name} data-ai-hint={activeContact.isGroup ? "group chat" : "person face"} />
                  <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{activeContact.name}</h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    {!activeContact.isGroup && (
                        <>
                            <span className={cn("h-2 w-2 rounded-full", activeContact.isOnline ? 'bg-green-500' : 'bg-gray-400')} />
                            {activeContact.isOnline ? 'En ligne' : 'Hors ligne'}
                        </>
                    )}
                    {activeContact.isGroup && `${activeConversation.userIds.length} membres`}
                  </p>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button variant="ghost" size="icon"><Phone className="h-5 w-5" /></Button>
                  <Button variant="ghost" size="icon"><Video className="h-5 w-5" /></Button>
                   <Button variant="ghost" size="icon" onClick={() => setSelectedConversationId(null)}>
                        <X className="h-5 w-5" />
                        <span className="sr-only">Fermer la conversation</span>
                    </Button>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 bg-muted/30" ref={scrollAreaRef}>
                <div className="p-6 space-y-4">
                  {activeConversation.messages.map((message) => {
                    const sender = users[message.senderId] || currentUser;
                    return (
                        <div key={message.id} className={cn(
                            "flex items-start gap-3",
                            message.senderId === currentUser.id ? "justify-end" : "justify-start"
                        )}>
                            {message.senderId !== currentUser.id && (
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={sender.avatarUrl} alt={sender.name} data-ai-hint="person face" />
                                    <AvatarFallback>{sender.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                            <div className={cn(
                                "max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3 shadow-sm",
                                message.senderId === currentUser.id
                                    ? "bg-primary text-primary-foreground rounded-br-none"
                                    : "bg-card rounded-bl-none"
                            )}>
                            <p className="text-sm break-words">{message.text}</p>
                            <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
                            </div>
                        </div>
                    )
                  })}
                </div>
              </ScrollArea>

              {/* Input Form */}
              <div className="border-t p-4 bg-card">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                        <Smile className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                        <div className="grid grid-cols-6 gap-1">
                            {EMOJIS.map(emoji => (
                                <button key={emoji} type="button" className="text-2xl p-1 rounded-md hover:bg-muted" onClick={() => setNewMessage(m => m + emoji)}>
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez votre message..."
                    autoComplete="off"
                    className="flex-1"
                  />
                  <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                    <Send className="h-5 w-5" />
                  </Button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <>
        <Button 
            className="fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-50 text-white"
            onClick={() => setIsOpen(!isOpen)}
        >
            {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            <span className="sr-only">Ouvrir le chat</span>
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-[90vw] max-w-xl h-[85vh] p-0 gap-0">
                <DialogHeader>
                    <DialogTitle className="sr-only">Fenêtre de discussion</DialogTitle>
                    <DialogDescription className="sr-only">
                        Consultez vos conversations et répondez à vos contacts.
                    </DialogDescription>
                </DialogHeader>
                 <ChatPage />
            </DialogContent>
        </Dialog>
        </>
    )
}
