const Habit = require('../models/Habit');
const IHabitRepository = require('./interfaces/IHabitRepository');

class HabitRepository extends IHabitRepository {
  find(query) {
    return Habit.find(query);
  }

  findOne(query) {
    return Habit.findOne(query);
  }

  async create(habitData) {
    return await Habit.create(habitData);
  }

  async insertMany(habits) {
    return await Habit.insertMany(habits);
  }

  async save(habitInstance) {
    return await habitInstance.save();
  }
}

module.exports = new HabitRepository();
