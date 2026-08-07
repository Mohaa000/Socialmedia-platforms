const bcrypt = require('bcryptjs');
const { pool } = require('./db');

// Presence of this account marks the DB as already seeded, so this only ever runs once.
const SEED_MARKER_USERNAME = 'usiu_events';

const SEED_USERS = [
  { username: 'usiu_events', displayName: 'USIU-Africa Events', bio: 'Official events & announcements for the USIU-Africa community.', avatarColor: '#12213A' },
  { username: 'csclub', displayName: 'CS Club', bio: 'Weekly workshops, hackathons, and all things code.', avatarColor: '#6B8CAE' },
  { username: 'libraryusiu', displayName: 'USIU Library', bio: 'Hours, resources, and quiet study spots.', avatarColor: '#7A9E7E' },
  { username: 'usiu_sports', displayName: 'USIU Sports', bio: 'Simbas athletics — scores, schedules, tryouts.', avatarColor: '#B5654B' },
  { username: 'amina_y', displayName: 'Amina Yusuf', bio: 'International Business, class of 2027.', avatarColor: '#9C6644' },
  { username: 'brian_o', displayName: 'Brian Otieno', bio: 'CS major. Probably in the library.', avatarColor: '#5B4636' },
  { username: 'grace_w', displayName: 'Grace Wanjiru', bio: 'Psychology + community outreach.', avatarColor: '#8B7355' },
  { username: 'kevin_m', displayName: 'Kevin Mwangi', bio: 'Finance major, campus radio host.', avatarColor: '#C9972E' },
];

const SEED_POSTS = [
  { username: 'usiu_events', daysAgo: 9, content: 'Career Fair this Thursday at the Freida Brown Student Center, 10am-3pm. Bring copies of your CV!' },
  { username: 'usiu_events', daysAgo: 6, content: 'Reminder: add/drop period closes this Friday. Talk to your academic advisor before then.' },
  { username: 'usiu_events', daysAgo: 2, content: 'Congrats to everyone who presented at the research symposium today — incredible work all around.' },
  { username: 'csclub', daysAgo: 8, content: 'Weekly coding workshop tonight at 6pm in the ICT Lab. Topic: intro to React. All levels welcome.' },
  { username: 'csclub', daysAgo: 5, content: 'Hackathon signups are open! Team up and build something in 24 hours. Prizes for the top 3 teams.' },
  { username: 'csclub', daysAgo: 1, content: "Huge turnout at today's workshop — thanks to everyone who came through." },
  { username: 'libraryusiu', daysAgo: 7, content: 'Extended hours start Monday: the library will be open until 2am through the end of finals week.' },
  { username: 'libraryusiu', daysAgo: 4, content: 'New study pods are now available on the 3rd floor. Book a slot at the front desk.' },
  { username: 'usiu_sports', daysAgo: 6, content: 'Huge win for the Simbas basketball team last night — 78-65 final score. Great energy from the crowd!' },
  { username: 'usiu_sports', daysAgo: 3, content: 'Football trials for the new season start next week. Sign-up sheets are at the gym front desk.' },
  { username: 'amina_y', daysAgo: 8, content: 'Just submitted my last assignment for the semester. One more exam to go!' },
  { username: 'amina_y', daysAgo: 5, content: "Anyone else's wifi in the hostel been so slow this week? Trying to submit a report and it keeps timing out." },
  { username: 'amina_y', daysAgo: 1, content: 'Group project presentation went so much better than I expected. Relief.' },
  { username: 'brian_o', daysAgo: 7, content: 'Looking for a study group for the Intro to Statistics final. Anyone in?' },
  { username: 'brian_o', daysAgo: 4, content: 'The samosas at the cafeteria today were unreal. 10/10.' },
  { username: 'brian_o', daysAgo: 2, content: 'Pulled an all-nighter finishing my algorithms assignment. Worth it though, finally got the recursion working.' },
  { username: 'grace_w', daysAgo: 9, content: "Volunteering at the community outreach this weekend — come join us if you're free Saturday morning!" },
  { username: 'grace_w', daysAgo: 6, content: 'Finally finished my capstone project presentation slides. Practicing my delivery all week.' },
  { username: 'grace_w', daysAgo: 3, content: 'Shoutout to whoever left encouraging sticky notes on the library desks this week. Made my day.' },
  { username: 'kevin_m', daysAgo: 8, content: 'Missed the shuttle again this morning. Third time this month.' },
  { username: 'kevin_m', daysAgo: 5, content: 'Study tip: the quiet floor in the library is way less crowded after 8pm.' },
  { username: 'kevin_m', daysAgo: 2, content: "New episode of the campus radio show drops tomorrow — we're covering the career fair, don't miss it." },
];

const SEED_FOLLOWS = [
  ['amina_y', 'usiu_events'], ['amina_y', 'csclub'], ['amina_y', 'grace_w'],
  ['brian_o', 'csclub'], ['brian_o', 'libraryusiu'], ['brian_o', 'usiu_events'],
  ['grace_w', 'usiu_events'], ['grace_w', 'usiu_sports'], ['grace_w', 'amina_y'],
  ['kevin_m', 'usiu_sports'], ['kevin_m', 'usiu_events'], ['kevin_m', 'brian_o'],
];

const SEED_COMMENTS = [
  { postIndex: 0, username: 'grace_w', content: 'See you all there!' },
  { postIndex: 4, username: 'kevin_m', content: 'Count me in, need a team though 👀' },
  { postIndex: 8, username: 'kevin_m', content: 'That last quarter was insane.' },
  { postIndex: 9, username: 'amina_y', content: 'Finally, been waiting for trials to open.' },
  { postIndex: 13, username: 'grace_w', content: "I'm in, that final is going to be brutal." },
  { postIndex: 17, username: 'amina_y', content: "You've got this, Grace!" },
];

async function seedIfEmpty() {
  const marker = await pool.query('SELECT id FROM users WHERE username = $1', [SEED_MARKER_USERNAME]);
  if (marker.rows.length) return;

  const passwordHash = bcrypt.hashSync(`seed-${Math.random().toString(36)}`, 10);
  const userIds = {};

  for (const u of SEED_USERS) {
    const { rows } = await pool.query(
      `INSERT INTO users (username, email, password_hash, display_name, bio, avatar_color)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [u.username, `${u.username}@seed.campuslink.local`, passwordHash, u.displayName, u.bio, u.avatarColor]
    );
    userIds[u.username] = rows[0].id;
  }

  const postIds = [];
  for (const p of SEED_POSTS) {
    const { rows } = await pool.query(
      `INSERT INTO posts (user_id, content, created_at) VALUES ($1, $2, NOW() - ($3 || ' days')::interval) RETURNING id`,
      [userIds[p.username], p.content, p.daysAgo]
    );
    postIds.push({ id: rows[0].id, author: p.username });
  }

  for (const [follower, following] of SEED_FOLLOWS) {
    await pool.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [userIds[follower], userIds[following]]
    );
  }

  const usernames = SEED_USERS.map((u) => u.username);
  for (const post of postIds) {
    const likers = usernames.filter((u) => u !== post.author && Math.random() < 0.45);
    for (const liker of likers) {
      await pool.query(
        'INSERT INTO likes (post_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [post.id, userIds[liker]]
      );
    }
  }

  for (const c of SEED_COMMENTS) {
    await pool.query('INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3)', [
      postIds[c.postIndex].id,
      userIds[c.username],
      c.content,
    ]);
  }
}

module.exports = { seedIfEmpty };
