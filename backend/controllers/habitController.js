const Habit = require('../models/Habit');
const User = require('../models/User');

const defaultHabitNames = [
  'Carry reusable water bottle',
  'Refuse plastic shopping bags',
  'Walk or bicycle for short trips',
  'Turn off idle switches & standby devices',
  'Separate trash for recycling'
];

/**
 * Get all habits for a user (Auto-seed if empty)
 * GET /api/habits
 */
const getHabits = async (req, res) => {
  try {
    let habits = await Habit.find({ user: req.user.id });

    if (habits.length === 0) {
      const habitsToCreate = defaultHabitNames.map(name => ({
        user: req.user.id,
        name,
        completedDates: [],
        streak: 0
      }));
      await Habit.insertMany(habitsToCreate);
      habits = await Habit.find({ user: req.user.id });
    }

    res.json({ success: true, habits });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle habit completion for a specific date (YYYY-MM-DD)
 * POST /api/habits/toggle
 */
const toggleHabit = async (req, res) => {
  try {
    const { habitId, date } = req.body; // date format: 'YYYY-MM-DD'
    if (!habitId || !date) {
      return res.status(400).json({ success: false, message: 'Habit ID and date are required' });
    }

    const habit = await Habit.findOne({ _id: habitId, user: req.user.id });
    if (!habit) {
      return res.status(404).json({ success: false, message: 'Habit not found' });
    }

    const user = await User.findById(req.user.id);
    const dateIndex = habit.completedDates.indexOf(date);
    let completed = false;
    let pointsEarned = 0;

    if (dateIndex === -1) {
      // Mark as completed
      habit.completedDates.push(date);
      completed = true;
      
      // Award +10 points for habit completion
      user.points += 10;
      pointsEarned = 10;
      
      // Save carbon saved (+1kg CO2 per positive habit!)
      user.carbonSaved += 1;

      // Simple streak update
      habit.streak += 1;
    } else {
      // Remove completion
      habit.completedDates.splice(dateIndex, 1);
      completed = false;
      
      // Deduct points
      user.points = Math.max(0, user.points - 10);
      user.carbonSaved = Math.max(0, user.carbonSaved - 1);
      habit.streak = Math.max(0, habit.streak - 1);
    }

    // Award badges if applicable
    const currentBadges = new Set(user.badges);
    if (user.points >= 1000) {
      currentBadges.add('Planet Protector');
      currentBadges.add('Eco Champion');
    } else if (user.points >= 500) {
      currentBadges.add('Eco Champion');
    }
    user.badges = Array.from(currentBadges);

    await habit.save();
    await user.save();

    res.json({
      success: true,
      completed,
      pointsEarned,
      streak: habit.streak,
      user: {
        points: user.points,
        carbonSaved: user.carbonSaved,
        badges: user.badges
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHabits,
  toggleHabit
};
