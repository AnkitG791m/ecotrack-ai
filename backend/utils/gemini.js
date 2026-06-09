const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialise the Gemini API client if API key is provided
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// Helper to check if API is active
const isApiActive = () => genAI !== null;

/**
 * Generate AI Recommendations based on carbon calculator scores
 */
const generateAIRecommendations = async (answers, scoreData) => {
  const prompt = `
    You are an expert sustainability consultant and AI advisor for EcoTrack AI.
    A user has completed a carbon footprint audit. Here is their data:
    - Total Annual Carbon Footprint: ${scoreData.annualEstimationTons} metric tons of CO2.
    - Category Zone: ${scoreData.category.toUpperCase()} (Green is low, Yellow is average, Red is high).
    - Category breakdown (kg CO2/year):
      * Transportation: ${scoreData.breakdown.transport}
      * Household Energy: ${scoreData.breakdown.energy}
      * Diet & Food: ${scoreData.breakdown.food}
      * Waste & Recycling: ${scoreData.breakdown.waste}
    
    User Habits Details:
    - Car travel: ${answers.carKm || 0} km/week
    - Bike travel: ${answers.bikeKm || 0} km/week
    - Public transport: ${answers.publicTransportKm || 0} km/week
    - Flights: ${answers.flightsPerYear || 0} per year
    - Electricity units: ${answers.electricityUnits || 0} kWh/month
    - AC usage: ${answers.acHours || 0} hours/day
    - Appliances category: ${answers.appliancesUsage || 'medium'}
    - Diet style: ${answers.diet || 'mixed'}
    - Plastic usage level: ${answers.plasticUsage || 'medium'}
    - Recycling rate: ${answers.recyclingHabits || 'none'}
    - Garbage volume: ${answers.garbageGeneration || 'medium'}

    Provide a JSON-formatted response containing:
    1. "recommendations": An array of 4-5 high-impact, personalized, actionable eco-tips for this user.
    2. "weeklyPlan": An array of 7 items (one for each day of the week, e.g., "Day 1: ...") outlining a step-by-step reduction routine.
    3. "monthlyGoal": A specific, measurable monthly carbon reduction goal (e.g., "Reduce electricity consumption by 15% and substitute 2 car trips with public transit.").
    4. "predictedNextMonthScore": A predicted next month's weekly carbon score (in kg CO2) if they follow your advice (estimate a realistic 5% to 15% reduction from their current weekly score of ${Math.round(scoreData.totalKgCO2 / 52)} kg CO2).

    Make the response STRICTLY JSON in this exact structure, with no markdown code blocks outside the JSON:
    {
      "recommendations": ["string", "string", ...],
      "weeklyPlan": ["string", "string", ...],
      "monthlyGoal": "string",
      "predictedNextMonthScore": number
    }
  `;

  if (isApiActive()) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      // Clean JSON formatting if Gemini wrapped it in ```json ... ```
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Gemini API Error, falling back to mock:', error.message);
    }
  }

  // Fallback realistic Mock Recommendations
  const currentWeeklyScore = Math.round(scoreData.totalKgCO2 / 52);
  const targetWeeklyScore = Math.round(currentWeeklyScore * 0.9); // 10% reduction
  
  const mockRecs = {
    green: {
      recommendations: [
        "Excellent job! Maintain your low footprint by sharing tips with neighbors and participating in local planting drives.",
        "Consider moving towards a fully zero-waste lifestyle by auditing your food packaging.",
        "Transition your home electricity to 100% renewable tariffs if available in your region.",
        "Perform a seasonal home energy audit to prevent heating/cooling draft leaks."
      ],
      weeklyPlan: [
        "Day 1: Audit your pantry and eliminate single-use plastic wraps.",
        "Day 2: Share your low carbon score on the EcoTrack community to inspire others.",
        "Day 3: Optimize refrigerator temperature settings (3-5°C for fridge, -18°C for freezer).",
        "Day 4: Buy dry items in bulk using reusable cotton drawstring bags.",
        "Day 5: Walk or cycle for all errands under 3 km.",
        "Day 6: Repair or upcycle an old clothing item rather than buying new.",
        "Day 7: Try home composting for organic fruit and vegetable scraps."
      ],
      monthlyGoal: "Maintain your green rating and achieve zero organic waste sent to landfill.",
      predictedNextMonthScore: targetWeeklyScore
    },
    yellow: {
      recommendations: [
        "Swap 2 short car trips per week with public transit or cycling to cut transport emissions.",
        "Reduce AC usage by 1 hour daily and set thermostat to a sustainable 24-26°C.",
        "Integrate 2 additional vegetarian days into your weekly diet to save agricultural water and CO2.",
        "Introduce compost bins for organic waste and set up separate recycling for plastics and paper."
      ],
      weeklyPlan: [
        "Day 1: Unplug standby chargers and electronics when not in use.",
        "Day 2: Walk or cycle to work or school, or map out public transit schedules.",
        "Day 3: Prepare a fully plant-based meal today.",
        "Day 4: Avoid buying any single-use plastic bottles or cups.",
        "Day 5: Set your AC thermostat to 25°C and use a fan to circulate cool air.",
        "Day 6: Separate cardboard, paper, glass, and plastic in designated recycling bins.",
        "Day 7: Audit your home lights and replace any remaining halogen bulbs with LEDs."
      ],
      monthlyGoal: "Reduce energy usage by 15% and cut weekly vehicle emissions by 10%.",
      predictedNextMonthScore: targetWeeklyScore
    },
    red: {
      recommendations: [
        "Urgent: Vehicle transport is a major source of your emissions. Consider carpooling or walking where possible.",
        "Your household electricity consumption is high. Switch to high-efficiency appliances and switch off inactive lighting.",
        "Transition your diet away from heavy meat consumption; animal farming contributes heavily to carbon release.",
        "Minimize waste generation. Refuse single-use plastics and establish strict recycling habits."
      ],
      weeklyPlan: [
        "Day 1: Switch off all standby electronics and unnecessary light sources.",
        "Day 2: Commit to a 'Car-Free Day' and walk, cycle, or use buses/trains.",
        "Day 3: Replace red meat with plant-based proteins (lentils, beans, tofu).",
        "Day 4: Empty trash and catalog plastic waste to find replacement alternatives.",
        "Day 5: Set AC timer so it automatically switches off after 3 hours of cooling.",
        "Day 6: Purchase groceries from local farmers' markets to eliminate heavy transport packaging.",
        "Day 7: Set up a kitchen sorting station for paper, cans, plastics, and landfill waste."
      ],
      monthlyGoal: "Reduce vehicle mileage by 30% and adopt meatless weekdays.",
      predictedNextMonthScore: targetWeeklyScore
    }
  };

  return mockRecs[scoreData.category] || mockRecs.yellow;
};

