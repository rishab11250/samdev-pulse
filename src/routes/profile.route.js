import { Router } from 'express';
import {
  renderBackground,
  renderHeader,
  renderCardWithStats,
  calculateCardWidth,
  calculateCardX,
  wrapSvg,
  setTheme,
  LAYOUT,
  renderTrophyRow,
} from '../renderers/svg.renderer.js';
import { renderContributionChart, generateFakeContributionData, renderDonutChart } from '../renderers/chart.renderer.js';
import { getGitHubUserData } from '../services/github.service.js';
import { getContributionData } from '../services/github-graphql.service.js';
import { getLeetCodeData } from '../services/leetcode.service.js';
import { getCodeforcesData } from '../services/codeforces.service.js';
import { getCodeChefData } from '../services/codechef.service.js';
import { renderCPSection } from '../renderers/cp-section.renderer.js';
import { logApiAccess } from '../utils/logger.js';

const router = Router();

// default fallback username
const DEFAULT_USERNAME = process.env.DEFAULT_USERNAME || 'SamXop123';

// to format large numbers (e.g. 1500 -> 1.5k)
function formatNumber(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}

// calculate top languages from repos
function getTopLanguages(repos, max = 5) {
  const langCounts = {};

  repos.forEach((repo) => {
    if (repo.language) {
      langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
    }
  });

  const sorted = Object.entries(langCounts)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, max);

  return sorted;
}

