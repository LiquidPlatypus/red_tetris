// jest.config.js
export default {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  
  // Exclure le dossier frontend des tests et de la couverture
  testPathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/coverage/'
  ],
  
  // Configuration de la couverture
  collectCoverageFrom: [
    '**/*.js',
    '!**/node_modules/**',
    '!**/frontend/**',
    '!**/tests/**',
    '!**/coverage/**',
    '!jest.config.js',
    '!babel.config.js'
  ],
  
  // Répertoires à ignorer pour la couverture
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/frontend/',
    '/tests/',
    '/coverage/'
  ],

  coverageThreshold: {
    global: {
      branches: 50,    // minimum 70% de couverture sur les branches
      functions: 70,   // minimum 70% de couverture sur les fonctions
      lines: 70,       // minimum 70% de couverture sur les lignes
      statements: 70   // minimum 70% de couverture sur les statements
    }
  }
};