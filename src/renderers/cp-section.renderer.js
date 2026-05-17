import { getTheme } from './svg.renderer.js';

const CARD_RADIUS = 16;
const CARD_GAP = 16;

export function renderCPSection({ x, y, width, leetcode, codeforces, codechef }) {
  const { colors } = getTheme();

  const platforms = [];

  if (leetcode) {
    platforms.push({
      title: 'LeetCode Stats',
      render: (cx, cy, cw) => renderLeetCodeCard(cx, cy, cw, leetcode, colors),
    });
  }

  if (codeforces) {
    platforms.push({
      title: 'Codeforces Stats',
      render: (cx, cy, cw) => renderCodeforcesCard(cx, cy, cw, codeforces, colors),
    });
  }

  if (codechef) {
    platforms.push({
      title: 'CodeChef Stats',
      render: (cx, cy, cw) => renderCodeChefCard(cx, cy, cw, codechef, colors),
    });
  }

  if (platforms.length === 0) return '';

  const totalGaps = (platforms.length - 1) * CARD_GAP;
  const cardWidth = (width - totalGaps) / platforms.length;
  const cardHeight = 140;

  const cards = platforms.map((platform, i) => {
    const cardX = x + i * (cardWidth + CARD_GAP);
    const cardY = y;

    return `
      <g>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="${colors.glow}" opacity="0.04" filter="url(#cardGlow)"/>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="${colors.cardBackground}"/>
        <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="url(#mainGradient)" opacity="0.3"/>
        <rect x="${cardX + 0.5}" y="${cardY + 0.5}" width="${cardWidth - 1}" height="${cardHeight - 1}"
          rx="${CARD_RADIUS}" ry="${CARD_RADIUS}"
          fill="none" stroke="${colors.borderLight}" stroke-width="1" opacity="0.4"/>
        <text
          x="${cardX + 20}" y="${cardY + 30}"
          font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
          font-size="13" font-weight="600"
          fill="${colors.secondaryText}"
          letter-spacing="0.5">${platform.title.toUpperCase()}</text>
        <rect x="${cardX + 20}" y="${cardY + 40}" width="28" height="2"
          rx="1" fill="url(#accentGradient)" opacity="0.7"/>
        ${platform.render(cardX, cardY, cardWidth)}
      </g>
    `;
  }).join('');

  return `<g>${cards}</g>`;
}

function renderLeetCodeCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const col1X = x + 20;
  const col2X = x + 20 + (width - 40) / 3;
  const col3X = x + 20 + ((width - 40) / 3) * 2;

  const solved = String(data.totalSolved ?? 0);
  const rating = String(data.contestRating ?? data.ranking ?? 'N/A');

  return `
    <text x="${col1X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${solved}</text>
    <text x="${col1X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Solved</text>

    <text x="${col2X}" y="${statsY - 18}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#10b981">E</text>
    <text x="${col2X + 14}" y="${statsY - 18}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="14" font-weight="700" fill="${colors.primaryText}">${data.easySolved ?? 0}</text>

    <text x="${col2X}" y="${statsY}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#f59e0b">M</text>
    <text x="${col2X + 14}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="14" font-weight="700" fill="${colors.primaryText}">${data.mediumSolved ?? 0}</text>

    <text x="${col2X}" y="${statsY + 18}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#ef4444">H</text>
    <text x="${col2X + 14}" y="${statsY + 18}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="14" font-weight="700" fill="${colors.primaryText}">${data.hardSolved ?? 0}</text>

    <text x="${col3X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${rating}</text>
    <text x="${col3X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>
  `;
}

function renderCodeforcesCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const col1X = x + 20;
  const col2X = x + 20 + (width - 40) / 3;
  const col3X = x + 20 + ((width - 40) / 3) * 2;

  const rankMap = {
    'newbie': 'Newbie',
    'pupil': 'Pupil',
    'specialist': 'Specialist',
    'expert': 'Expert',
    'candidate master': 'Cand.Master',
    'master': 'Master',
    'international master': 'Int.Master',
    'grandmaster': 'GM',
    'international grandmaster': 'Int.GM',
    'legendary grandmaster': 'Leg.GM',
  };

  const rankShort = rankMap[data.rank?.toLowerCase()] ?? data.rank ?? 'unrated';
  const maxRankShort = rankMap[data.maxRank?.toLowerCase()] ?? data.maxRank ?? 'unrated';

  return `
    <text x="${col1X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${data.rating}</text>
    <text x="${col1X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>

    <text x="${col2X+6}" y="${statsY - 18}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#6366f1">R</text>
    <text x="${col2X + 18}" y="${statsY - 18}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="700" fill="${colors.primaryText}">${rankShort}</text>

    <text x="${col2X+6}" y="${statsY + 2}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="600" fill="#8b5cf6">MR</text>
    <text x="${col2X + 26}" y="${statsY + 2}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" font-weight="700" fill="${colors.primaryText}">${maxRankShort}</text>

    <text x="${col3X+6}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${data.maxRating}</text>
    <text x="${col3X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Max Rating</text>
  `;
}



function renderCodeChefCard(x, y, width, data, colors) {
  const statsY = y + 85;
  const col1X = x + 20;
  const col2X = x + 20 + (width - 40) / 3;
  const col3X = x + 20 + ((width - 40) / 3) * 2;

  return `
    <!-- Current Rating -->
    <text x="${col1X}" y="${statsY}" 
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${data.currentRating}</text>
    <text x="${col1X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Rating</text>

    <!-- Stars — centered in middle column -->
    <text x="${col2X+16}" y="${statsY -8}" 
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="22" font-weight="700" fill="#f59e0b">${data.stars ?? ' 1★'}</text>
    <text x="${col2X+16}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Stars</text>

    <!-- Highest Rating -->
    <text x="${col3X}" y="${statsY}"
      font-family="'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="32" font-weight="700" fill="${colors.primaryText}">${data.highestRating}</text>
    <text x="${col3X}" y="${statsY + 20}"
      font-family="'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      font-size="11" fill="${colors.mutedText}" letter-spacing="0.3">Highest</text>
  `;
}