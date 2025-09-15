// babel.config.js
export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        },
        modules: false // Garde les modules ES6 intacts pour Node.js
      }
    ]
  ],
  env: {
    test: {
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current'
            },
            modules: 'auto' // Laisse babel décider pour les tests
          }
        ]
      ]
    }
  }
};