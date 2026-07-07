import PremiumService from "../services/premiumService.js";

export const calculatePremium = async (req, res) => {
  try {
    const { basePremium, age, heightCm, weightKg, hasChronicDisease, smoker } = req.body;

    if (!basePremium || !age || !heightCm || !weightKg) {
      return res.status(400).json({ success: false, message: "Missing required fields." });
    }

    const result = await PremiumService.calculate({
      basePremium: Number(basePremium),
      age: Number(age),
      heightCm: Number(heightCm),
      weightKg: Number(weightKg),
      hasChronicDisease: !!hasChronicDisease,
      smoker: !!smoker,
    });

    res.status(200).json({ success: true, result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
