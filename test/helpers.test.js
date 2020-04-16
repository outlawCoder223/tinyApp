const { assert } = require('chai');

const { checkEmail } = require('../helpers.js');

const testUsers = {
  4519: {
    id: 4519, 
    email: "user@example.com", 
    password: "password"
  },
  9023: {
    id: 9023, 
    email: "user2@example.com", 
    password: "password"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = checkEmail(testUsers, "user@example.com")
    const expectedOutput = '4519';
    assert.strictEqual(user, expectedOutput);
  });
  it('should return false when the email does not match a user', function() {
    const user = checkEmail(testUsers, 'notanemail@example.com');
    assert.isFalse(user);
  });
  it('should return false if no email is provided', function() {
    const user = checkEmail(testUsers, '');
    assert.isFalse(user);
  });
});