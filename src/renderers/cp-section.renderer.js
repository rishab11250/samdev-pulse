import { getColors } from './svg.renderer.js';

function renderCPCard({ x, y, width, height, title, accentColor, stats }) {
  const colors = getColors();
  const statsContent = stats.map((stat, i) => {
    const statX = x + 20;
    const statY = y + 75 + (i * 38);
    return `
      <text x="${statX}" y="${statY}" 
        font-family="'SF Pro Display', -apple-system, sans-serif" 
        font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">
        ${stat.label}
      </text>
      <text x="${statX}" y="${statY + 18}" 
        font-family="'SF Pro Display', -apple-system, sans-serif" 
        font-size="16" font-weight="700" fill="${colors.primaryText}">
        ${stat.value}
      </text>`;
  }).join('');

  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="${height}" 
        rx="12" fill="${colors.cardBg}" 
        stroke="${colors.border}" stroke-width="1"/>
      <rect x="${x}" y="${y}" width="${width}" height="4" 
        rx="2" fill="${accentColor}"/>
      <text x="${x + 20}" y="${y + 32}" 
        font-family="'SF Pro Display', -apple-system, sans-serif" 
        font-size="13" font-weight="600" fill="${colors.secondaryText}" 
        letter-spacing="0.5">
        ${title.toUpperCase()}
      </text>
      <line x1="${x + 20}" y1="${y + 44}" x2="${x + width - 20}" y2="${y + 44}" 
        stroke="${colors.border}" stroke-width="0.5"/>
      ${statsContent}
    </g>`;
}

export function renderCPSection({ x, y, width, leetcode, codeforces, codechef }) {
  const colors = getColors();
  const platforms = [];

  if (leetcode) {
    platforms.push({
      title: 'LeetCode',
      accentColor: '#f89f1b',
      stats: [
        { label: 'Problems Solved', value: String(leetcode.totalSolved ?? 0) },
        { label: 'Easy / Medium / Hard', value: `${leetcode.easySolved ?? 0} / ${leetcode.mediumSolved ?? 0} / ${leetcode.hardSolved ?? 0}` },
        { label: 'Contest Rating', value: String(leetcode.contestRating ?? leetcode.ranking ?? 'N/A') },
      ]
    });
  }

  if (codeforces) {
    const rank = codeforces.rank ?? 'unrated';
    const shortRank = rank.split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ');
    platforms.push({
      title: 'Codeforces',
      accentColor: '#3b82f6',
      stats: [
        { label: 'Rating', value: String(codeforces.rating ?? 0) },
        { label: 'Max Rating', value: String(codeforces.maxRating ?? 0) },
        { label: 'Rank', value: shortRank },
      ]
    });
  }

  if (codechef) {
    platforms.push({
      title: 'CodeChef',
      accentColor: '#8b5cf6',
      stats: [
        { label: 'Rating', value: `${codechef.currentRating ?? 0} ${codechef.stars ?? ''}` },
        { label: 'Highest Rating', value: String(codechef.highestRating ?? 0) },
        { label: 'Global Rank', value: String(codechef.globalRank ?? 'N/A') },
      ]
    });
  }

  if (platforms.length === 0) return '';

  const cardGap = 16;
  const cardWidth = Math.floor((width - (cardGap * (platforms.length - 1))) / platforms.length);
  const cardHeight = 180;

  const cards = platforms.map((p, i) =>
    renderCPCard({
      x: x + i * (cardWidth + cardGap),
      y: y + 40,
      width: cardWidth,
      height: cardHeight,
      title: p.title,
      accentColor: p.accentColor,
      stats: p.stats,
    })
  ).join('');

  return `
    <g>
      <text x="${x}" y="${y + 16}" 
        font-family="'SF Pro Display', -apple-system, sans-serif" 
        font-size="13" font-weight="600" fill="${colors.secondaryText}" 
        letter-spacing="0.5">
        COMPETITIVE PROGRAMMING
      </text>
      <line x1="${x}" y1="${y + 24}" x2="${x + width}" y2="${y + 24}" 
        stroke="${colors.border}" stroke-width="0.5"/>
      ${cards}
    </g>`;
}