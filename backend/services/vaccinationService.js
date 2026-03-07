const { getDatabase } = require('../database/db');

// ─── Get Vaccination Calendar for a Cow ──────────────────

const getVaccinationCalendar = (cowId) => {
  const db = getDatabase();

  const cow = db.prepare('SELECT * FROM cows WHERE id = ?').get(cowId);
  if (!cow) throw new Error('Cow not found');

  const birthDate = new Date(cow.birth_date);
  const now = new Date();
  const ageDays = Math.floor((now - birthDate) / (1000 * 60 * 60 * 24));

  // Get predefined vaccine schedule
  const schedules = db.prepare('SELECT * FROM vaccine_schedule ORDER BY age_days_min ASC').all();

  // Get administered vaccines
  const administered = db.prepare('SELECT * FROM vaccinations WHERE cow_id = ? ORDER BY administered_date DESC').all(cowId);

  const calendar = schedules.map(schedule => {
    const dueDate = new Date(birthDate);
    dueDate.setDate(dueDate.getDate() + schedule.age_days_min);

    // Check if already administered
    const matching = administered.filter(v =>
      v.vaccine_name.toLowerCase().includes(schedule.vaccine_name.split('(')[0].trim().toLowerCase()) ||
      schedule.vaccine_name.toLowerCase().includes(v.vaccine_name.split('(')[0].trim().toLowerCase())
    );

    let status = 'upcoming';
    let lastAdministered = null;
    let nextDue = dueDate.toISOString().split('T')[0];

    if (matching.length > 0) {
      const latest = matching[0];
      lastAdministered = latest.administered_date;

      if (schedule.repeat_interval_days) {
        const lastDate = new Date(latest.administered_date);
        const nextRepeat = new Date(lastDate);
        nextRepeat.setDate(nextRepeat.getDate() + schedule.repeat_interval_days);
        nextDue = nextRepeat.toISOString().split('T')[0];

        if (new Date(nextDue) < now) {
          status = 'overdue';
        } else {
          status = 'completed';
        }
      } else {
        status = 'completed';
        nextDue = null;
      }
    } else if (dueDate < now) {
      status = 'overdue';
    }

    return {
      vaccineId: schedule.id,
      vaccineName: schedule.vaccine_name,
      description: schedule.description,
      status,
      isMandatory: schedule.is_mandatory === 1,
      recommendedAgeDays: schedule.age_days_min,
      dueDate: nextDue,
      lastAdministered,
      repeatIntervalDays: schedule.repeat_interval_days,
      timesAdministered: matching.length,
    };
  });

  return {
    cowId: cow.id,
    rfidNumber: cow.rfid_number,
    breed: cow.breed,
    ageDays,
    ageMonths: Math.floor(ageDays / 30),
    calendar,
    overdue: calendar.filter(c => c.status === 'overdue').length,
    completed: calendar.filter(c => c.status === 'completed').length,
    upcoming: calendar.filter(c => c.status === 'upcoming').length,
  };
};

// ─── Get Farm-wide Vaccination Summary ───────────────────

const getFarmVaccinationSummary = (farmerId) => {
  const db = getDatabase();
  const today = new Date().toISOString().split('T')[0];

  const overdue = db.prepare(`
    SELECT v.*, c.rfid_number, c.breed
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    WHERE c.farmer_id = ? AND v.next_due_date < ? AND v.next_due_date IS NOT NULL
    ORDER BY v.next_due_date ASC
  `).all(farmerId, today);

  const upcoming = db.prepare(`
    SELECT v.*, c.rfid_number, c.breed
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    WHERE c.farmer_id = ? AND v.next_due_date >= ? AND v.next_due_date <= date(?, '+30 days')
    ORDER BY v.next_due_date ASC
  `).all(farmerId, today, today);

  const totalCows = db.prepare('SELECT COUNT(*) as count FROM cows WHERE farmer_id = ?').get(farmerId).count;
  const vaccinatedCows = db.prepare(`
    SELECT COUNT(DISTINCT cow_id) as count
    FROM vaccinations v
    JOIN cows c ON v.cow_id = c.id
    WHERE c.farmer_id = ?
  `).get(farmerId).count;

  return {
    totalCattle: totalCows,
    vaccinatedCattle: vaccinatedCows,
    coveragePercent: totalCows > 0 ? Math.round((vaccinatedCows / totalCows) * 100) : 0,
    overdueCount: overdue.length,
    upcomingCount: upcoming.length,
    overdue: overdue.map(v => ({
      id: v.id,
      cowRFID: v.rfid_number,
      breed: v.breed,
      vaccineName: v.vaccine_name,
      dueDate: v.next_due_date,
    })),
    upcoming: upcoming.map(v => ({
      id: v.id,
      cowRFID: v.rfid_number,
      breed: v.breed,
      vaccineName: v.vaccine_name,
      dueDate: v.next_due_date,
    })),
  };
};

module.exports = {
  getVaccinationCalendar,
  getFarmVaccinationSummary,
};
