import { format, startOfWeek } from 'date-fns';

export const dateKey = (d = new Date()) => format(d, 'yyyy-MM-dd');

export const weekStartKey = (d = new Date()) => format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd');
