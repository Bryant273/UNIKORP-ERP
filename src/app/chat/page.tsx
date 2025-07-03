
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Phone, Video, Search, PlusCircle, Smile, Paperclip } from 'lucide-react';
import { cn } from '@/lib/utils';

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
};

type Conversation = {
  id: string;
  userId: string;
  messages: Message[];
};

const currentUser = { id: 'user0' };

const users: Record<string, User> = {
  user1: { id: 'user1', name: 'Alice Dubois', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user2: { id: 'user2', name: 'Bruno Lemaire', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
  user3: { id: 'user3', name: 'Carine Martin', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user4: { id: 'user4', name: 'David Garcia', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
};

const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    userId: 'user1',
    messages: [
      { id: 'msg1', text: 'Bonjour Alice, tu as pu jeter un oeil au rapport financier ?', senderId: 'user0', timestamp: '10:00' },
      { id: 'msg2', text: 'Salut ! Oui, je viens de le finir. Tout semble en ordre.', senderId: 'user1', timestamp: '10:01' },
      { id: 'msg3', text: 'Parfait, merci pour ta réactivité !', senderId: 'user0', timestamp: '10:02' },
    ],
  },
  {
    id: 'conv2',
    userId: 'user2',
    messages: [
      { id: 'msg4', text: 'Salut Bruno, on se synchronise pour la démo client de demain ?', senderId: 'user0', timestamp: 'Hier' },
      { id: 'msg5', text: 'Oui, bonne idée. Je suis dispo à 14h.', senderId: 'user2', timestamp: 'Hier' },
    ],
  },
  {
    id: 'conv3',
    userId: 'user3',
    messages: [
        { id: 'msg6', text: 'N\'oublie pas la réunion marketing à 11h.', senderId: 'user3', timestamp: '09:30' }
    ]
  },
];


export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv1');
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div');
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

  const activeConversation = conversations.find(c => c.id === selectedConversationId);
  const activeContact = activeConversation ? users[activeConversation.userId] : null;

  return (
    <div className="flex h-full rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* Conversations List */}
      <div className="w-[320px] flex-shrink-0 border-r">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold tracking-tight">Conversations</h2>
            <Button variant="ghost" size="icon" className="rounded-full">
              <PlusCircle className="h-5 w-5" />
              <span className="sr-only">Nouvelle conversation</span>
            </Button>
          </div>
           <div className="p-4 border-b">
             <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Rechercher..." className="pl-8" />
              </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2">
              {conversations.map(conv => {
                const user = users[conv.userId];
                const lastMessage = conv.messages[conv.messages.length - 1];
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversationId(conv.id)}
                    className={cn(
                      'w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors hover:bg-muted',
                      selectedConversationId === conv.id && 'bg-primary/10'
                    )}
                  >
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="person face" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold">{user.name}</h3>
                            <span className="text-xs text-muted-foreground">{lastMessage?.timestamp}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{lastMessage?.text}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex flex-1 flex-col">
        {activeConversation && activeContact ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 border-b p-4">
              <Avatar>
                <AvatarImage src={activeContact.avatarUrl} alt={activeContact.name} data-ai-hint="person face" />
                <AvatarFallback>{activeContact.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{activeContact.name}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", activeContact.isOnline ? 'bg-green-500' : 'bg-gray-400')} />
                  {activeContact.isOnline ? 'En ligne' : 'Hors ligne'}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="icon"><Phone className="h-5 w-5"/></Button>
                <Button variant="ghost" size="icon"><Video className="h-5 w-5"/></Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="p-6 space-y-6">
                {activeConversation.messages.map((message) => (
                  <div key={message.id} className={cn(
                      "flex items-end gap-3",
                      message.senderId === currentUser.id ? "justify-end" : "justify-start"
                  )}>
                    {message.senderId !== currentUser.id && (
                        <Avatar className="h-8 w-8">
                            <AvatarImage src={users[message.senderId].avatarUrl} alt={users[message.senderId].name} data-ai-hint="person face"/>
                            <AvatarFallback>{users[message.senderId].name.charAt(0)}</AvatarFallback>
                        </Avatar>
                    )}
                    <div className={cn(
                        "max-w-xs md:max-w-md lg:max-w-lg rounded-xl p-3",
                        message.senderId === currentUser.id 
                            ? "bg-primary text-primary-foreground rounded-br-none" 
                            : "bg-muted rounded-bl-none"
                    )}>
                      <p className="text-sm">{message.text}</p>
                      <p className="text-xs text-right mt-1 opacity-70">{message.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Input Form */}
            <div className="border-t p-4">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                    <Smile className="h-5 w-5" />
                    <span className="sr-only">Ajouter un émoji</span>
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Écrivez votre message..."
                  autoComplete="off"
                  className="flex-1"
                />
                 <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                    <Paperclip className="h-5 w-5" />
                    <span className="sr-only">Joindre un fichier</span>
                </Button>
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-5 w-5" />
                  <span className="sr-only">Envoyer</span>
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p>Sélectionnez une conversation pour commencer à discuter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
