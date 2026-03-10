export type { ChildName } from './types';

import { islamicNames } from './names/islamic/index';
import { russianNames } from './names/russian/index';
import { japaneseNames } from './names/japanese/index';
import { europeanNames } from './names/european/index';
import { asianNames } from './names/asian/index';
import { otherNames } from './names/other/index';

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
