const { getDatabase } = require('../database/db');

/**
 * Get mating recommendations for a cow
 * Returns top compatible bulls with health info
 */
const getMatingRecommendations = async (cowId, farmerId) => {
  const db = getDatabase();

  // Verify cow ownership
  const cow = db.prepare(`
    SELECT c.*, f.farm_name, f.location
    FROM cows c
    JOIN farmers f ON c.farmer_id = f.id
    WHERE c.id = ? AND c.farmer_id = ?
  `).get(cowId, farmerId);

  if (!cow) {
    throw new Error('Cow not found or you do not have permission');
  }

  if (cow.gender !== 'female') {
    throw new Error('Mating recommendations are only available for female cows');
  }

  // Get top  3 compatible bulls with full details
  const recommendations = db.prepare(`
    SELECT 
      mc.compatibility_score,
      mc.genetic_diversity_score,
      mc.health_compatibility_score,
      mc.breed_match,
      mc.common_ancestor_generations,
      mc.notes,
      c.id as bull_id,
      c.rfid_number,
      c.breed,
      c.birth_date,
      c.photo_url,
      f.id as farmer_id,
      f.farm_name,
      f.phone_number,
      f.location,
      f.email,
      GROUP_CONCAT(DISTINCT h.condition_name || ' (' || h.status || ')') as health_issues
    FROM mating_compatibility mc
    JOIN cows c ON mc.bull_id = c.id
    JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN health_records h ON c.id = h.cow_id AND h.status IN ('active', 'chronic')
    WHERE mc.cow_id = ?
    GROUP BY mc.id, c.id, f.id
    ORDER BY mc.compatibility_score DESC, mc.recommendation_rank ASC
    LIMIT 3
  `).all(cowId);

  // Add vaccination status for each bull
  const recommendationsWithVaccines = recommendations.map(bull => {
    const vaccines = db.prepare(`
      SELECT vaccine_name, administered_date, next_due_date
      FROM vaccinations
      WHERE cow_id = ?
      ORDER BY next_due_date DESC
    `).all(bull.bull_id);

    const upToDateVaccinations = vaccines.filter(v => {
      if (!v.next_due_date) return true;
      return new Date(v.next_due_date) > new Date();
    }).length;

    return {
      ...bull,
      vaccination_status: {
        total: vaccines.length,
        up_to_date: upToDateVaccinations,
        is_compliant: vaccines.length > 0 && upToDateVaccinations === vaccines.length
      },
      health_issues: bull.health_issues || 'None reported'
    };
  });

  return {
    cow: {
      id: cow.id,
      rfid_number: cow.rfid_number,
      breed: cow.breed,
      birth_date: cow.birth_date,
      farm_name: cow.farm_name,
      location: cow.location
    },
    recommendations: recommendationsWithVaccines
  };
};

/**
 * Get all available bulls across all farmers (for browsing)
 */
const getAllAvailableBulls = async (currentFarmerId) => {
  const db = getDatabase();

  const bulls = db.prepare(`
    SELECT 
      c.id,
      c.rfid_number,
      c.breed,
      c.birth_date,
      c.photo_url,
      f.id as farmer_id,
      f.farm_name,
      f.location,
      f.phone_number,
      GROUP_CONCAT(DISTINCT h.condition_name || ' (' || h.status || ')') as health_issues
    FROM cows c
    JOIN farmers f ON c.farmer_id = f.id
    LEFT JOIN health_records h ON c.id = h.cow_id AND h.status IN ('active', 'chronic')
    WHERE c.gender = 'male' 
      AND c.birth_date < date('now', '-2 years')
    GROUP BY c.id, f.id
    ORDER BY f.farm_name ASC, c.rfid_number ASC
  `).all();

  return bulls.map(bull => ({
    ...bull,
    health_issues: bull.health_issues || 'None reported',
    is_own_bull: bull.farmer_id === currentFarmerId
  }));
};

/**
 * Calculate compatibility between specific cow and bull
 * This is used when farmer manually selects a bull
 */
const calculateCompatibility = async (cowId, bullId, farmerId) => {
  const db = getDatabase();

  // Verify cow ownership
  const cow = db.prepare('SELECT * FROM cows WHERE id = ? AND farmer_id = ?').get(cowId, farmerId);
  if (!cow) {
    throw new Error('Cow not found or you do not have permission');
  }

  const bull = db.prepare('SELECT * FROM cows WHERE id = ? AND gender = ?').get(bullId, 'male');
  if (!bull) {
    throw new Error('Bull not found');
  }

  // Check for existing compatibility score
  let compatibility = db.prepare(`
    SELECT * FROM mating_compatibility 
    WHERE cow_id = ? AND bull_id = ?
  `).get(cowId, bullId);

  if (!compatibility) {
    // Calculate on the fly
    const breedMatch = cow.breed === bull.breed;
    const isRelated = await checkAncestry(cow, bull, db);
    
    const geneticScore = isRelated ? 40 : 95;
    const healthScore = 85; // Simplified
    const totalScore = breedMatch ? (geneticScore + healthScore) / 2 : (geneticScore + healthScore) / 2 - 20;

    compatibility = {
      compatibility_score: Math.round(totalScore),
      genetic_diversity_score: geneticScore,
      health_compatibility_score: healthScore,
      breed_match: breedMatch ? 1 : 0,
      common_ancestor_generations: isRelated ? 2 : null,
      notes: breedMatch ? 'Same breed match' : 'Different breeds'
    };
  }

  return compatibility;
};

/**
 * Check if cow and bull share common ancestors (simplified)
 */
const checkAncestry = async (cow, bull, db) => {
  // Simplified ancestry check - just check parents and grandparents
  const cowAncestors = [cow.father_id, cow.mother_id];
  const bullAncestors = [bull.father_id, bull.mother_id];

  // Check for parent matches
  const hasCommonParent = cowAncestors.some(a => bullAncestors.includes(a));
  
  if (hasCommonParent) return true;

  // Check grandparents
  if (cow.father_id) {
    const cowGrandparents = db.prepare('SELECT father_id, mother_id FROM cows WHERE id = ?').get(cow.father_id);
    if (cowGrandparents) {
      cowAncestors.push(cowGrandparents.father_id, cowGrandparents.mother_id);
    }
  }

  if (bull.father_id) {
    const bullGrandparents = db.prepare('SELECT father_id, mother_id FROM cows WHERE id = ?').get(bull.father_id);
    if (bullGrandparents) {
      bullAncestors.push(bullGrandparents.father_id, bullGrandparents.mother_id);
    }
  }

  return cowAncestors.some(a => a && bullAncestors.includes(a));
};

module.exports = {
  getMatingRecommendations,
  getAllAvailableBulls,
  calculateCompatibility
};
