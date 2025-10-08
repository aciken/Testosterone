const achievements = {
  '1': {
    id: '1',
    name: 'First Victory',
    description: 'Complete your first day.',
    criteria: {
      type: 'first_task',
    },
  },
  '2': {
    id: '2',
    name: 'Initiate',
    description: 'Achieve a 10-day streak.',
    criteria: {
      type: 'streak',
      days: 10,
    },
  },
  '9': {
    id: '9',
    name: 'Peak Performance',
    description: 'Reach +8 ng/dl in a single day.',
    criteria: {
      type: 'ngdl_score',
      score: 8,
    },
  },
};

module.exports = achievements;
