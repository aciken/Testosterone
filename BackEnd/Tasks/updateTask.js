const User = require('../User/User');

const updateTask = async (req, res) => {
  const { userId, date, task } = req.body;

  if (!userId || !date || !task || !task.id) {
    return res.status(400).send('Missing required fields.');
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send('User not found.');
    }

    const taskDate = new Date(date);
    taskDate.setHours(0, 0, 0, 0);

    const existingTaskIndex = user.tasks.findIndex(
      (t) => t.taskId === task.id && new Date(t.date).toDateString() === taskDate.toDateString()
    );

    if (existingTaskIndex > -1) {
      // Update existing task
      const taskToUpdate = user.tasks[existingTaskIndex];

      if (task.id === '3') { // meals task
        // For meals, we add to history and update progress to be the sum
        if (!taskToUpdate.history) {
          taskToUpdate.history = [];
        }
        taskToUpdate.history.push({ value: task.progress, description: task.description });
        taskToUpdate.progress = taskToUpdate.history.reduce((sum, entry) => sum + entry.value, 0);
      } else {
        // For other tasks, we overwrite
        taskToUpdate.progress = task.progress;
      }

      if (task.checked) {
        taskToUpdate.checked = task.checked;
      }
    } else {
      // Add new task
      const newTask = {
        taskId: task.id,
        date: taskDate,
        progress: task.progress,
      };

      if (task.id === '3') { // meals task
        newTask.history = [{ value: task.progress, description: task.description }];
      }

      if (task.checked) {
        newTask.checked = task.checked;
      }
      user.tasks.push(newTask);
    }

    user.markModified('tasks');
    await user.save();
    res.status(200).send({ message: 'Task updated successfully.', tasks: user.tasks });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).send('Server error.');
  }
};

module.exports = updateTask;
