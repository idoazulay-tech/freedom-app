import React, { useState } from 'react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';
import ProHubLayout from '@/components/ProHubLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Search, MessageCircle } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  clientName: string;
  content: string;
  timestamp: string;
  read: boolean;
  avatar: string;
}

const mockMessages: Message[] = [
  {
    id: 1,
    sender: 'דוד כהן',
    clientName: 'דוד כהן',
    content: 'שלום, האם יש עדכון בנוגע למקרה שלי?',
    timestamp: '2024-04-01 14:30',
    read: false,
    avatar: 'DK',
  },
  {
    id: 2,
    sender: 'שרה לוי',
    clientName: 'שרה לוי',
    content: 'תודה על העזרה, קיבלתי את ההודעה',
    timestamp: '2024-04-01 12:15',
    read: true,
    avatar: 'SL',
  },
  {
    id: 3,
    sender: 'יוסי ברק',
    clientName: 'יוסי ברק',
    content: 'כמה זמן זה יקח? אני דואג...',
    timestamp: '2024-03-31 18:45',
    read: true,
    avatar: 'YB',
  },
];

export default function ProHubMessages() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(mockMessages[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [replyText, setReplyText] = useState('');

  if (!isAuthenticated || !user) {
    setLocation('/');
    return null;
  }

  const filteredMessages = mockMessages.filter((msg) =>
    msg.clientName.includes(searchTerm) || msg.content.includes(searchTerm)
  );

  const unreadCount = mockMessages.filter((msg) => !msg.read).length;

  return (
    <ProHubLayout currentPage="messages">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">הודעות</h1>
          <div className="text-sm text-slate-400">
            {unreadCount > 0 && (
              <span className="bg-red-600 text-white px-3 py-1 rounded-full">
                {unreadCount} הודעות חדשות
              </span>
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Messages List */}
          <Card className="lg:col-span-1 bg-slate-800 border-slate-700 flex flex-col">
            <CardHeader className="pb-3">
              <div className="relative">
                <Search className="absolute right-3 top-3 w-5 h-5 text-slate-500" />
                <Input
                  placeholder="חפש הודעה..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto space-y-2">
              {filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => setSelectedMessage(msg)}
                  className={`w-full text-right p-3 rounded-lg transition-colors ${
                    selectedMessage?.id === msg.id
                      ? 'bg-blue-600'
                      : 'bg-slate-700 hover:bg-slate-600'
                  } ${!msg.read ? 'border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        !msg.read ? 'bg-blue-600' : 'bg-slate-600'
                      }`}
                    >
                      {msg.avatar}
                    </div>
                    <div className="flex-1 text-right">
                      <p className="font-medium text-white text-sm">{msg.clientName}</p>
                      <p className="text-slate-400 text-xs truncate">{msg.content}</p>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Chat View */}
          <Card className="lg:col-span-2 bg-slate-800 border-slate-700 flex flex-col">
            {selectedMessage ? (
              <>
                {/* Header */}
                <CardHeader className="border-b border-slate-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      {selectedMessage.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-white">{selectedMessage.clientName}</CardTitle>
                      <p className="text-sm text-slate-400">{selectedMessage.timestamp}</p>
                    </div>
                  </div>
                </CardHeader>

                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-blue-600 text-white p-3 rounded-lg max-w-xs">
                      <p>{selectedMessage.content}</p>
                      <p className="text-xs text-blue-200 mt-1">{selectedMessage.timestamp}</p>
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <div className="bg-slate-700 text-white p-3 rounded-lg max-w-xs">
                      <p>תודה על ההודעה, אנו בטיפול בנושא שלך</p>
                      <p className="text-xs text-slate-400 mt-1">2024-04-01 14:35</p>
                    </div>
                  </div>
                </CardContent>

                {/* Input */}
                <div className="border-t border-slate-700 p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="הקלד הודעה..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                    />
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">בחר הודעה כדי להתחיל</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProHubLayout>
  );
}
