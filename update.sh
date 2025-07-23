touch package.json
echo '{
  "name": "red_tetris",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^5.1.0",
    "lodash": "^4.17.21",
    "socket.io": "^4.8.1"
  }
}' > package.json
npm install

touch frontend/package.json
echo '{
  "name": "red-tetris",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:run": "vitest run",
    "coverage": "vitest run --coverage",
    "prepare": "cypress install",
    "test:e2e": "start-server-and-test preview http://localhost:4173/ 'cypress run --e2e'",
    "test:e2e:dev": "start-server-and-test 'vite dev --port 4173' http://localhost:4173/ 'cypress open --e2e'",
    "lint": "eslint . --fix",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "socket.io-client": "^4.8.1",
    "vue": "^3.5.17",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@eslint/js": "^9.29.0",
    "@vitejs/plugin-vue": "^6.0.0",
    "@vitest/coverage-v8": "^3.2.4",
    "@vitest/eslint-plugin": "^1.2.7",
    "@vitest/ui": "^3.2.4",
    "@vue/eslint-config-prettier": "^10.2.0",
    "@vue/test-utils": "^2.4.6",
    "cypress": "^14.5.0",
    "eslint": "^9.29.0",
    "eslint-plugin-cypress": "^5.1.0",
    "eslint-plugin-vue": "~10.2.0",
    "globals": "^16.2.0",
    "jsdom": "^26.1.0",
    "prettier": "3.5.3",
    "start-server-and-test": "^2.0.12",
    "vite": "^7.0.0",
    "vite-plugin-vue-devtools": "^7.7.7",
    "vitest": "^3.2.4"
  }
}' > frontend/package.json
cd frontend && npm install