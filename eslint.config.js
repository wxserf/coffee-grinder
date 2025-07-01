export default [
  {
    files: ["**/*.js"],
    languageOptions: {
      globals: {
        window: "readonly",
        document: "readonly",
        // add more as needed
      }
    }
  }
];
