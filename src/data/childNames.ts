export type { ChildName } from './types';

import { islamicNames } from './names/islamic';
import { russianNames } from './names/russian';
import { japaneseNames } from './names/japanese';
import { europeanNames } from './names/european';
import { asianNames } from './names/asian';
import { otherNames } from './names/other';

export const childNames = [
  ...islamicNames,
  ...russianNames,
  ...japaneseNames,
  ...europeanNames,
  ...asianNames,
  ...otherNames,
];

export const cultures = [...new Set(childNames.map(n => n.culture))];
export const religions = [...new Set(childNames.flatMap(n => (n.religion ? [n.religion] : [])))];
export const allAttributes = [...new Set(childNames.flatMap(n => n.attributes))];
export const uniqueAttributes = [...new Set(allAttributes)];
