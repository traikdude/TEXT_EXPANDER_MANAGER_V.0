export interface ShortcutData {
  k: string; // keyword/shortcut
  e: string; // expansion
  s: string; // section/language
}

export type SectionFilter = 'all' | 'universal' | 'spanish' | 'english';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}