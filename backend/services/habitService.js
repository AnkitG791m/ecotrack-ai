const ValidationError = require('../utils/errors/ValidationError');
const NotFoundError = require('../utils/errors/NotFoundError');
const HabitDTO = require('../dto/HabitDTO');

const defaultHabitNames = [
  'Carry reusable water bottle',
  'Refuse plastic shopping bags',
  'Walk or bicycle for short trips',
  'Turn off idle switches & standby devices',
  'Separate trash for recycling'
];

class HabitService {
  constructor(habitRepository, userRepository, logger) {
    this.habitRepository = habitRepository;
    this.userRepository = userRepository;
    this.logger = logger;
  }

  async getHabits(userId) {
    let habits = await this.habitRepository.find({ user: userId });

    if (habits.length === 0) {
      const habitsToCreate = defaultHabitNames.map(name => ({
        user: userId,
        name,
        completedDates: [],
        streak: 0
      }));
      await this.habitRepository.insertMany(habitsToCreate);
      habits = await this.habitRepository.find({ user: userId });
      this.logger.info(`Auto-seeded default habits for user: ${userId}`);
    }

    return HabitDTO.fromEntities(habits);
  }

  async toggleHabit(userId, habitId, date) {
    if (!habitId || !date) {
      throw new ValidationError('Habit ID and date are required');
    }

    const habit = await this.habitRepository.findOne({ _id: habitId, user: userId });
    if (!habit) {
      throw new NotFoundError('Habit not found');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

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

    await this.habitRepository.save(habit);
    await this.userRepository.save(user);

    this.logger.info(`Habit ${habitId} toggled for user ${userId} on date ${date}`);

    return {
      completed,
      pointsEarned,
      streak: habit.streak,
      user: {
        points: user.points,
        carbonSaved: user.carbonSaved,
        badges: user.badges
      }
    };
  }
}

// Dependency Injection Composition
const habitRepository = require('../repositories/habitRepository');
const userRepository = require('../repositories/userRepository');
const logger = require('../utils/logger');

module.exports = new HabitService(habitRepository, userRepository, logger);
module.exports.HabitService = HabitService;
