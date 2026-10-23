'use client';

import React from 'react';
import AnimalQuiz, { AnimalQuizProps } from './AnimalQuiz';

export interface DynamicAnimalQuizProps {
  categoryId?: string;
  categoryLabel?: string;
  categoryIcon?: string;
  onClose: () => void;
  isEmbedded?: boolean;
}

export default function DynamicAnimalQuiz({ 
  categoryId, 
  categoryLabel = 'Satwa', 
  categoryIcon = '🐾', 
  onClose,
  isEmbedded = false
}: DynamicAnimalQuizProps) {
  return (
    <AnimalQuiz
      categoryId={categoryId}
      categoryLabel={categoryLabel}
      categoryIcon={categoryIcon}
      onClose={onClose}
      isEmbedded={isEmbedded}
    />
  );
}
