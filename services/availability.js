export const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const dayIndex = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
};

const pad = (value) => String(value).padStart(2, '0');

export const createSlotId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const formatSlotLabel = (slot) => {
  if (!slot) return 'Slot unavailable';
  return `${slot.day} ${slot.startTime} - ${slot.endTime}`;
};

export const getSlotsFromTherapist = (therapist = {}) => {
  if (!therapist) return [];

  if (Array.isArray(therapist.availabilitySlots) && therapist.availabilitySlots.length) {
    return therapist.availabilitySlots;
  }

  const days = Object.entries(therapist.selectedDays || {})
    .filter(([, selected]) => selected)
    .map(([day]) => day);

  if (!days.length || !therapist.time) return [];

  const labeledSlots = String(therapist.time)
    .split(',')
    .map((entry) => {
      const day = days.find((selectedDay) =>
        entry.toLowerCase().includes(selectedDay.toLowerCase())
      );
      const times = entry.match(/\d{1,2}:\d{2}/g) || [];
      if (!day || times.length < 2) return null;
      return {
        id: day,
        day,
        startTime: normalizeTime(times[0]),
        endTime: normalizeTime(times[1]),
      };
    })
    .filter((slot) => slot?.startTime && slot?.endTime);

  if (labeledSlots.length) return labeledSlots;

  const [rawStart = '', rawEnd = ''] = String(therapist.time).split('-');
  const startTime = normalizeTime(rawStart);
  const endTime = normalizeTime(rawEnd);
  if (!startTime || !endTime) return [];

  return days.map((day) => ({
    id: day,
    day,
    startTime,
    endTime,
  }));
};

export const getUpcomingSlotOptions = (slots = [], weeksAhead = 4) => {
  const today = new Date();
  const options = [];

  slots.forEach((slot) => {
    const targetDay = dayIndex[slot.day];
    if (typeof targetDay !== 'number') return;

    for (let week = 0; week < weeksAhead; week += 1) {
      const optionDate = new Date(today);
      const distance = (targetDay - today.getDay() + 7) % 7;
      optionDate.setDate(today.getDate() + distance + week * 7);

      const [hour = '0', minute = '0'] = String(slot.startTime || '0:00').split(':');
      optionDate.setHours(Number(hour), Number(minute), 0, 0);

      if (optionDate < today) return;

      options.push({
        ...slot,
        optionId: `${slot.id}-${optionDate.toISOString()}`,
        appointmentDateTime: optionDate,
        dateLabel: optionDate.toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
        timeLabel: slot.endTime ? `${slot.startTime} - ${slot.endTime}` : slot.startTime,
        sortValue: optionDate.getTime(),
      });
    }
  });

  return options.sort((first, second) => first.sortValue - second.sortValue);
};

export const normalizeTime = (value) => {
  const match = String(value || '').trim().match(/(\d{1,2}):(\d{2})/);
  if (!match) return '';

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';

  return `${pad(hour)}:${pad(minute)}`;
};
