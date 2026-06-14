class CarbonReportDTO {
  static fromEntity(report) {
    if (!report) return null;
    return {
      _id: report._id,
      user: report.user,
      score: report.score,
      annualEstimation: report.annualEstimation,
      category: report.category,
      transportScore: report.transportScore,
      energyScore: report.energyScore,
      foodScore: report.foodScore,
      wasteScore: report.wasteScore,
      answers: report.answers,
      createdAt: report.createdAt
    };
  }

  static fromEntities(reports) {
    if (!reports) return [];
    return reports.map(CarbonReportDTO.fromEntity);
  }
}
module.exports = CarbonReportDTO;
