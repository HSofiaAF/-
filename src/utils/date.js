/**
 * Centralized date formatting utilities for memory dates.
 * Replaces duplicated formatDate helpers across components.
 */

export const formatMemoryDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const formatTimelineDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    return d.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

export const getDicebearAvatar = (seed, style = 'bottts') => {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
};
