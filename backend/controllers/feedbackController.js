import { Feedback, Order, Shop, User } from "../models/index.js";

export const addFeedback = async (req, res) => {
  try {
    const { orderId, shopId, rating, comment } = req.body;

    if (!orderId || !shopId || !rating) {
      return res.status(400).json({ message: "Missing required feedback fields" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.userId !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to review this order" });
    }

    if (order.status !== "completed") {
      return res.status(400).json({ message: "Cannot review incomplete order" });
    }

    if (order.isReviewed) {
      return res.status(400).json({ message: "Order is already reviewed" });
    }

    const feedback = await Feedback.create({
      userId: req.user.id,
      orderId,
      shopId,
      rating,
      comment,
    });

    order.isReviewed = true;
    await order.save();

    res.status(201).json({ message: "Feedback submitted successfully", feedback });
  } catch (error) {
    res.status(500).json({ message: "Failed to submit feedback", error: error.message });
  }
};

export const getShopFeedback = async (req, res) => {
  try {
    const { shopId } = req.params;

    const feedbacks = await Feedback.findAll({
      where: { shopId },
      include: [
        { model: User, as: "user", attributes: ["name"] }
      ],
      order: [["createdAt", "DESC"]],
    });

    const averageRating = feedbacks.length > 0 
      ? feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length 
      : 0;

    res.status(200).json({ feedbacks, averageRating });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch shop feedback", error: error.message });
  }
};
