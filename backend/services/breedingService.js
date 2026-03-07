const { getDatabase } = require('../database/db');

/**
 * Phase 2: Genetic Breeding Advisor
 * Unlocks only after DNA is VERIFIED
 */

// ─── Get Breeding Recommendations ────────────────────────

const getBreedingRecommendations = (cowId, farmerId) => {
  const db = getDatabase();

  const cow = db.prepare(`
    SELECT c.*, g.a2_gene_status, g.heat_tolerance, g.disease_resistance, g.milk_yield_potential, g.lineage_purity
    FROM cows c
    LEFT JOIN cow_genetics g ON c.id = g.cow_id
    WHERE c.id = ? AND c.farmer_id = ?
  `).get(cowId, farmerId);

  if (!cow) throw new Error('Cow not found or not authorized');
  if (cow.gender !== 'female') throw new Error('Breeding recommendations available only for female cows');
  if (cow.dna_status !== 'verified') throw new Error('DNA must be verified before accessing breeding advisor. Current status: ' + cow.dna_status);

  // Get all verified bulls with genetics
  const bulls = db.prepare(`
    SELECT c.id, c.rfid_number, c.breed, c.birth_date, c.farmer_id, c.father_id, c.mother_id,
           g.a2_gene_status, g.heat_tolerance, g.disease_resistance, g.milk_yield_potential, g.lineage_purity,
           f.farm_name, f.location, f.phone_number
    FROM cows c
    JOIN cow_genetics g ON c.id = g.cow_id
    JOIN farmers f ON c.farmer_id = f.id
    WHERE c.gender = 'male' AND c.dna_status = 'verified'
    ORDER BY c.breed ASC
  `).all();

  const recommendations = bulls.map(bull => {
    const compatibility = calculateGeneticCompatibility(cow, bull, db);
    return {
      bullId: bull.id,
      bullRFID: bull.rfid_number,
      breed: bull.breed,
      birthDate: bull.birth_date,
      farmName: bull.farm_name,
      location: bull.location,
      farmerPhone: bull.phone_number,
      genetics: {
        a2GeneStatus: bull.a2_gene_status,
        heatTolerance: bull.heat_tolerance,
        diseaseResistance: bull.disease_resistance,
        milkYieldPotential: bull.milk_yield_potential,
        lineagePurity: bull.lineage_purity,
      },
      ...compatibility,
    };
  });

  // Sort by compatibility score
  recommendations.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

  return {
    cow: {
      id: cow.id,
      rfidNumber: cow.rfid_number,
      breed: cow.breed,
      a2GeneStatus: cow.a2_gene_status,
      dnaStatus: cow.dna_status,
    },
    recommendations: recommendations.slice(0, 5),
    totalBullsEvaluated: recommendations.length,
  };
};

// ─── Calculate Genetic Compatibility ─────────────────────

const calculateGeneticCompatibility = (cow, bull, db) => {
  // A2 gene compatibility
  let a2Score = 50;
  if (cow.a2_gene_status === 'A2A2' && bull.a2_gene_status === 'A2A2') a2Score = 100;
  else if (cow.a2_gene_status === 'A2A2' || bull.a2_gene_status === 'A2A2') a2Score = 75;
  else if (cow.a2_gene_status === 'A1A2' && bull.a2_gene_status === 'A1A2') a2Score = 50;
  else if (cow.a2_gene_status === 'A1A1' || bull.a2_gene_status === 'A1A1') a2Score = 25;

  // Breed match bonus
  const breedMatch = cow.breed === bull.breed;
  const breedScore = breedMatch ? 95 : 60;

  // Heat tolerance combination
  const heatScore = Math.round((cow.heat_tolerance + bull.heat_tolerance) / 2);

  // Disease resistance
  const diseaseScore = Math.round((cow.disease_resistance + bull.disease_resistance) / 2);

  // Milk yield potential (from cow side weighted more)
  const milkScore = Math.round((cow.milk_yield_potential * 0.6 + bull.milk_yield_potential * 0.4));

  // Inbreeding risk check
  const inbreedingRisk = checkInbreedingRisk(cow, bull, db);

  // Genetic diversity (penalize if related)
  const diversityScore = inbreedingRisk === 'none' ? 95 : (inbreedingRisk === 'low' ? 70 : (inbreedingRisk === 'medium' ? 40 : 15));

  // Weighted compatibility score
  const compatibilityScore = Math.round(
    a2Score * 0.20 +
    breedScore * 0.15 +
    diversityScore * 0.25 +
    heatScore * 0.10 +
    diseaseScore * 0.15 +
    milkScore * 0.15
  );

  // Predicted offspring traits
  const offspringPrediction = {
    a2Probability: cow.a2_gene_status === 'A2A2' && bull.a2_gene_status === 'A2A2' ? '100%' :
                   (cow.a2_gene_status === 'A2A2' || bull.a2_gene_status === 'A2A2') ? '75%' : '50%',
    estimatedHeatTolerance: heatScore,
    estimatedDiseaseResistance: diseaseScore,
    estimatedMilkYield: milkScore,
  };

  return {
    compatibilityScore,
    a2Score,
    breedMatch,
    breedScore,
    geneticDiversityScore: diversityScore,
    inbreedingRisk,
    heatScore,
    diseaseScore,
    milkScore,
    offspringPrediction,
    recommendation: compatibilityScore >= 80 ? 'Highly Recommended' :
                    compatibilityScore >= 60 ? 'Recommended' :
                    compatibilityScore >= 40 ? 'Acceptable' : 'Not Recommended',
  };
};

// ─── Inbreeding Risk Check ───────────────────────────────

const checkInbreedingRisk = (cow, bull, db) => {
  const cowAncestors = getAncestors(cow.id || cow, db, 3);
  const bullAncestors = getAncestors(bull.id, db, 3);

  const common = cowAncestors.filter(a => bullAncestors.includes(a));

  if (common.length === 0) return 'none';
  if (common.length <= 1) return 'low';
  if (common.length <= 3) return 'medium';
  return 'high';
};

const getAncestors = (cowId, db, depth) => {
  if (depth <= 0 || !cowId) return [];

  const cow = db.prepare('SELECT father_id, mother_id FROM cows WHERE id = ?').get(cowId);
  if (!cow) return [];

  const ancestors = [];
  if (cow.father_id) {
    ancestors.push(cow.father_id);
    ancestors.push(...getAncestors(cow.father_id, db, depth - 1));
  }
  if (cow.mother_id) {
    ancestors.push(cow.mother_id);
    ancestors.push(...getAncestors(cow.mother_id, db, depth - 1));
  }

  return ancestors;
};

// ─── Get Cow Genetics ────────────────────────────────────

const getCowGenetics = (cowId) => {
  const db = getDatabase();

  const genetics = db.prepare(`
    SELECT g.*, c.rfid_number, c.breed, c.dna_status
    FROM cow_genetics g
    JOIN cows c ON g.cow_id = c.id
    WHERE g.cow_id = ?
  `).get(cowId);

  if (!genetics) throw new Error('Genetics data not available for this cow');

  return {
    cowId: genetics.cow_id,
    rfidNumber: genetics.rfid_number,
    breed: genetics.breed,
    dnaStatus: genetics.dna_status,
    a2GeneStatus: genetics.a2_gene_status,
    heatTolerance: genetics.heat_tolerance,
    diseaseResistance: genetics.disease_resistance,
    milkYieldPotential: genetics.milk_yield_potential,
    lineagePurity: genetics.lineage_purity,
  };
};

module.exports = {
  getBreedingRecommendations,
  getCowGenetics,
};
