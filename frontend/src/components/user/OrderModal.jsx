import React, { useState, useEffect } from "react";
import { X, UploadCloud, FileText, CheckCircle2, Users, Scissors, Palette, Clock } from "lucide-react";
import { uploadDocument } from "../../services/orderService";
import { useCart } from "../../context/CartContext";
import { getShopStatus } from "../../utils/shopUtils";

/* ── Confetti burst component ──────────────────────────────────────── */
const ConfettiPiece = ({ style }) => <div className="absolute w-2.5 h-2.5 rounded-sm" style={style} />;

const DiscountCelebrationPopup = ({ discount, serviceName, savings, onClose }) => {
  const colors = ["#f97316", "#22c55e", "#3b82f6", "#ec4899", "#facc15", "#a855f7", "#14b8a6"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    backgroundColor: colors[i % colors.length],
    transform: `rotate(${Math.random() * 360}deg)`,
    animation: `fall ${0.8 + Math.random() * 1.2}s ease-out forwards`,
    animationDelay: `${Math.random() * 0.5}s`,
    opacity: 0,
  }));

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <style>{`
        @keyframes fall {
          0% { opacity:1; transform: translateY(-30px) rotate(0deg) scale(1); }
          100% { opacity:0; transform: translateY(120px) rotate(360deg) scale(0.5); }
        }
        @keyframes popIn {
          0% { transform: scale(0.5); opacity:0; }
          70% { transform: scale(1.08); }
          100% { transform: scale(1); opacity:1; }
        }
      `}</style>

      {/* Confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {pieces.map((s, i) => <ConfettiPiece key={i} style={s} />)}
      </div>

      {/* Popup card */}
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 text-center" style={{ animation: "popIn 0.5s ease-out forwards" }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
          <X className="h-5 w-5" />
        </button>

        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Discount Unlocked!</h2>
        <p className="text-gray-500 text-sm mb-6">Your order on <strong>{serviceName}</strong> qualifies for the offer!</p>

        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white mb-6">
          <p className="text-5xl font-black">{Number(discount.discountPercentage).toFixed(0)}% OFF</p>
          <p className="text-green-100 mt-2 text-sm">You save <strong>₹{savings.toFixed(2)}</strong> on this order 🎊</p>
        </div>

        <p className="text-xs text-gray-400 mb-4">Discount auto-applied in your cart.</p>
        <button
          onClick={onClose}
          className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-xl transition-all active:scale-95"
        >
          Awesome, Let's Go! 🚀
        </button>
      </div>
    </div>
  );
};

