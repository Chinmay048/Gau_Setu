module.exports = {
  // Roles
  ROLES: {
    FARMER: 'farmer',
    VET: 'vet',
    ADMIN: 'admin',
  },

  // Cow Registration Types
  COW_REGISTRATION_TYPES: {
    NEWBORN: 'newborn',
    PURCHASED: 'purchased',
  },

  // Cow Gender
  GENDERS: {
    MALE: 'male',
    FEMALE: 'female',
  },

  // Vaccination Status
  VACCINATION_STATUS: {
    PENDING: 'pending',
    VERIFIED: 'verified',
    EXPIRED: 'expired',
  },

  // Report Status
  REPORT_STATUS: {
    DRAFT: 'draft',
    COMPLETED: 'completed',
    VERIFIED: 'verified',
  },

  // Report Type
  REPORT_TYPE: {
    HEALTH_CHECKUP: 'health_checkup',
    DISEASE_DIAGNOSIS: 'disease_diagnosis',
    POST_TREATMENT: 'post_treatment',
  },

  // Severity Levels
  SEVERITY: {
    MILD: 'mild',
    MODERATE: 'moderate',
    SEVERE: 'severe',
  },

  // Transfer Status
  TRANSFER_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    REJECTED: 'rejected',
  },

  // DNA Status
  DNA_STATUS: {
    NOT_TESTED: 'not_tested',
    PENDING: 'pending',
    VERIFIED: 'verified',
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Invalid email or password',
    USER_EXISTS: 'User already exists',
    USER_NOT_FOUND: 'User not found',
    COW_NOT_FOUND: 'Cow not found',
    UNAUTHORIZED: 'Unauthorized access',
    INVALID_ROLE: 'Invalid user role',
    TOKEN_EXPIRED: 'Token has expired',
    INVALID_TOKEN: 'Invalid token',
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    LOGIN_SUCCESS: 'Login successful',
    REGISTRATION_SUCCESS: 'Registration successful',
    COW_REGISTERED: 'Cow registered successfully',
    REPORT_SUBMITTED: 'Report submitted successfully',
    TRANSFER_INITIATED: 'Transfer initiated successfully',
  },
};
