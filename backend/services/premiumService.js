import CobolService from "./cobolService.js";

class PremiumService {
  static async calculate({ basePremium, age, heightCm, weightKg, hasChronicDisease, smoker }) {
    const heightM = heightCm / 100;
    const bmi = weightKg / (heightM * heightM);
    const bmiRounded = Math.round(bmi);

    const result = await CobolService.execute("calculate_premium", [
      String(Math.round(basePremium)),
      String(Math.round(age)),
      String(bmiRounded),
      hasChronicDisease ? "Y" : "N",
      smoker ? "Y" : "N",
    ]);

    if (result.status !== "OK") {
      throw new Error(result.message || "Premium calculation failed.");
    }

    return {
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory: result.bmiCategory,
      riskLevel: result.riskLevel,
      monthlyPremium: Number(result.monthlyPremium),
      annualPremium: Number(result.annualPremium),
    };
  }
}

export default PremiumService;
