class ChallengeDTO {
  static fromEntity(challenge) {
    if (!challenge) return null;
    return {
      _id: challenge._id,
      title: challenge.title,
      description: challenge.description,
      points: challenge.points,
      type: challenge.type,
      difficulty: challenge.difficulty
    };
  }

  static fromEntities(challenges) {
    if (!challenges) return [];
    return challenges.map(ChallengeDTO.fromEntity);
  }
}
module.exports = ChallengeDTO;
