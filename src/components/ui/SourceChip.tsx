'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Users, MessageSquare, Terminal, AlertCircle } from 'lucide-react';

interface SourceChipProps {
  id?: string;
  title: string;
  type?: string;
  excerpt?: string;
  onClick?: () => void;
}

export function SourceChip({ id, title, type = 'DOCUMENT', excerpt, onClick }: SourceChipProps) {
  const getIcon = () => {
    switch (type.toUpperCase()) {
      case 'MEETING':
        return <Users className="w-3 h-3 text-cyan-400" />;
      case 'SLACK':
      case 'CHAT':
        return <MessageSquare className="w-3 h-3 text-purple-400" />;
      case 'GIT':
      case 'CODE':
        return <Terminal className="w-3 h-3 text-emerald-400" />;
      case 'TICKET':
        return <AlertCircle className="w-3 h-3 text-amber-400" />;
      default:
        return <FileText className="w-3 h-3 text-blue-400" />;
    }
  };

  const content = (
    <div
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-navy-850 hover:bg-navy-800 border border-slate-700/60 hover:border-cyan-500/40 text-xs text-slate-200 transition-all cursor-pointer group"
      title={excerpt || title}
    >
      {getIcon()}
      <span className="font-medium group-hover:text-cyan-300 transition-colors truncate max-w-[220px]">
        {title}
      </span>
      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider ml-0.5">
        [{type}]
      </span>
    </div>
  );

  if (id) {
    return <Link href={`/sources/${id}`}>{content}</Link>;
  }

  return content;
}
