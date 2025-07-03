
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

import { Send, Phone, Video, Search, PlusCircle, Smile, Paperclip, Users, User, FileImage, FileText } from 'lucide-react';
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
};

type Conversation = {
  id: string;
  name?: string; // For group chats
  userIds: string[];
  messages: Message[];
};

const currentUser = { id: 'user0', name: 'Moi', avatarUrl: 'https://placehold.co/100x100.png' };

const users: Record<string, User> = {
  user0: { id: 'user0', name: 'Utilisateur Actuel', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user1: { id: 'user1', name: 'Alice Dubois', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user2: { id: 'user2', name: 'Bruno Lemaire', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
  user3: { id: 'user3', name: 'Carine Martin', avatarUrl: 'https://placehold.co/100x100.png', isOnline: true },
  user4: { id: 'user4', name: 'David Garcia', avatarUrl: 'https://placehold.co/100x100.png', isOnline: false },
};

const initialConversations: Conversation[] = [
  {
    id: 'conv1',
    userIds: ['user0', 'user1'],
    messages: [
      { id: 'msg1', text: 'Bonjour Alice, tu as pu jeter un oeil au rapport financier ?', senderId: 'user0', timestamp: '10:00' },
      { id: 'msg2', text: 'Salut ! Oui, je viens de le finir. Tout semble en ordre.', senderId: 'user1', timestamp: '10:01' },
      { id: 'msg3', text: 'Parfait, merci pour ta réactivité !', senderId: 'user0', timestamp: '10:02' },
    ],
  },
  {
    id: 'conv2',
    userIds: ['user0', 'user2'],
    messages: [
      { id: 'msg4', text: 'Salut Bruno, on se synchronise pour la démo client de demain ?', senderId: 'user0', timestamp: 'Hier' },
      { id: 'msg5', text: 'Oui, bonne idée. Je suis dispo à 14h.', senderId: 'user2', timestamp: 'Hier' },
    ],
  },
  {
    id: 'conv3',
    name: "Projet Marketing Q3",
    userIds: ['user0', 'user1', 'user3'],
    messages: [
        { id: 'msg6', text: 'N\'oubliez pas la réunion marketing à 11h.', senderId: 'user3', timestamp: '09:30' }
    ]
  },
];

const EMOJIS = ['😀', '😂', '😍', '👍', '🙏', '🚀', '🎉', '💡', '🤔', '🔥', '💯', '✅'];

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>('conv1');
  const [newMessage, setNewMessage] = useState('');
  const [isNewConvModalOpen, setIsNewConvModalOpen] = useState(false);
  const [newConvSelectedUsers, setNewConvSelectedUsers] = useState<string[]>([]);
  const [newConvGroupName, setNewConvGroupName] = useState('');

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const handleCreateConversation = () => {
    if (newConvSelectedUsers.length === 0) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner au moins un utilisateur.', variant: 'destructive' });
      return;
    }

    if (newConvSelectedUsers.length > 1 && !newConvGroupName.trim()) {
      toast({ title: 'Erreur', description: 'Veuillez donner un nom au groupe.', variant: 'destructive' });
      return;
    }

    const newConv: Conversation = {
        id: `conv-${Date.now()}`,
        userIds: [...newConvSelectedUsers, currentUser.id],
        messages: [],
        ...(newConvSelectedUsers.length > 1 && { name: newConvGroupName })
    };
    
    setConversations(prev => [newConv, ...prev]);
    setSelectedConversationId(newConv.id);
    setIsNewConvModalOpen(false);
    setNewConvSelectedUsers([]);
    setNewConvGroupName('');
  };

  const getConversationDetails = useCallback((conv: Conversation) => {
    const otherUserIds = conv.userIds.filter(id => id !== currentUser.id);
    if (conv.name) { // Group chat
        return {
            name: conv.name,
            avatarUrl: 'https://placehold.co/100x100.png',
            isGroup: true,
            isOnline: false,
        };
    } else { // Private chat
        const otherUser = users[otherUserIds[0]];
        return {
            name: otherUser.name,
            avatarUrl: otherUser.avatarUrl,
            isGroup: false,
            isOnline: otherUser.isOnline,
        };
    }
  }, []);

  const activeConversation = conversations.find(c => c.id === selectedConversationId);
  const activeContact = activeConversation ? getConversationDetails(activeConversation) : null;

  return (
    <div className="flex flex-1 flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-[350px] flex-shrink-0 border-r flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-semibold tracking-tight">Conversations</h2>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setIsNewConvModalOpen(true)}>
              <PlusCircle className="h-5 w-5" />
              <span className="sr-only">Nouvelle conversation</span>
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
                      <AvatarImage src={details.avatarUrl} alt={details.name} data-ai-hint={details.isGroup ? "group chat" : "person face"} />
                      <AvatarFallback>{details.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 truncate">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold">{details.name}</h3>
                        <span className="text-xs text-muted-foreground">{lastMessage?.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{lastMessage?.text || "Aucun message"}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex flex-1 flex-col">
          {activeConversation && activeContact ? (
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
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 bg-muted/30" ref={scrollAreaRef}>
                <div className="p-6 space-y-6">
                  {activeConversation.messages.map((message) => {
                    const sender = users[message.senderId] || currentUser;
                    return (
                        <div key={message.id} className={cn(
                            "flex items-end gap-3",
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
                            <p className="text-sm">{message.text}</p>
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
                        <span className="sr-only">Ajouter un émoji</span>
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button type="button" variant="ghost" size="icon" className="text-muted-foreground">
                            <Paperclip className="h-5 w-5" />
                            <span className="sr-only">Joindre un fichier</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                            <FileImage className="mr-2 h-4 w-4"/> Image ou Vidéo
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
                            <FileText className="mr-2 h-4 w-4"/> Document
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => toast({ title: `Fichier "${e.target.files?.[0].name}" sélectionné.`})} />
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
      <NewConversationModal
        isOpen={isNewConvModalOpen}
        onClose={() => setIsNewConvModalOpen(false)}
        users={Object.values(users).filter(u => u.id !== currentUser.id)}
        selectedUsers={newConvSelectedUsers}
        onSelectedUsersChange={setNewConvSelectedUsers}
        groupName={newConvGroupName}
        onGroupNameChange={setNewConvGroupName}
        onCreate={handleCreateConversation}
      />
    </div>
  );
}


function NewConversationModal({ isOpen, onClose, users, selectedUsers, onSelectedUsersChange, groupName, onGroupNameChange, onCreate }: any) {
    const handleUserToggle = (userId: string) => {
        onSelectedUsersChange((prev: string[]) => 
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Nouvelle Conversation</DialogTitle>
                    <DialogDescription>
                        Sélectionnez des utilisateurs pour démarrer une conversation privée ou un groupe.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="private">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="private" onClick={() => onSelectedUsersChange([])}><User className="mr-2 h-4 w-4"/> Privée</TabsTrigger>
                        <TabsTrigger value="group" onClick={() => onSelectedUsersChange([])}><Users className="mr-2 h-4 w-4"/> Groupe</TabsTrigger>
                    </TabsList>
                    <TabsContent value="private">
                        <ScrollArea className="h-64 mt-4">
                            {users.map((user: User) => (
                                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer" onClick={() => { onSelectedUsersChange([user.id]); onCreate(); }}>
                                    <Avatar><AvatarImage src={user.avatarUrl} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                                    <span>{user.name}</span>
                                </div>
                            ))}
                        </ScrollArea>
                    </TabsContent>
                    <TabsContent value="group">
                         <div className="space-y-4 mt-4">
                             <div>
                                <Label htmlFor="groupName">Nom du groupe</Label>
                                <Input id="groupName" value={groupName} onChange={(e) => onGroupNameChange(e.target.value)} placeholder="Ex: Projet Alpha"/>
                            </div>
                            <ScrollArea className="h-56">
                                <div className="space-y-2">
                                {users.map((user: User) => (
                                    <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg">
                                        <Checkbox id={`user-${user.id}`} checked={selectedUsers.includes(user.id)} onCheckedChange={() => handleUserToggle(user.id)} />
                                        <Label htmlFor={`user-${user.id}`} className="flex items-center gap-3 cursor-pointer">
                                            <Avatar><AvatarImage src={user.avatarUrl} /><AvatarFallback>{user.name[0]}</AvatarFallback></Avatar>
                                            <span>{user.name}</span>
                                        </Label>
                                    </div>
                                ))}
                                </div>
                            </ScrollArea>
                         </div>
                    </TabsContent>
                </Tabs>
                <DialogFooter>
                   <Button variant="outline" onClick={onClose}>Annuler</Button>
                   <Button onClick={onCreate}>Créer le groupe</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
