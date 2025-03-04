import React from 'react';
import { Exercise } from './indexdb_handler'

export function renderTypeBadge(type: Exercise['type']) {
  switch (type) {
    case 'weight':
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Weight</span>
    case 'timed':
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Timed</span>
    case 'count':
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Count</span>
  }
}

export function getDefaultCountPlaceholder(type: Exercise['type']): string {
  switch (type) {
    case 'weight':
      return '3s12r'
    case 'timed':
    case 'count':
      return '60'
  }
}

export function getDefaultCountDescription(type: Exercise['type']): string {
  switch (type) {
    case 'weight':
      return 'Format: [sets]s[reps]r (e.g., 3s12r)'
    case 'timed':
      return 'Time in seconds'
    case 'count':
      return 'Duration in seconds'
  }
}

export function formatDefaultCount(type: Exercise['type'], count: string): string {
  switch (type) {
    case 'weight': {
      const match = count.match(/(\d+)s(\d+)r/);
      if (match) {
        const [, sets, reps] = match;
        return `${sets} sets × ${reps} reps`;
      }
      return count;
    }
    case 'timed':
    case 'count': {
      const seconds = parseInt(count);
      if (!isNaN(seconds)) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        if (minutes > 0) {
          return `${minutes}min${remainingSeconds > 0 ? ` ${remainingSeconds}s` : ''}`;
        }
        return `${seconds}s`;
      }
      return count;
    }
  }
} 