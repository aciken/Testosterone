const User = require('../User/User');
const achievements = require('../achievements');
const { calculateCurrentTScore } = require('../logic/scoreCalculator');
const { taskMap } = require('../data/programData');

function calculateExerciseDays(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  const exerciseTaskLogs = tasks.filter(t => t.taskId === '2' && (t.progress > 0 || (t.checked && t.checked.length > 0)));
  
  const uniqueDays = new Set();
  exerciseTaskLogs.forEach(task => {
    const date = new Date(task.date);
    uniqueDays.add(date.toDateString());
  });

  return uniqueDays.size;
}

function calculateTotalSunExposure(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }
  // The task 'Time spent in the sun' has id: '1'
  const sunTaskLogs = tasks.filter(t => t.taskId === '1' && t.progress > 0);
  
  const totalMinutes = sunTaskLogs.reduce((sum, task) => sum + task.progress, 0);
  
  return totalMinutes;
}

function calculateSleepDays(tasks) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }
  
  // The task 'Sleep' has id: '4'. A good sleep is considered >= 7 hours.
  const sleepTaskLogs = tasks.filter(t => t.taskId === '4' && t.progress >= 87.5);
  
  const uniqueDays = new Set();
  sleepTaskLogs.forEach(task => {
    const date = new Date(task.date);
    uniqueDays.add(date.toDateString());
  });
  
  return uniqueDays.size;
}

/**
 * Checks if a task is "meaningfully completed" to qualify for advancing a streak.
 * @param {object} task - The task object from the database.
 * @returns {boolean} - True if the task qualifies for a streak.
 */
function isTaskQualifyingForStreak(task) {
  if (!task || !task.taskId) return false;
  
  const taskDefinition = taskMap[task.taskId];
  if (!taskDefinition) return false;

  switch (task.taskId) {
    case '1': // Sun Exposure: Must reach the goal.
      return task.progress >= 100;
    case '2': // Weight Training: Any progress counts.
      return task.progress > 0;
    case '3': // Eat a meal: Must have at least one healthy meal (score >= 75)
      return task.history && task.history.some(meal => meal.value >= 75);
    case '4': // Sleep: Must be at least 7 hours (goal is 8, so >= 87.5% progress)
      return task.progress >= 87.5;
    case '5': // Supplements: All 4 must be checked.
      return task.checked && task.checked.length === 4;
    
    // Inverted Tasks (Dont's)
    case 'd1': // Masturbation
      return task.progress < 50; // Qualifies if they did NOT do it
    case 'd2': // Stress Level
      const stressValue = (task.progress / 100) * taskDefinition.maxValue;
      return stressValue < taskDefinition.goal;
    case 'd3': // Alcohol Consumption
      const alcoholValue = (task.progress / 100) * taskDefinition.maxValue;
      return alcoholValue < taskDefinition.goal;
      
    default:
      return false;
  }
}

function calculateStreakForTask(tasks, taskId) {
  if (!tasks || tasks.length === 0) {
    return 0;
  }

  // Filter for tasks that are for the specific taskId, are meaningfully completed, and sort by date descending
  const sortedTasks = tasks
    .filter(t => t.taskId === taskId && isTaskQualifyingForStreak(t))
    .map(t => new Date(t.date))
    .sort((a, b) => b - a);
    
  if (sortedTasks.length === 0) {
    return 0;
  }

  // Remove duplicate dates
  const uniqueDates = [];
  const seenDates = new Set();
  for (const date of sortedTasks) {
    const dateString = date.toDateString();
    if (!seenDates.has(dateString)) {
      uniqueDates.push(date);
      seenDates.add(dateString);
    }
  }

  let streak = 0;
  let today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the most recent task is from today or yesterday
  const mostRecentDate = new Date(uniqueDates[0]);
  mostRecentDate.setHours(0, 0, 0, 0);

  const diffTime = today - mostRecentDate;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays > 1) {
    // Streak is broken if the last completed task was before yesterday
    return 0;
  }

  streak = 1;
  
  // If there's only one task, the streak is 1 (if it's today or yesterday)
  if (uniqueDates.length === 1) {
    return streak;
  }

  // Iterate through the rest of the dates to find consecutive days
  for (let i = 0; i < uniqueDates.length - 1; i++) {
    const currentDate = new Date(uniqueDates[i]);
    const previousDate = new Date(uniqueDates[i + 1]);
    currentDate.setHours(0, 0, 0, 0);
    previousDate.setHours(0, 0, 0, 0);

    const dayDifference = (currentDate - previousDate) / (1000 * 60 * 60 * 24);

    if (dayDifference === 1) {
      streak++;
    } else {
      // Found a gap, so the streak ends here
      break;
    }
  }

  return streak;
}

const calculateDietDays = (tasks) => {
  const uniqueDays = new Set();
  const healthyMealThreshold = 75; // Score for a meal to be considered healthy

  if (tasks && tasks.length > 0) {
    tasks.forEach(task => {
      // Check for a meal task
      if (task.taskId === '3' && task.history && task.history.length > 0) {
        // Check if there is at least one healthy meal on this day
        const hasHealthyMeal = task.history.some(meal => meal.value >= healthyMealThreshold);
        
        if (hasHealthyMeal) {
          // Use the task's main date, as individual meals don't have timestamps
          const date = new Date(task.date).toISOString().split('T')[0];
          uniqueDays.add(date);
        }
      }
    });
  }
  return uniqueDays.size;
};