// GET /api/profile?username=SamXop123&theme=dark&leetcode=username&codeforces=handle&codechef=handle
router.get('/', async (req, res) => {
  // log API access
  logApiAccess(req).catch(err => console.error('Log failed:', err.message));

  const { theme, leetcode, align, hide_trophies, codeforces, codechef } = req.query;

  // Sanitize and validate username
  const rawUsername = typeof req.query.username === 'string' ? req.query.username : '';
  const usernameRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$|^[a-zA-Z0-9]$/;

  let username;
  if (!rawUsername) {
    username = DEFAULT_USERNAME;
  } else if (!usernameRegex.test(rawUsername)) {
    const errorSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="120">
      <rect width="600" height="120" rx="10" fill="#0d1117" />
      <text x="300" y="50" font-family="Arial" font-size="16" fill="#f87171" text-anchor="middle" font-weight="bold">
        ⚠ Invalid GitHub Username
      </text>
      <text x="300" y="78" font-family="Arial" font-size="12" fill="#8b949e" text-anchor="middle">
        Usernames must be 1–39 characters, alphanumeric or hyphens only,
      </text>
      <text x="300" y="98" font-family="Arial" font-size="12" fill="#8b949e" text-anchor="middle">
        and cannot start or end with a hyphen.
      </text>
    </svg>`;
    res.setHeader('Content-Type', 'image/svg+xml');
    return res.status(400).send(errorSvg);
  } else {
    username = rawUsername;
  }

  // theme (default is dark)
  setTheme(theme || 'dark');

  // check if LeetCode is explicitly disabled
  const leetcodeDisabled = leetcode === 'false';
  const shouldRenderLeetCode = Boolean(leetcode && !leetcodeDisabled);
  const showRepositoryStats = !shouldRenderLeetCode;
  const hideTrophies = hide_trophies === 'true';

  // alignment
  const validAlignments = ['left', 'center', 'right'];
  const headerAlign = validAlignments.includes(align) ? align : 'left';

  // fetch github data
  const result = await getGitHubUserData(username);
  if (!result.success) {
    return res.status(500).json({ error: result.error });
  }
  const { data } = result;

  // fetch contribution data for streaks
  const contributionResult = await getContributionData(username);
  const contributionData = contributionResult.success ? contributionResult.data : null;

  // fetch all platform data in parallel
  const [leetcodeResult, codeforcesResult, codechefResult] = await Promise.all([
    shouldRenderLeetCode ? getLeetCodeData(leetcode) : null,
    codeforces ? getCodeforcesData(codeforces) : null,
    codechef ? getCodeChefData(codechef) : null,
  ]);

  const leetcodeData = leetcodeResult?.success ? leetcodeResult.data : null;
  const codeforcesData = codeforcesResult?.success ? codeforcesResult.data : null;
  const codechefData = codechefResult?.success ? codechefResult.data : null;

  // count active CP platforms
  const cpPlatforms = [
    shouldRenderLeetCode ? leetcodeData : null,
    codeforcesData,
    codechefData,
  ].filter(Boolean).length;

  const showCPSection = cpPlatforms >= 2;

  const width = LAYOUT.width;
  const cardWidth = calculateCardWidth(3);
  const cardHeight = 140;
  const row1Y = 95;

  // Row 2
  const row2Y = row1Y + cardHeight + LAYOUT.cardGap;
  const chartWidth = calculateCardWidth(2) + LAYOUT.cardGap / 2;
  const row2CardWidth = calculateCardWidth(2) - LAYOUT.cardGap / 2;
  const row2Height = 200;

  const fullWidth = width - (LAYOUT.padding * 2);

  // Card 1: github activity
  const card1Title = 'GitHub Activity';
  const card1Stats = [
    { label: 'Contributions', value: contributionData ? formatNumber(contributionData.totalContributions) : '-' },
    { label: 'PRs Opened', value: contributionData ? formatNumber(contributionData.totalPRs) : '-' },
    { label: 'Issues Opened', value: contributionData ? formatNumber(contributionData.totalIssues) : '-' },
  ];

  // Card 2: streak stats
  const streakStats = [
    { label: 'Current', value: contributionData ? formatNumber(contributionData.currentStreak) : '-' },
    { label: 'Longest', value: contributionData ? formatNumber(contributionData.longestStreak) : '-' },
    { label: 'Total', value: contributionData ? formatNumber(contributionData.totalContributionDays) : '-' },
  ];

// Card 3: adaptive based on CP platforms
  let card3Title;
  let card3Stats;

  if (!codeforcesData && !codechefData) {
    if (showRepositoryStats) {
      card3Title = 'Repository Stats';
      card3Stats = [
        { label: 'Repositories', value: formatNumber(data.publicRepos) },
        { label: 'Stars', value: formatNumber(data.totalStars) },
        { label: 'Followers', value: formatNumber(data.followers) },
      ];
    } else {
      const getRatingOrRanking = () => {
        if (!leetcodeData) return { label: 'Rating', value: '-' };
        if (leetcodeData.contestRating) return { label: 'Rating', value: String(leetcodeData.contestRating) };
        return { label: 'Rank', value: formatNumber(leetcodeData.ranking) };
      };
      const getEMHStats = () => {
        if (!leetcodeData) return { label: 'E/M/H', value: '-', isVertical: false };
        return { label: 'E/M/H', isVertical: true, easy: leetcodeData.easySolved, medium: leetcodeData.mediumSolved, hard: leetcodeData.hardSolved };
      };
      card3Title = leetcodeData ? 'LeetCode Stats' : 'Competitive Coding';
      card3Stats = [
        { label: 'Solved', value: leetcodeData ? formatNumber(leetcodeData.totalSolved) : '-' },
        getEMHStats(),
        getRatingOrRanking(),
      ];
    }
  } else if (!showCPSection) {
    if (codeforcesData) {
      const rank = codeforcesData.rank ?? 'unrated';
      const shortRank = rank.split(' ').map(w => w[0].toUpperCase() + w.slice(1, 3)).join('.');
      card3Title = 'Codeforces Stats';
      card3Stats = [
        { label: 'Rating', value: String(codeforcesData.rating) },
        { label: 'Rank', value: shortRank },
        { label: 'Max Rating', value: String(codeforcesData.maxRating) },
      ];
    } else {
      card3Title = 'CodeChef Stats';
      card3Stats = [
        { label: 'Rating', value: String(codechefData.currentRating) },
        { label: 'Stars', value: codechefData.stars },
        { label: 'Highest', value: String(codechefData.highestRating) },
      ];
    }
  } else {
    card3Title = 'Repository Stats';
    card3Stats = [
      { label: 'Repositories', value: formatNumber(data.publicRepos) },
      { label: 'Stars', value: formatNumber(data.totalStars) },
      { label: 'Followers', value: formatNumber(data.followers) },
    ];
  }

  // contribution chart data
  let chartData;
  if (contributionData && contributionData.days && contributionData.days.length > 0) {
    const recentDays = contributionData.days.slice(-30);
    chartData = recentDays.map(day => day.count);
  } else {
    chartData = generateFakeContributionData(30);
  }

  // top languages
  const topLanguages = getTopLanguages(data.repos, 5);

  // trophy data
  const trophyData = {
    commits: contributionData?.totalContributions || 0,
    prs: contributionData?.totalPRs || 0,
    issues: contributionData?.totalIssues || 0,
    repos: data.publicRepos || 0,
    stars: data.totalStars || 0,
    followers: data.followers || 0,
    reviews: contributionData?.totalReviews || 0,
  };

  // build SVG content
  // Row 3: CP section (before trophies), Row 4: trophies
  const cpSectionHeight = showCPSection ? 240 : 0;
  const cpRowY = row2Y + row2Height + LAYOUT.cardGap;
  const trophyRowY = showCPSection
    ? cpRowY + cpSectionHeight + LAYOUT.cardGap
    : row2Y + row2Height + LAYOUT.cardGap;
  const trophyRowHeight = 165;

  const totalHeight = hideTrophies
    ? showCPSection
      ? cpRowY + cpSectionHeight + LAYOUT.padding
      : row2Y + row2Height + LAYOUT.padding
    : trophyRowY + trophyRowHeight + LAYOUT.padding;

  const content = [
    renderBackground(width, totalHeight),
    renderHeader({
      x: LAYOUT.padding,
      y: 52,
      title: `${data.name || username}'s Dashboard`,
      subtitle: data.bio ? (data.bio.length > 60 ? data.bio.slice(0, 60) + '...' : data.bio) : `@${username}`,
      avatarUrl: data.avatarDataUri || data.avatarUrl,
      align: headerAlign,
    }),

    // Row 1: stat cards
    renderCardWithStats({ x: calculateCardX(0, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: card1Title, stats: card1Stats }),
    renderCardWithStats({ x: calculateCardX(1, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: 'Streak Stats', stats: streakStats }),
    renderCardWithStats({ x: calculateCardX(2, cardWidth), y: row1Y, width: cardWidth, height: cardHeight, title: card3Title, stats: card3Stats }),

    // Row 2: contribution chart + top languages
    renderContributionChart({ x: LAYOUT.padding, y: row2Y, width: chartWidth, height: row2Height, title: 'Contribution Activity', data: chartData }),
    renderDonutChart({ x: LAYOUT.padding + chartWidth + LAYOUT.cardGap, y: row2Y, width: row2CardWidth, height: row2Height, title: 'Top Languages', data: topLanguages }),

    // Row 3: CP section (only when 2+ platforms)
    showCPSection
      ? renderCPSection({
          x: LAYOUT.padding,
          y: cpRowY,
          width: fullWidth,
          leetcode: shouldRenderLeetCode ? leetcodeData : null,
          codeforces: codeforcesData,
          codechef: codechefData,
        })
      : '',

    // Row 4: trophy row
    hideTrophies
      ? ''
      : renderTrophyRow({
          x: LAYOUT.padding,
          y: trophyRowY,
          width: fullWidth,
          height: trophyRowHeight,
          data: trophyData,
        }),
  ].join('\n');

  const svg = wrapSvg(content, width, totalHeight);

  res.setHeader('Content-Type', 'image/svg+xml');
  res.setHeader('Cache-Control', 'public, max-age=1800');
  res.send(svg);
});

export default router;