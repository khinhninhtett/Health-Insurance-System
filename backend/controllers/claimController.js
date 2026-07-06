import ClaimService from "../services/claimService.js";

export const submitClaim = async (req, res) => {
  try {
    const { type, hospitalName, serviceDate, amount, description } = req.body;

    if (!type || !serviceDate || !amount) {
      return res.status(400).json({ success: false, message: "Missing required claim fields." });
    }

    const documentFile = req.files?.document?.[0] || null;
    const { claim, message } = await ClaimService.submit(
      req.user.id,
      {
        type,
        hospitalName: hospitalName || null,
        serviceDate,
        amount: Number(amount),
        description,
      },
      documentFile
    );

    res.status(201).json({ success: true, claim, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getMyClaims = async (req, res) => {
  try {
    const claims = await ClaimService.getMyClaims(req.user.id);
    res.status(200).json({ success: true, claims });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
