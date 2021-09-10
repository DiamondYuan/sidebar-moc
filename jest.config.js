const { jsWithBabel } = require('ts-jest/presets')


module.exports = {
  ...jsWithBabel,
  transform:
    { '^.+\\.jsx?$': 'babel-jest', '^.+\\.tsx?$': 'ts-jest', },
  testEnvironment: 'node',
  "transformIgnorePatterns": [],
};