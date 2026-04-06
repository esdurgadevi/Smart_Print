import React, { useState } from "react";
import { X, Star, MessageSquare } from "lucide-react";
import { submitFeedback } from "../../services/feedbackService";

const FeedbackModal = ({ isOpen, onClose, orderId, shopId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await submitFeedback({ orderId, shopId, rating, comment });
      onSuccess(orderId);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-900 text-lg">Leave a Review</h3>
          <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-black shadow-sm">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm font-medium">{error}</div>}
          
          <div className="text-center">
            <p className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">How was your printing experience?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star 
                    className={`h-10 w-10 transition-colors ${
                      (hoverRating || rating) >= star 
                        ? "fill-orange-400 text-orange-400" 
                        : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
            <div className="text-orange-500 font-bold mt-2 mt-4 text-sm h-5">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent!"}
            </div>
          </div>

          <div>
             <label className="text-xs font-bold text-gray-500 mb-2 block uppercase tracking-wider flex items-center gap-1">
               <MessageSquare className="h-3 w-3" /> Add a written review (optional)
             </label>
             <textarea 
               value={comment}
               onChange={(e) => setComment(e.target.value)}
               placeholder="Did the document look great? Was the shop fast?"
               className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm min-h-[120px] resize-none"
             />
          </div>

          <button 
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex justify-center items-center"
          >
            {submitting ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : "Submit Review"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackModal;
