import { writeFile } from 'node:fs/promises';

import {
  DIGITS,
  LETTERS,
  LETTERS_WITH_UPPERCASE,
  tidyid,
} from '../dist/index.js';

const ID_COUNT = 10_000_000;
const LENGTH = 3;
const UNIFORMITY_SPAN = 1;
const idCountLabel = ID_COUNT.toLocaleString('en-US');
const letterSampleLabel = (ID_COUNT * 2).toLocaleString('en-US');

const createCounts = alphabet => new Map(
  [...alphabet].map(character => [character, 0]),
);
const letterCounts = createCounts(LETTERS);
const digitCounts = createCounts(DIGITS);
const uppercaseLetterCounts = createCounts(LETTERS_WITH_UPPERCASE);
const uppercaseDigitCounts = createCounts(DIGITS);

for (let sample = 0; sample < ID_COUNT; sample += 1) {
  const id = tidyid(LENGTH);
  letterCounts.set(id[0], letterCounts.get(id[0]) + 1);
  letterCounts.set(id[1], letterCounts.get(id[1]) + 1);
  digitCounts.set(id[2], digitCounts.get(id[2]) + 1);
}

for (let sample = 0; sample < ID_COUNT; sample += 1) {
  const id = tidyid(LENGTH, true);
  uppercaseLetterCounts.set(id[0], uppercaseLetterCounts.get(id[0]) + 1);
  uppercaseLetterCounts.set(id[1], uppercaseLetterCounts.get(id[1]) + 1);
  uppercaseDigitCounts.set(id[2], uppercaseDigitCounts.get(id[2]) + 1);
}

const frequencies = (alphabet, counts, total) => {
  const expected = total / alphabet.length;
  return [...alphabet].map(character => ({
    character,
    percent: counts.get(character) / expected * 100,
  }));
};

const letters = frequencies(LETTERS, letterCounts, ID_COUNT * 2);
const digits = frequencies(DIGITS, digitCounts, ID_COUNT);
const uppercaseLetters = frequencies(
  LETTERS_WITH_UPPERCASE,
  uppercaseLetterCounts,
  ID_COUNT * 2,
);
const uppercaseDigits = frequencies(DIGITS, uppercaseDigitCounts, ID_COUNT);

const plotPoints = (series, left, right, top, bottom, span) => series.map(
  ({ percent }, index) => ({
    x: left + index / (series.length - 1) * (right - left),
    y: top + (100 + span - percent) / (span * 2) * (bottom - top),
  }),
);

const polyline = values => values
  .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
  .join(' ');
