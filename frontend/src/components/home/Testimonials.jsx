import React, { useRef } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Kumar",
    location: "Mumbai",
    rating: 5,
    text: "Found a great print shop near me within minutes! Got my wedding cards printed beautifully and delivered the next day. Amazing service!",
    image: "https://randomuser.me/api/portraits/men/1.jpg",
  },
  {
    name: "Priya Sharma",
    location: "Delhi",
    rating: 5,
    text: "As a small business owner, I need regular printing. PrintHub makes it so easy to compare shops and get the best deals. Highly recommended!",
    image: "https://randomuser.me/api/portraits/women/2.jpg",
  },
  {
    name: "Amit Patel",
    location: "Bangalore",
    rating: 5,
    text: "Quick delivery and excellent quality. The real-time tracking feature is a game-changer. Will definitely use again!",
    image: "https://randomuser.me/api/portraits/men/3.jpg",
  },
  {
    name: "Neha Gupta",
    location: "Pune",
    rating: 4,
    text: "Great platform! Got my thesis printed and bound perfectly. The shop was very professional and delivery was on time.",
    image: "https://randomuser.me/api/portraits/women/4.jpg",
  },
  {
    name: "Vikram Singh",
    location: "Chennai",
    rating: 5,
    text: "Excellent service! The print quality exceeded my expectations. Will definitely recommend to friends and family.",
    image: "https://randomuser.me/api/portraits/men/5.jpg",
  },
];

const Testimonials = () => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Customers Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who found their perfect print shop
          </p>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>

          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all"
          >
            <ChevronRight className="h-6 w-6 text-gray-600" />
          </button>

          <div
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 scroll-smooth hide-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 w-80 md:w-96 bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all"
              >
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="ml-3">
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default Testimonials;