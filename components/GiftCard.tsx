import React from 'react';
import { GiftIdea } from '../types';
import { Gift, Tag } from 'lucide-react';

interface GiftCardProps {
  idea: GiftIdea;
}

export const GiftCard: React.FC<GiftCardProps> = ({ idea }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <h4 className="font-bold text-gray-800 flex items-center gap-2">
          <Gift className="w-4 h-4 text-berry" />
          {idea.title}
        </h4>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-800 rounded-full whitespace-nowrap">
          {idea.priceRange}
        </span>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed">{idea.description}</p>
    </div>
  );
};