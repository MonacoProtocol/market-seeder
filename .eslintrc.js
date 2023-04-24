module.exports = {
  env: {
    es6: true,
    browser: true,
    es2021: true,
    node: true
  },
  parser: "@typescript-eslint/parser",
  // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 12,
    // Allows for the parsing of modern ECMAScript features
    sourceType: "module"
  },
  settings: {
    react: {
      version: "detect" // Tells eslint-plugin-react to automatically detect the version of React to use
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "prettier"
  ],
  rules: {
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        varsIgnorePattern: "^_"
      }
    ],
    "prettier/prettier": "error" // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
  },
  plugins: ["@typescript-eslint", "prettier"]
};
