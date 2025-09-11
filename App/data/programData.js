const programData = {};

const dailyTasks = [
  { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, image: require('../assets/Sunrise.png'), progress: 0 },
  { id: '2', task: 'High-intensity workout', type: 'simple', image: require('../assets/Workout.png'), progress: 0 },
  { id: '3', task: 'Eat a protein-rich meal', type: 'meals', image: require('../assets/Meal.png'), progress: 0, meals: [{ id: 'm1', name: 'Breakfast', food: '' }, { id: 'm2', name: 'Lunch', food: '' }, { id: 'm3', name: 'Dinner', food: '' }] },
  { id: '4', task: '8 hours of quality sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, image: require('../assets/Sleep.png'), progress: 0 },
  { id: '5', task: 'Take your supplements', type: 'checklist', image: require('../assets/Suplements.png'), progress: 0, checklist: [{ id: 'c1', name: 'Zinc', done: false }, { id: 'c2', name: 'Magnesium', done: false }, { id: 'c3', name: 'Ashwagandha', done: false }, { id: 'c4', name: 'Creatine', done: false }] },
];

for (let i = 1; i <= 90; i++) {
  programData[i] = dailyTasks;
}

export default programData;
