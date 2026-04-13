/**
 * Parses a time string like "9:00 AM" into minutes from midnight.
 */
const parseTimeToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return null;

  let [_, hours, minutes, modifier] = match;
  hours = parseInt(hours);
  minutes = parseInt(minutes);

  if (modifier.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (modifier.toUpperCase() === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

/**
 * Checks if a shop is currently open based on storeHours object.
 * storeHours: { monday: "9:00 AM - 9:00 PM", ... }
 * @returns { isOpen: boolean, status: string }
 */
export const getShopStatus = (storeHours) => {
  if (!storeHours) return { isOpen: false, status: "Hours Not Set" };

  const now = new Date();
  const day = now.toLocaleString('en-us', { weekday: 'long' }).toLowerCase();
  const currentHours = storeHours[day];

  if (!currentHours || currentHours.toLowerCase() === 'closed') {
    return { isOpen: false, status: "Closed Today" };
  }

  const [startStr, endStr] = currentHours.split(' - ');
  const startMins = parseTimeToMinutes(startStr);
  const endMins = parseTimeToMinutes(endStr);
  const nowMins = now.getHours() * 60 + now.getMinutes();

  if (startMins === null || endMins === null) {
     return { isOpen: false, status: "Invalid Hours" };
  }

  // Handle overnight ranges (e.g., 9:00 PM - 2:00 AM)
  if (endMins < startMins) {
    if (nowMins >= startMins || nowMins <= endMins) {
      return { isOpen: true, status: "Open Now" };
    }
  } else {
    if (nowMins >= startMins && nowMins <= endMins) {
      return { isOpen: true, status: "Open Now" };
    }
  }

  return { isOpen: false, status: "Closed Now" };
};
