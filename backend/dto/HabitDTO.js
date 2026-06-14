class HabitDTO {
  static fromEntity(habit) {
    if (!habit) return null;
    return {
      _id: habit._id,
      user: habit.user,
      name: habit.name,
      completedDates: habit.completedDates,
      streak: habit.streak
    };
  }

  static fromEntities(habits) {
    if (!habits) return [];
    return habits.map(HabitDTO.fromEntity);
  }
}
module.exports = HabitDTO;
