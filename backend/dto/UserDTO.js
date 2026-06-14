class UserDTO {
  static fromEntity(user) {
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      age: user.age,
      country: user.country,
      profilePhoto: user.profilePhoto,
      role: user.role,
      points: user.points,
      streak: user.streak,
      badges: user.badges,
      completedChallengesCount: user.completedChallengesCount,
      carbonSaved: user.carbonSaved
    };
  }
}
module.exports = UserDTO;
