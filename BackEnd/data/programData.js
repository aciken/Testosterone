const programData = {};

const dailyDos = [
  { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, impact: 15 },
  { id: '2', task: 'Weight Training', type: 'simple', impact: 40 },
  { id: '3', task: 'Eat a meal', type: 'meals', impact: 25 },
  { id: '4', task: 'Sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, impact: 35 },
  { id: '5', task: 'Take your supplements', type: 'checklist', checklist: [{ id: 'c1', name: 'Zinc', done: false }, { id: 'c2', name: 'Magnesium', done: false }, { id: 'c3', name: 'Ashwagandha', done: false }, { id: 'c4', name: 'Creatine', done: false }], impact: 10 },
];

const dailyDonts = [
  { id: 'd2', task: 'Stress Level', type: 'slider', inverted: true, goal: 0, unit: 'level', maxValue: 10, step: 1, impact: 25 },
  { id: 'd3', task: 'Alcohol Consumption', type: 'slider', inverted: true, goal: 0, unit: 'drinks', maxValue: 10, step: 1, impact: 40 },
];

for (let i = 1; i <= 90; i++) {
  programData[i] = {
    dos: dailyDos,
    donts: dailyDonts,
  };
}

module.exports = programData;
