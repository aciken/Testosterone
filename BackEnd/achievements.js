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
    name: '300',
    description: 'Reach a testosterone score of 300.',
    criteria: {
      type: 't_score',
      score: 300,
    },
  },
  '3': {
    id: '3',
    name: 'T-Level 500',
    description: 'Reach a testosterone score of 500.',
    criteria: {
      type: 't_score',
      score: 500,
    },
  },
  '4': {
    id: '4',
    name: '1000',
    description: 'Reach a testosterone score of 1000.',
    criteria: {
      type: 't_score',
      score: 1000,
    },
  },
  '5': {
    id: '5',
    name: 'Streak Master',
    description: 'Reach a 10-day streak.',
    criteria: {
      type: 'streak',
      days: 10,
    },
  },
  // '8': {
  //   id: '8',
  //   name: 'Peak Performance',
  //   description: 'Reach +8 ng/dl in a single day.',
  //   criteria: {
  //     type: 'ngdl_score',
  //     score: 8,
  //   },
  // },
  '9': {
    id: '9',
    name: 'Exercise Bronze',
    description: 'Complete 10 days of exercise.',
    criteria: {
      type: 'exercise',
      days: 1,
    },
  },
  '10': {
    id: '10',
    name: 'Exercise Gold',
    description: 'Complete 30 days of exercise.',
    criteria: {
      type: 'exercise',
      days: 30,
    },
  },
  '11': {
    id: '11',
    name: 'Exercise Diamond',
    description: 'Complete 60 days of exercise.',
    criteria: {
      type: 'exercise',
      days: 60,
    },
  },
  '12': {
    id: '12',
    name: 'Sun Bronze',
    description: 'Spend 5 hours in the sun.',
    criteria: {
      type: 'sun_exposure',
      minutes: 300, // 5 hours
    },
  },
  '13': {
    id: '13',
    name: 'Sun Gold',
    description: 'Spend 10 hours in the sun.',
    criteria: {
      type: 'sun_exposure',
      minutes: 600, // 10 hours
    },
  },
  '14': {
    id: '14',
    name: 'Sun Diamond',
    description: 'Spend 20 hours in the sun.',
    criteria: {
      type: 'sun_exposure',
      minutes: 1200, // 20 hours
    },
  },
  '15': {
    id: '15',
    name: 'Sleep Bronze',
    description: 'Complete 10 days of sleep.',
    criteria: {
      type: 'sleep',
      days: 1,
    },
  },
  '16': {
    id: '16',
    name: 'Sleep Gold',
    description: 'Complete 30 days of sleep.',
    criteria: {
      type: 'sleep',
      days: 30,
    },
  },
  '17': {
    id: '17',
    name: 'Sleep Diamond',
    description: 'Complete 60 days of sleep.',
    criteria: {
      type: 'sleep',
      days: 60,
    },
  },
};

module.exports = achievements;
