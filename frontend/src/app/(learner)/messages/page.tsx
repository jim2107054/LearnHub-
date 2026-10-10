'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Send,
  MoreVertical,
  ShieldAlert,
  UserX,
  Search,
  CheckCheck,
  Loader2,
  Clock,
  User as UserIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Message {
  id: string;
  sender_id: string;
  text: string;
  created_at: string;
}

interface Conversation {
  id: string;
  contact_name: string;
  contact_role: string;
  avatar_url?: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  messages: Message[];
}

export default function DirectMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: 'conv_1',
      contact_name: 'Alex Johnson',
      contact_role: 'Instructor • Cloud Architecture',
      last_message: 'Feel free to share your repo link when ready!',
      last_message_at: '2026-03-28T10:15:00Z',
      unread_count: 1,
      messages: [
        {
          id: 'm1',
          sender_id: 'usr_me',
          text: 'Hi Alex, quick question about Section 2: does pgpool-II handle automatic primary promotion if the primary instance fails?',
          created_at: '2026-03-28T10:05:00Z',
        },
        {
          id: 'm2',
          sender_id: 'conv_1',
          text: 'Great question! Yes, pgpool triggers a failover script that promotes a standby replica using pg_promote().',
          created_at: '2026-03-28T10:12:00Z',
        },
        {
          id: 'm3',
          sender_id: 'conv_1',
          text: 'Feel free to share your repo link when ready!',
          created_at: '2026-03-28T10:15:00Z',
        },
      ],
    },
    {
      id: 'conv_2',
      contact_name: 'Sarah Connor',
      contact_role: 'Instructor • Full-Stack API',
      last_message: 'Your assignment solution looks very solid.',
      last_message_at: '2026-03-25T14:00:00Z',
      unread_count: 0,
      messages: [
        {
          id: 'm4',
          sender_id: 'conv_2',
          text: 'Your assignment solution looks very solid.',
          created_at: '2026-03-25T14:00:00Z',
        },
      ],
    },
  ]);

  const [activeConvId, setActiveConvId] = useState<string>('conv_1');
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [searchContact, setSearchContact] = useState('');

  // Rate limit feedback counter
  const [rateLimitWarning, setRateLimitWarning] = useState<string | null>(null);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    setIsSending(true);
    setRateLimitWarning(null);

    const newMsg: Message = {
      id: `m_${Date.now()}`,
      sender_id: 'usr_me',
      text: inputText.trim(),
      created_at: new Date().toISOString(),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              last_message: newMsg.text,
              last_message_at: newMsg.created_at,
              messages: [...c.messages, newMsg],
            }
          : c
      )
    );

    setInputText('');
    setIsSending(false);
    toast.success('Message sent');
  };

  const handleBlockUser = () => {
    if (!activeConv) return;
    toast.info(`Blocked user ${activeConv.contact_name}. They can no longer send you direct messages.`);
  };

  const handleReportUser = () => {
    if (!activeConv) return;
    toast.success(`User ${activeConv.contact_name} reported to safety moderation team.`);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight">Direct Messages</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Communicate directly with your course instructors and learning peers
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 border rounded-2xl overflow-hidden bg-card shadow-lg h-[700px]">
        {/* Left Conversations Sidebar */}
        <aside className="border-r flex flex-col bg-muted/10">
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchContact}
                onChange={(e) => setSearchContact(e.target.value)}
                className="pl-8 text-xs h-9 bg-background"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-border/60">
            {conversations.map((c) => {
              const isActive = c.id === activeConvId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveConvId(c.id);
                    setConversations((prev) =>
                      prev.map((item) => (item.id === c.id ? { ...item, unread_count: 0 } : item))
                    );
                  }}
                  className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                    isActive ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted/40'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary flex-shrink-0">
                    {c.contact_name.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-foreground truncate">{c.contact_name}</h4>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(c.last_message_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{c.last_message}</p>
                  </div>

                  {c.unread_count > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] h-5 w-5 rounded-full p-0 flex items-center justify-center">
                      {c.unread_count}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Right Active Chat Window */}
        <main className="md:col-span-2 flex flex-col justify-between bg-card">
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-xs text-primary">
                    {activeConv.contact_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{activeConv.contact_name}</h3>
                    <p className="text-[11px] text-muted-foreground">{activeConv.contact_role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReportUser}
                    className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                  >
                    <ShieldAlert className="h-3.5 w-3.5 mr-1" /> Report
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBlockUser}
                    className="text-xs text-muted-foreground hover:text-destructive h-8 px-2"
                  >
                    <UserX className="h-3.5 w-3.5 mr-1" /> Block
                  </Button>
                </div>
              </div>

              {/* Message History Stream */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {activeConv.messages.map((m) => {
                  const isMe = m.sender_id === 'usr_me';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-md rounded-2xl p-3.5 text-xs leading-relaxed shadow-sm ${
                          isMe
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-muted rounded-bl-none text-foreground'
                        }`}
                      >
                        {m.text}
                      </div>
                      <span className="text-[10px] text-muted-foreground mt-1 px-1 flex items-center gap-1">
                        {new Date(m.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isMe && <CheckCheck className="h-3 w-3 text-primary" />}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Message Compose Form */}
              <div className="p-4 border-t bg-muted/10 space-y-2">
                {rateLimitWarning && (
                  <p className="text-[11px] text-destructive">{rateLimitWarning}</p>
                )}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder={`Message ${activeConv.contact_name}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="text-xs h-10"
                  />
                  <Button type="submit" size="sm" disabled={isSending} className="gap-1.5 font-bold h-10">
                    <Send className="h-4 w-4" /> Send
                  </Button>
                </form>
                <p className="text-[10px] text-muted-foreground">
                  Direct messages are protected by platform conduct guidelines and rate limited to 10 messages/minute.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center flex-1 text-xs text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
