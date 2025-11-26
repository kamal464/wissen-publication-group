import { Journal } from '@prisma/client';

export interface JournalModel extends Journal {
  _count?: {
    articles: number;
  };
}

export interface CreateJournalModel {
  title: string;
  description?: string;
  issn: string;
  coverImage?: string;
  publisher?: string;
  accessType?: string;
  subjectArea?: string;
  category?: string;
  discipline?: string;
  impactFactor?: string;
}

export interface UpdateJournalModel {
  title?: string;
  description?: string;
  issn?: string;
  coverImage?: string;
  publisher?: string;
  accessType?: string;
  subjectArea?: string;
  category?: string;
  discipline?: string;
  impactFactor?: string;
}