function calculateSupplementationDays(tasks) {
  const uniqueDays = new Set();
  if (tasks && tasks.length > 0) {
    // The task 'Take your supplements' has id: '5'
    const supplementationTasks = tasks.filter(t => t.taskId === '5');

    supplementationTasks.forEach(task => {
      // A day is complete if the 'checked' array contains all 4 supplement IDs.
      if (task.checked && task.checked.length === 4) {
        const date = new Date(task.date).toISOString().split('T')[0];
        uniqueDays.add(date);
      }
    });
  }
  return uniqueDays.size;
}

const checkAndAwardAchievements = async (userId, dailyNgDl = 0) => {
  try {
    console.log(`[achievementChecker] --- Checking achievements for userId: ${userId}`);
    console.log(`[achievementChecker] Current ng/dl score for today: ${dailyNgDl}`);
    const user = await User.findById(userId);
    if (!user) {
      console.log('[achievementChecker] User not found.');
      return null;
    }
    console.log(`[achievementChecker] Found user: ${user.name}. User has ${user.tasks.length} tasks.`);


    const newAchievements = [];
    const exerciseDays = calculateExerciseDays(user.tasks);
    const totalSunMinutes = calculateTotalSunExposure(user.tasks);
    const sleepDays = calculateSleepDays(user.tasks);
    const dietDays = calculateDietDays(user.tasks);
    const supplementationDays = calculateSupplementationDays(user.tasks);
    const currentTScore = calculateCurrentTScore(user);
    console.log(`[achievementChecker] Calculated exercise days: ${exerciseDays}`);
    console.log(`[achievementChecker] Calculated total sun exposure: ${totalSunMinutes} minutes`);
    console.log(`[achievementChecker] Calculated sleep days: ${sleepDays}`);
    console.log(`[achievementChecker] Calculated T-Score: ${currentTScore}`);

    for (const key in achievements) {
      const achievement = achievements[key];

      // Handle streak-based achievements - NOTE: This might need adjustment with per-task streaks
      if (achievement.criteria.type === 'streak') {
        // This logic is now likely incorrect as streaks are per-task.
        // For now, this part of the check is effectively disabled.
        // A new mechanism will be needed if global streak achievements are desired.
      }

      // Handle the "first task" achievement
      if (achievement.criteria.type === 'first_task') {
        console.log(`[achievementChecker] Checking 'first_task' achievement: ${achievement.name}`);
        
        // Check for any task with progress > 0 OR checklist > 0
        // Also need to check if the user has completed any inverted task successfully (e.g. progress < 50 for inverted)
        const hasCompletedTask = user.tasks.some(t => {
            const taskDef = taskMap[t.taskId];
            if (!taskDef) return false;

            if (taskDef.inverted) {
                // For inverted tasks, usually progress < goal is success, but here we just want to see if they logged *something*
                // But 'first victory' usually implies a positive action.
                // If we stick to the original logic: progress > 0 is usually for 'Do' tasks.
                
                // If it's inverted (Don't), progress 0 IS success (didn't do it).
                // So if they have an entry for an inverted task with low progress, that's a "task done".
                return t.progress < 50; 
            } else {
                // Regular tasks
                return t.progress > 0 || (t.checked && t.checked.length > 0);
            }
        });

        console.log(`[achievementChecker] Does user have any completed tasks? ${hasCompletedTask}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);
        
        if (hasCompletedTask && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle ng/dl score achievements
      if (achievement.criteria.type === 'ngdl_score') {
        console.log(`[achievementChecker] Checking 'ngdl_score' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);

        if (dailyNgDl >= achievement.criteria.score && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle t_score achievements
      if (achievement.criteria.type === 't_score') {
        console.log(`[achievementChecker] Checking 't_score' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);

        if (currentTScore >= achievement.criteria.score && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle exercise day count achievements
      if (achievement.criteria.type === 'exercise') {
        console.log(`[achievementChecker] Checking 'exercise' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);
        
        if (exerciseDays >= achievement.criteria.days && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle sun exposure achievements
      if (achievement.criteria.type === 'sun_exposure') {
        console.log(`[achievementChecker] Checking 'sun_exposure' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);
        
        if (totalSunMinutes >= achievement.criteria.minutes && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle sleep achievements
      if (achievement.criteria.type === 'sleep') {
        console.log(`[achievementChecker] Checking 'sleep' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);
        
        if (sleepDays >= achievement.criteria.days && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle diet achievements
      if (achievement.criteria.type === 'diet') {
        console.log(`[achievementChecker] Checking 'diet' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);
        
        if (dietDays >= achievement.criteria.days && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }

      // Handle supplementation achievements
      if (achievement.criteria.type === 'supplementation') {
        console.log(`[achievementChecker] Checking 'supplementation' achievement: ${achievement.name}`);
        const hasUnlocked = user.unlockedAchievements.includes(achievement.id);
        console.log(`[achievementChecker] Has user already unlocked this? ${hasUnlocked}`);
        
        if (supplementationDays >= achievement.criteria.days && !hasUnlocked) {
          console.log(`[achievementChecker] !!! Awarding achievement: ${achievement.name}`);
          user.unlockedAchievements.push(achievement.id);
          newAchievements.push(achievement);
        }
      }
    }

    if (newAchievements.length > 0) {
      console.log('[achievementChecker] Saving user with new achievements...');
      await user.save();
    }
    
    console.log('[achievementChecker] --- Finished checking. New achievements found:', JSON.stringify(newAchievements, null, 2));
    return { newAchievements, exerciseDays, totalSunMinutes, sleepDays, dietDays, supplementationDays };
  } catch (error) {
    console.error('Error checking achievements:', error);
    return null;
  }
};

module.exports = { checkAndAwardAchievements, calculateStreakForTask, isTaskQualifyingForStreak };
