const programData = {};

const dailyDos = [
  { id: '1', task: 'Time spent in the sun', type: 'slider', goal: 30, unit: 'minutes', maxValue: 480, step: 15, image: require('../assets/Sunrise.png'), progress: 0, impact: 15 },
  { id: '2', task: 'High-intensity workout', type: 'simple', image: require('../assets/Workout.png'), progress: 0, impact: 40 },
  { id: '3', task: 'Eat a meal', type: 'meals', image: require('../assets/Meal.png'), progress: 0, meals: [], impact: 25 },
  { id: '4', task: '8 hours of quality sleep', type: 'slider', goal: 8, unit: 'hours', maxValue: 12, step: 1, image: require('../assets/Sleep.png'), progress: 0, impact: 35 },
  { id: '5', task: 'Take your supplements', type: 'checklist', image: require('../assets/Suplements.png'), progress: 0, checklist: [{ id: 'c1', name: 'Zinc', done: false }, { id: 'c2', name: 'Magnesium', done: false }, { id: 'c3', name: 'Ashwagandha', done: false }, { id: 'c4', name: 'Creatine', done: false }], impact: 10 },
];

const dailyDonts = [
  { id: 'd1', task: 'Sugar Intake', type: 'slider', inverted: true, goal: 0, unit: 'servings', maxValue: 10, step: 1, progress: 0, image: require('../assets/Sugar.png'), impact: 30 },
  { id: 'd2', task: 'Stress Level', type: 'slider', inverted: true, goal: 0, unit: 'level', maxValue: 10, step: 1, progress: 0, image: require('../assets/Stress.png'), impact: 25 },
  { id: 'd3', task: 'Alcohol Consumption', type: 'slider', inverted: true, goal: 0, unit: 'drinks', maxValue: 10, step: 1, progress: 0, image: require('../assets/Alcohol.png'), impact: 40 },
];

const deepCopy = (tasks) => {
  return tasks.map(task => {
    const newTask = { ...task };
    if (task.meals) {
      newTask.meals = task.meals.map(meal => ({ ...meal }));
    }
    if (task.checklist) {
      newTask.checklist = task.checklist.map(item => ({ ...item }));
    }
    return newTask;
  });
};

for (let i = 1; i <= 90; i++) {
  programData[i] = {
    dos: deepCopy(dailyDos),
    donts: deepCopy(dailyDonts),
  };
}

export default programData;