/**
 * Handle AI Eco Chatbot interaction
 */
const getChatbotResponse = async (history, message) => {
  const systemInstruction = `
    You are EcoBot, the friendly, highly knowledgeable AI eco-consultant built into the EcoTrack AI platform.
    Your mission is to help users understand carbon footprints, sustainability, recycling, climate change, and green living.
    Keep your responses structured, positive, inspiring, and concise.
    Always give actionable advice, and format response in beautiful Markdown.
    If the user asks questions unrelated to climate, environment, recycling, or sustainability, politely redirect them back to environmental topics.
  `;

  if (isApiActive()) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemInstruction
      });
      
      const chat = model.startChat({
        history: history.map(h => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        }))
      });

      const result = await chat.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Gemini Chatbot Error, falling back to mock:', error.message);
    }
  }

  // Simulated Eco Chatbot replies for typical environmental keywords
  const lowerMsg = message.toLowerCase();
  if (lowerMsg.includes('flight') || lowerMsg.includes('airplane') || lowerMsg.includes('travel')) {
    return `### Carbon Footprint of Air Travel ✈️\n\nFlying is one of the fastest ways to increase your carbon footprint. Here is a breakdown of emissions:\n\n* **Short-haul flight (< 1,500 km):** ~150g of CO₂ per passenger km.\n* **Long-haul flight (> 1,500 km):** ~110g of CO₂ per passenger km (but the sheer distance makes the total massive).\n* **Average Round-Trip Transatlantic Flight:** Produces about **1.6 tonnes of CO₂** per passenger, which is equivalent to heating a home for a full year!\n\n**Actionable Tips to Offset Flying:**\n1. **Fly Direct:** Takeoffs and landings consume the most fuel.\n2. **Choose Economy:** First and Business class seats occupy more space and therefore carry a higher carbon allocation per passenger.\n3. **Use Trains:** For distances under 500 km, rail travel produces up to **85% fewer emissions** than flying.`;
  } else if (lowerMsg.includes('reduce') || lowerMsg.includes('minimize') || lowerMsg.includes('how can i')) {
    return `### 3 Quick Wins to Reduce Your Footprint 🌿\n\nReducing your impact is easier than it looks! Here are three high-impact areas:\n\n1. **Adjust Your Thermostat 🌡️**\n   Setting your AC 1°C higher in summer or heating 1°C lower in winter can save up to **10% on your energy bill** and significantly reduce emissions.\n\n2. **Power Down Standby Devices 🔌**\n   Many appliances consume power even when turned off (phantom load). Unplug chargers, game consoles, and TVs when not in use.\n\n3. **Embrace Meatless Mondays 🥦**\n   Replacing meat with grains, beans, and fresh vegetables just one day a week cuts your food-related emissions by **15%**!`;
  } else if (lowerMsg.includes('plastic') || lowerMsg.includes('recycle') || lowerMsg.includes('waste')) {
    return `### The Rules of Smart Recycling ♻️\n\nRecycling is great, but recycling *correctly* is crucial to avoid contaminating batches. Follow these guidelines:\n\n1. **Wash and Dry:** Food residue on plastic containers or pizza boxes can cause the whole batch to be sent to landfills. Give containers a quick rinse.\n2. **Know Your Plastics:** Check the recycling triangle code. Codes **1 (PET)** and **2 (HDPE)** are widely accepted almost everywhere. Codes **3, 4, 6, and 7** are often rejected locally.\n3. **Avoid Loose Bags:** Plastic grocery bags clog recycling sorting machinery. Recycle them at specific supermarket drop-off zones instead of your home bins.`;
  } else {
    return `### Hello! I'm EcoBot, your sustainability assistant. 🌎\n\nI can help you with:\n* Understanding your **carbon calculator** results.\n* Finding alternative transportation routes.\n* Power-saving tips for home appliances.\n* Setting up composting and smart recycling stations.\n\n*What environmental question can I answer for you today?*`;
  }
};