const OrderModal = ({ isOpen, onClose, shopId, service, allServices = [], discounts = [], storeHours, queueCount }) => {
  const { addToCart } = useCart();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const shopStatus = getShopStatus(storeHours);

  const [documentUrl, setDocumentUrl] = useState("");
  const [pageCount, setPageCount] = useState(0);

  const [pageRange, setPageRange] = useState("");
  const [copies, setCopies] = useState(1);
  const [hasTriggeredDiscount, setHasTriggeredDiscount] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Split Mode State
  const [isSplitMode, setIsSplitMode] = useState(false);
  const [colorPages, setColorPages] = useState("");
  const [matchingService, setMatchingService] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setDocumentUrl("");
      setPageCount(0);
      setPageRange("");
      setCopies(1);
      setError("");
      setHasTriggeredDiscount(false);
      setShowCelebration(false);
      setIsSplitMode(false);
      setColorPages("");
      setMatchingService(null);
    }
  }, [isOpen]);

  // Find matching service for split
  useEffect(() => {
    if (service && isSplitMode) {
      const isColor = service.serviceName.toLowerCase().includes("color");
      const targetKeyword = isColor ? "black" : "color";
      const bwAlt = ["b/w", "b&w", "grayscale", "plain"];
      
      const found = allServices.find(s => {
        if (s.id === service.id) return false;
        const name = s.serviceName.toLowerCase();
        if (targetKeyword === "color") return name.includes("color");
        return name.includes("black") || bwAlt.some(alt => name.includes(alt));
      });
      
      if (!found && isSplitMode) {
        alert("This shop doesn't seem to have a separate " + (isColor ? "Black & White" : "Color") + " service. All pages will be processed under the current service.");
        setIsSplitMode(false);
      } else {
        setMatchingService(found);
      }
    }
  }, [isSplitMode, service, allServices]);

  const getInvertedRange = (rangeStr, total) => {
    if (!rangeStr || rangeStr.trim() === "") return "All";
    const all = Array.from({ length: total }, (_, i) => i + 1);
    const selected = new Set();
    rangeStr.split(',').forEach(part => {
      if (part.includes('-')) {
        const [s, e] = part.split('-').map(n => parseInt(n.trim()));
        for (let i = s; i <= e; i++) selected.add(i);
      } else {
        selected.add(parseInt(part.trim()));
      }
    });
    const inverted = all.filter(p => !selected.has(p));
    if (inverted.length === 0) return "None";
    
    // Convert back to string
    let res = [];
    let start = inverted[0];
    let end = start;
    for (let i = 1; i <= inverted.length; i++) {
       if (inverted[i] === end + 1) { end = inverted[i]; }
       else {
         res.push(start === end ? `${start}` : `${start}-${end}`);
         start = inverted[i];
         end = start;
       }
    }
    return res.join(', ');
  };

  // Moved early return down to comply with Rules of Hooks


  const costPerPage = parseFloat(service?.price || 0);

  const calculatePagesToPrint = () => {
    if (!pageRange || pageRange.trim() === "all" || pageRange.trim() === "All" || pageRange.trim() === "") {
      return pageCount || 1;
    }
    const parts = pageRange.split(',');
    let count = 0;
    for (let part of parts) {
      if (part.includes('-')) {
        const [start, end] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end) && start <= end) {
          count += (end - start + 1);
        }
      } else {
        const num = parseInt(part.trim());
        if (!isNaN(num)) count += 1;
      }
    }
    return count > 0 ? count : (pageCount || 1);
  };

  const currentPagesToPrint = calculatePagesToPrint();
  const originalTotal = currentPagesToPrint * copies * costPerPage;

  // ── Discount Logic ──
  const serviceDiscount = discounts.find(d => Number(d.serviceId) === Number(service?.id));
  const isEligible = serviceDiscount && originalTotal >= Number(serviceDiscount.minQuantity);
  const finalTotal = isEligible ? originalTotal * (1 - Number(serviceDiscount.discountPercentage) / 100) : originalTotal;
  const savings = originalTotal - finalTotal;


  // Trigger celebration ONLY when threshold is crossed in real-time
  useEffect(() => {
    if (isEligible && !hasTriggeredDiscount) {
      setHasTriggeredDiscount(true);
      setShowCelebration(true);
    } else if (!isEligible) {
      setHasTriggeredDiscount(false);
    }
  }, [isEligible, hasTriggeredDiscount]);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported for automated page counting.");
      // Still upload to allow it? For simplicity, enforce PDF.
      return;
    }

    try {
      setUploading(true);
      setError("");

      const formData = new FormData();
      formData.append("document", file);

      const data = await uploadDocument(formData);
      setDocumentUrl(data.documentUrl);
      setPageCount(data.pageCount);
      
      // AUTO-ACTIVATE SPLIT IF COLOR DETECTED
      if (data.autoColorPages && data.autoColorPages !== "") {
        setIsSplitMode(true);
        setColorPages(data.autoColorPages);
      }
      
      setStep(2); // move to customization
    } catch (err) {
      setError("Failed to upload document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSkipUpload = () => {
    setPageCount(1);
    setStep(2);
  };

  const handleAddToCart = () => {
    try {
      if (isSplitMode && matchingService) {
        const invertedRange = getInvertedRange(colorPages, pageCount);
        
        // Add Color Pages
        addToCart({
          shopId,
          serviceId: service.id,
          service,
          documentUrl,
          pageCount,
          pageRange: colorPages,
          copies,
          totalAmount: (calculateRangePages(colorPages, true) * copies * parseFloat(service.price)), 
          isSplit: true,
          splitType: "Color"
        });

        // Add B/W Pages
        if (invertedRange !== "None") {
           addToCart({
            shopId,
            serviceId: matchingService.id,
            service: matchingService,
            documentUrl,
            pageCount,
            pageRange: invertedRange === "All" ? "" : invertedRange,
            copies,
            totalAmount: (calculateRangePages(invertedRange === "All" ? "" : invertedRange, true) * copies * parseFloat(matchingService.price)),
            isSplit: true,
            splitType: "B/W"
          });
        }
      } else {
        addToCart({
          shopId,
          serviceId: service.id,
          service,
          documentUrl,
          pageCount,
          pageRange: pageRange === "All" ? "" : pageRange,
          copies,
          totalAmount: finalTotal,
          originalAmount: originalTotal,
          isSplit: false
        });
      }
      setStep(3);
    } catch (err) {
      setError("Failed to add to cart.");
    }
  };

  const calculateRangePages = (range, isSplitInput = false) => {
    if (!range || range.trim() === "" || range === "None") {
      // In split mode, empty input for color/bw should be 0, not ALL
      return (isSplitMode || isSplitInput) ? 0 : (pageCount || 1);
    }
    if (range === "All") return pageCount || 1;
    const parts = range.split(',');
    let count = 0;
    for (let part of parts) {
      if (part.includes('-')) {
        const [s, e] = part.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(s) && !isNaN(e) && s <= e) count += (e - s + 1);
      } else {
        const num = parseInt(part.trim());
        if (!isNaN(num)) count += 1;
      }
    }
    return count;
  };

  // Pricing calculations for UI display
  const colorPageResult = calculateRangePages(colorPages, true);
  const bwPageResult = calculateRangePages(getInvertedRange(colorPages, pageCount), true);
  
  const colorTotal = colorPageResult * copies * costPerPage;
  const bwService = matchingService || service; // Fallback if not split
  const bwCostPerPage = parseFloat(bwService?.price || 0);
  const bwTotal = bwPageResult * copies * bwCostPerPage;
  
  const combinedTotal = isSplitMode ? (colorTotal + bwTotal) : finalTotal;

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Order Details</h3>
            <p className="text-orange-600 text-sm font-semibold">{service.serviceName} - ₹{costPerPage}/page</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="p-3 mb-4 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-xl">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 text-center">
              <h4 className="text-lg font-bold text-gray-900">Upload your PDF</h4>
              <p className="text-gray-500 text-sm">We will securely upload your file to calculate pages.</p>

              <div className="border-2 border-dashed border-gray-300 rounded-3xl p-10 hover:bg-gray-50 transition-colors relative group">
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                />
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mb-4"></div>
                    <span className="text-orange-600 font-medium tracking-wide">Processing Document...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="h-16 w-16 bg-orange-100 text-orange-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <span className="font-bold text-gray-700">Click or drag PDF here</span>
                    <span className="text-xs text-gray-400 mt-2">Max limit 50MB</span>
                  </div>
                )}
              </div>

              <button onClick={handleSkipUpload} className="text-sm font-medium text-gray-500 hover:text-orange-500 underline mt-4 inline-block transition-colors">
                Skip Upload (Testing only)
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

              <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-sm shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 leading-tight">Document Ready</h4>
                  {documentUrl && <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{documentUrl.split('/').pop()}</p>}
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xl font-extrabold text-orange-600">{pageCount}</div>
                  <div className="text-xs text-gray-500 font-medium tracking-wide">PAGES FOUND</div>
                </div>
              </div>

              {/* Queue Status Information */}
              <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
                <div className="h-10 w-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-900">Current Queue: {queueCount || 0} Orders</p>
                  <p className="text-[10px] text-purple-600 font-medium uppercase tracking-tight">Your order will be placed at the end of the current queue</p>
                </div>
              </div>

              <div className="space-y-4">
                {/* Color Split Toggle */}
                <div className={`p-4 rounded-2xl border transition-all ${isSplitMode ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-100 hover:border-gray-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${isSplitMode ? 'bg-orange-500 text-white' : 'bg-white text-gray-400 shadow-sm'}`}>
                        <Palette className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">Color + B/W Split</p>
                        <p className="text-[10px] text-gray-500 font-medium uppercase tracking-tighter">Split one doc into two print services</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsSplitMode(!isSplitMode)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${isSplitMode ? 'bg-orange-500' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${isSplitMode ? 'translate-x-6' : ''}`} />
                    </button>
                  </div>

                  {isSplitMode && (
                    <div className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-2">
                      <div className="bg-white p-3 rounded-xl border border-orange-100">
                        <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest block mb-1">Identify Color Pages</label>
                        <input
                          type="text"
                          placeholder="e.g. 1, 4-5"
                          value={colorPages}
                          onChange={(e) => setColorPages(e.target.value)}
                          className="w-full text-sm font-bold bg-transparent outline-none border-none p-0 placeholder:text-gray-300"
                        />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold">
                        <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded-md">Color: {calculateRangePages(colorPages)} pgs</div>
                        <div className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md">B/W: {calculateRangePages(getInvertedRange(colorPages, pageCount))} pgs</div>
                      </div>
                    </div>
                  )}
                </div>

                {!isSplitMode && (
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1">Print Range</label>
                    <input
                      type="text"
                      placeholder="e.g. 1-5, 8, 11-13 (Leave blank for ALL)"
                      value={pageRange}
                      onChange={(e) => setPageRange(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all placeholder:text-gray-400"
                    />
                    <p className="text-xs text-gray-500 mt-1.5 font-medium ml-1">
                      Will actively print <strong className="text-gray-900">{currentPagesToPrint}</strong> pages per copy.
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-bold text-gray-700 block mb-1">Number of Copies</label>
                  <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden w-32">
                    <button
                      onClick={() => setCopies(Math.max(1, copies - 1))}
                      className="w-10 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                    >-</button>
                    <input
                      type="number"
                      value={copies}
                      onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-12 py-3 text-center font-bold text-gray-900 bg-transparent border-0 ring-0 outline-none p-0 focus:ring-0"
                    />
                    <button
                      onClick={() => setCopies(copies + 1)}
                      className="w-10 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
                    >+</button>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900 rounded-2xl p-5 text-white shadow-lg shadow-gray-200">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <span className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">Total Estimated Cost</span>
                    <div className="flex flex-col gap-0.5">
                      {!isSplitMode ? (
                        <div className="flex gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-tighter">
                          <span>{currentPagesToPrint} pages</span> &times;
                          <span>{copies} copies</span> &times;
                          <span>₹{costPerPage}</span>
                        </div>
                      ) : (
                        <div className="space-y-0.5">
                          <div className="flex gap-1.5 text-[9px] font-bold text-orange-400 uppercase tracking-tighter">
                            <span>Color: {colorPageResult} pgs</span> &times; <span>₹{costPerPage}</span> = <span>₹{colorTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex gap-1.5 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                            <span>B/W: {bwPageResult} pgs</span> &times; <span>₹{bwCostPerPage}</span> = <span>₹{bwTotal.toFixed(2)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {isEligible && !isSplitMode && (
                    <div className="bg-green-500/20 text-green-400 px-2.5 py-1 rounded-lg text-[10px] font-black border border-green-500/30 animate-pulse flex items-center gap-1.5">
                      <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                      OFFER UNLOCKED
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-end mt-2">
                  <div className="flex flex-col">
                    {isEligible && !isSplitMode && (
                      <span className="text-gray-500 line-through text-lg font-bold">₹{originalTotal.toFixed(2)}</span>
                    )}
                    <div className="text-3xl font-extrabold text-orange-400">
                      ₹{combinedTotal.toFixed(2)}
                    </div>
                  </div>
                  {isSplitMode && (
                    <div className="text-right">
                       <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">{copies} {copies > 1 ? 'COPIES EACH' : 'COPY'}</p>
                    </div>
                  )}
                  {isEligible && !isSplitMode && (
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-green-400 uppercase">You saved ₹{savings.toFixed(2)}</p>
                      <p className="text-[9px] text-gray-500 italic mt-0.5">({Number(serviceDiscount.discountPercentage).toFixed(0)}% auto-applied)</p>
                    </div>
                  )}
                </div>
              </div>

              {!shopStatus.isOpen && (
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-center">
                  <p className="text-red-600 font-bold text-sm tracking-tight flex items-center justify-center gap-2">
                    <Clock className="h-4 w-4" /> This shop is currently closed.
                  </p>
                  <p className="text-red-400 text-[10px] font-medium mt-0.5 whitespace-pre-wrap uppercase tracking-tighter">
                    Orders are only accepted during opening hours
                  </p>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={!shopStatus.isOpen}
                className={`w-full text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all flex justify-center items-center gap-2 ${shopStatus.isOpen
                    ? "bg-orange-500 hover:bg-orange-600 shadow-orange-200 active:scale-[0.98]"
                    : "bg-gray-400 cursor-not-allowed shadow-none"
                  }`}
              >
                {shopStatus.isOpen ? "Add to Cart" : "Shop Currently Closed"}
              </button>

            </div>
          )}

          {step === 3 && (
            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
              <div className="h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Added to Cart!</h3>
              <p className="text-gray-500 mb-8 max-w-xs mx-auto">Your configuration for {service.serviceName} has been saved to your cart. You can browse more services or check out.</p>

              <button onClick={onClose} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-xl font-bold transition-all w-full md:w-auto">
                Continue Browsing
              </button>
            </div>
          )}

        </div>
      </div>

      {showCelebration && (
        <DiscountCelebrationPopup
          discount={serviceDiscount}
          serviceName={service.serviceName}
          savings={savings}
          onClose={() => setShowCelebration(false)}
        />
      )}
    </div>
  );
};

export default OrderModal;
