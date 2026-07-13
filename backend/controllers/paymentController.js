import PaymentService from "../services/paymentService.js";

export const submitPayment = async (req, res) => {
  try {
    const { method, transactionId, amount, billingCycle } = req.body;

    // billingCycle is only required for the first (activation) payment;
    // the service validates it in that context.
    if (!method || !transactionId || !amount) {
      return res.status(400).json({ success: false, message: "Missing required payment fields." });
    }

    const receiptFile = req.files?.receipt?.[0] || null;
    const { payment, message } = await PaymentService.submit(
      req.user.id,
      { method, transactionId, amount: Number(amount), billingCycle },
      receiptFile
    );

    res.status(201).json({ success: true, payment, message });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getPaymentSchedule = async (req, res) => {
  try {
    const schedule = await PaymentService.getSchedule(req.user.id);
    res.status(200).json({ success: true, schedule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await PaymentService.getMyPayments(req.user.id);
    res.status(200).json({ success: true, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