const circles = values => values
  .map(({ x, y }) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.5"/>`)
  .join('');
const labels = (series, values, y) => series
  .map(({ character }, index) => `<text x="${values[index].x.toFixed(1)}" y="${y}">${character}</text>`)
  .join('');

const grid = (left, right, top, bottom, span) => {
  const middle = (top + bottom) / 2;
  return `
  <line class="grid" x1="${left}" y1="${top}" x2="${right}" y2="${top}"/>
  <line class="expected" x1="${left}" y1="${middle}" x2="${right}" y2="${middle}"/>
  <line class="grid" x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}"/>
  <text class="muted" x="20" y="${top + 4}">${(100 + span).toFixed(1)}%</text>
  <text class="muted" x="20" y="${middle + 4}">100%</text>
  <text class="muted" x="20" y="${bottom + 4}">${(100 - span).toFixed(1)}%</text>`;
};

const style = `
  <style>
    text { fill: #24292f; font: 12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif }
    .muted { fill: #57606a }
    .grid { stroke: #d0d7de; stroke-width: 1 }
    .expected { stroke: #57606a; stroke-width: 1; stroke-dasharray: 4 4 }
    .series { fill: none; stroke: #0969da; stroke-width: 2 }
    .point { fill: #0969da }
    @media (prefers-color-scheme: dark) {
      text { fill: #f0f6fc }
      .muted { fill: #8c959f }
      .grid { stroke: #30363d }
      .expected { stroke: #8c959f }
      .series { stroke: #58a6ff }
      .point { fill: #58a6ff }
    }
  </style>`;

const defaultSpan = UNIFORMITY_SPAN;
const letterPoints = plotPoints(letters, 54, 340, 87, 197, defaultSpan);
const digitPoints = plotPoints(digits, 394, 660, 87, 197, defaultSpan);
const defaultSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="250" viewBox="0 0 680 250" role="img" aria-labelledby="title description">
  <title id="title">TidyID character distribution with allowUppercase set to false</title>
  <desc id="description">Observed frequency as a percentage of expected uniform frequency for ${idCountLabel} calls to tidyid with length 3 and allowUppercase set to false.</desc>${style}
  <text x="20" y="24" font-size="15" font-weight="600">Observed character frequency · allowUppercase = false</text>
  <text class="muted" x="20" y="43">${idCountLabel} × tidyid(3) · expected = 100%</text>
  <text x="54" y="67" font-weight="600">Letters (lowercase) · ${letterSampleLabel} samples</text>
  <text x="394" y="67" font-weight="600">Digits · ${idCountLabel} samples</text>${grid(54, 340, 87, 197, defaultSpan)}
  <line class="grid" x1="394" y1="87" x2="660" y2="87"/>
  <line class="expected" x1="394" y1="142" x2="660" y2="142"/>
  <line class="grid" x1="394" y1="197" x2="660" y2="197"/>
  <polyline class="series" points="${polyline(letterPoints)}"/>
  <g class="point">${circles(letterPoints)}</g>
  <polyline class="series" points="${polyline(digitPoints)}"/>
  <g class="point">${circles(digitPoints)}</g>
  <g class="muted" text-anchor="middle">${labels(letters, letterPoints, 218)}${labels(digits, digitPoints, 218)}</g>
</svg>
`;

const uppercaseSpan = UNIFORMITY_SPAN;
const uppercaseLetterPoints = plotPoints(
  uppercaseLetters,
  54,
  520,
  87,
  197,
  uppercaseSpan,
);
const uppercaseDigitPoints = plotPoints(
  uppercaseDigits,
  550,
  660,
  87,
  197,
  uppercaseSpan,
);
const uppercaseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="680" height="250" viewBox="0 0 680 250" role="img" aria-labelledby="title description">
  <title id="title">TidyID character distribution with allowUppercase set to true</title>
  <desc id="description">Observed frequency as a percentage of expected uniform frequency for ${letterSampleLabel} letter samples and ${idCountLabel} digit samples from calls to tidyid with length 3 and allowUppercase set to true.</desc>${style}
  <text x="20" y="24" font-size="15" font-weight="600">Observed character frequency · allowUppercase = true</text>
  <text class="muted" x="20" y="43">${idCountLabel} × tidyid(3, true) · expected = 100%</text>
  <text x="54" y="67" font-weight="600">Letters (uppercase + lowercase) · ${letterSampleLabel} samples</text>
  <text x="535" y="67" font-weight="600">Digits · ${idCountLabel} samples</text>${grid(54, 520, 87, 197, uppercaseSpan)}
  <line class="grid" x1="550" y1="87" x2="660" y2="87"/>
  <line class="expected" x1="550" y1="142" x2="660" y2="142"/>
  <line class="grid" x1="550" y1="197" x2="660" y2="197"/>
  <polyline class="series" points="${polyline(uppercaseLetterPoints)}"/>
  <g class="point">${circles(uppercaseLetterPoints)}</g>
  <polyline class="series" points="${polyline(uppercaseDigitPoints)}"/>
  <g class="point">${circles(uppercaseDigitPoints)}</g>
  <g class="muted" text-anchor="middle" style="font-size:11px">${labels(uppercaseLetters, uppercaseLetterPoints, 218)}${labels(uppercaseDigits, uppercaseDigitPoints, 218)}</g>
</svg>
`;

await Promise.all([
  writeFile(new URL('../docs/media/uniformity-default.svg', import.meta.url), defaultSvg),
  writeFile(
    new URL('../docs/media/uniformity-allow-uppercase.svg', import.meta.url),
    uppercaseSvg,
  ),
]);

const maximumDeviation = series => Math.max(
  ...series.map(({ percent }) => Math.abs(percent - 100)),
);
console.log(JSON.stringify({
  idsPerMode: ID_COUNT,
  defaultMode: {
    letterSamples: ID_COUNT * 2,
    digitSamples: ID_COUNT,
    maximumDeviation: maximumDeviation(letters.concat(digits)),
  },
  allowUppercaseMode: {
    letterSamples: ID_COUNT * 2,
    digitSamples: ID_COUNT,
    maximumDeviation: maximumDeviation(
      uppercaseLetters.concat(uppercaseDigits),
    ),
  },
}, null, 2));