/**
 * Image Analysis for waste classification and object detection
 */
const analyzeWasteImage = async (base64Data, mimeType) => {
  const prompt = `
    Analyze the uploaded image. Focus on identifying objects that have an environmental impact (e.g. plastic bottles, garbage bags, recycling bins, electronics, vehicles, trees, organic waste).
    
    Provide a JSON-formatted response with the following keys:
    1. "detectedObjects": An array of strings listing the main objects detected (e.g. ["Plastic bottles", "Cardboard box"]).
    2. "impactLevel": A rating of the environmental impact represented (e.g. "Low", "Medium", "High").
    3. "impactExplanation": A brief 1-2 sentence explanation of why this has that impact (e.g. "Single-use plastics take over 450 years to decompose and release microplastics.").
    4. "recommendations": An array of 2-3 specific suggestions for eco-friendly disposal, recycling, or reduction.

    Make the response STRICTLY JSON in this exact structure, with no markdown code blocks outside the JSON:
    {
      "detectedObjects": ["string", "string"],
      "impactLevel": "Low" | "Medium" | "High",
      "impactExplanation": "string",
      "recommendations": ["string", "string"]
    }
  `;

  if (isApiActive()) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Gemini Image Analysis Error, falling back to mock:', error.message);
    }
  }

  // Simulated analysis responses
  return {
    detectedObjects: ["Single-Use Plastic Bottles", "Discarded Cardboard Packaging"],
    impactLevel: "Medium",
    impactExplanation: "Plastic bottles pose an environmental threat due to slow decomposition, while cardboard represents potential paper wastage but is highly recyclable.",
    recommendations: [
      "Separate the cardboard from the plastic bottles and deposit them in your building's blue bin.",
      "Switch to a reusable double-walled stainless steel flask to completely eliminate plastic bottle waste.",
      "Ensure plastic caps are screwed on tightly before recycling, or collect them for specialized plastic programs."
    ]
  };
};

/**
 * Scan Electricity Bill to extract units and emissions
 */
const scanElectricityBill = async (base64Data, mimeType) => {
  const prompt = `
    Analyze the uploaded electricity bill image. Extract key figures.
    
    Provide a JSON-formatted response with the following keys:
    1. "unitsConsumed": The number of electricity units (kWh) consumed. If not found in the bill, estimate a realistic monthly consumption based on standard bills (e.g. 250).
    2. "estimatedCarbonEmissions": Estimated carbon footprint in kg CO2 (calculate as units consumed * 0.5 kg CO2/kWh).
    3. "billingPeriod": The billing month or date range (e.g. "May 2026").
    4. "recommendations": An array of 3 practical suggestions to reduce consumption based on the bill scale.

    Make the response STRICTLY JSON in this exact structure, with no markdown code blocks outside the JSON:
    {
      "unitsConsumed": number,
      "estimatedCarbonEmissions": number,
      "billingPeriod": "string",
      "recommendations": ["string", "string", "string"]
    }
  `;

  if (isApiActive()) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      };
      const result = await model.generateContent([prompt, imagePart]);
      const text = result.response.text();
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (error) {
      console.error('Gemini Bill Scanner Error, falling back to mock:', error.message);
    }
  }

  // Simulated bill scanner responses
  return {
    unitsConsumed: 320,
    estimatedCarbonEmissions: 160, // 320 * 0.5
    billingPeriod: "Current Billing Cycle",
    recommendations: [
      "Switch to smart power strips that automatically cut power to devices in standby mode.",
      "Clean your AC filters monthly to improve cooling efficiency and reduce unit consumption by 15%.",
      "Shift heavy appliance usage (e.g. washing machines) to off-peak hours if variable tariffs apply."
    ]
  };
};

module.exports = {
  generateAIRecommendations,
  getChatbotResponse,
  analyzeWasteImage,
  scanElectricityBill
};
