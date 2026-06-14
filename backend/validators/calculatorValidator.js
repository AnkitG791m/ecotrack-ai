const { z } = require('zod');

const calculatorAnswersSchema = z.object({
  carKm: z.number().min(0).optional().default(0),
  electricityUnits: z.number().min(0).optional().default(0),
  diet: z.enum(['meat-heavy', 'balanced', 'vegetarian', 'vegan']).optional().default('balanced'),
  wasteRecycled: z.boolean().optional().default(false),
  publicTransitMinutes: z.number().min(0).optional().default(0),
  flightHours: z.number().min(0).optional().default(0)
}).refine(data => Object.keys(data).length > 0, {
  message: "Survey answers cannot be empty"
});

module.exports = {
  calculatorAnswersSchema
};
