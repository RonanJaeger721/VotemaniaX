export const contestants = [
  {
    slug: 'rachel-rashyn',
    name: 'Rachel Rashyn',
    category: 'Singers',
    votes: 70,
    bio: 'A vocalist building a sound around presence, range and unmistakable stage energy.',
    featured: true,
  },
  {
    slug: 'edith-masangu',
    name: 'Edith Masangu',
    category: 'Content Creators',
    votes: 45,
    bio: 'A digital storyteller turning everyday moments into magnetic entertainment.',
  },
  {
    slug: 'maxwell-machisi',
    name: 'Maxwell Machisi',
    category: 'Singing',
    votes: 43,
    bio: 'A soulful performer with an instinct for the songs that bring a crowd together.',
  },
  {
    slug: 'ratidzo-tseriwa',
    name: 'Ratidzo Tseriwa',
    category: 'Singing',
    votes: 30,
    bio: 'A fearless emerging voice with warmth, control and a bright live presence.',
  },
  {
    slug: 'tanya-mukandi',
    name: 'Tanya Mukandi',
    category: 'Singing',
    votes: 30,
    bio: 'An expressive singer making every chorus feel personal.',
  },
  {
    slug: 'tavonga-bikiwani',
    name: 'Tavonga Bikiwani',
    category: 'Poets',
    votes: 29,
    bio: 'A spoken-word artist shaping rhythm, truth and performance into one voice.',
  },
  {
    slug: 'tapiwa-zuze',
    name: 'Tapiwa Zuze',
    category: 'Singing',
    votes: 26,
    bio: 'A developing vocalist backed by a growing fan community.',
  },
  {
    slug: 'tafadzwa-mashingaidze-creator',
    name: 'Tafadzwa Mashingaidze',
    category: 'Content Creators',
    votes: 24,
    bio: 'A creator bringing personality and momentum to every format.',
  },
  {
    slug: 'tafadzwa-mashingaidze-singer',
    name: 'Tafadzwa Mashingaidze',
    category: 'Singers',
    votes: 22,
    bio: 'A performance-led vocalist finding a distinctive lane.',
  },
];
export const currentEvent = {
  slug: 'season-one',
  name: 'VoteManiaX Season 01',
  status: 'live',
  startDate: '2026-09-01',
  endDate: '2026-09-30',
  price: 0.5,
  currency: 'USD',
  description:
    'Nine performers. One live leaderboard. The crowd decides who owns the moment.',
};
export const totalVotes = contestants.reduce(
  (sum, item) => sum + item.votes,
  0,
);
