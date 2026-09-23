/* global module */

module.exports = {
  root: true,

  env: {
    node: true,
    es2022: true,
  },

  parserOptions: {
    ecmaVersion: 2022,
  },

  extends: [
    "google",
  ],

  rules: {
    "max-len": [
      "error",
      100,
      2,
      {
        ignoreUrls: true,
        ignoreComments: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],

    "require-jsdoc": "off",
    "valid-jsdoc": "off",
  },
};