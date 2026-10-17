import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validatePlayerAge,
  validateNubanAccount,
  calculateWithdrawalFee,
  canWithdraw,
  calculateWatchEarnPayout,
  calculateOfflineProgression,
} from './economy.ts';

test('validatePlayerAge properly validates age restrictions (13 to 100+)', () => {
  // Under 13
  const young = validatePlayerAge(2018, 5, 12, 2026);
  assert.equal(young.valid, false);
  assert.equal(young.age, 8);

  // Exactly 13
  const eligible13 = validatePlayerAge(2013, 1, 1, 2026);
  assert.equal(eligible13.valid, true);
  assert.equal(eligible13.age, 13);

  // Adult 28
  const adult = validatePlayerAge(1998, 10, 4, 2026);
  assert.equal(adult.valid, true);
  assert.equal(adult.age, 28);

  // Senior 102
  const senior = validatePlayerAge(1924, 2, 20, 2026);
  assert.equal(senior.valid, true);
  assert.equal(senior.age, 102);

  // Beyond upper bound
  const invalidAncient = validatePlayerAge(1880, 1, 1, 2026);
  assert.equal(invalidAncient.valid, false);
});

test('validateNubanAccount requires exact 10 numeric digits', () => {
  assert.equal(validateNubanAccount('0123456789'), true);
  assert.equal(validateNubanAccount('9988776655'), true);
  assert.equal(validateNubanAccount('12345'), false); // Too short
  assert.equal(validateNubanAccount('012345678901'), false); // Too long
  assert.equal(validateNubanAccount('012345ABCD'), false); // Contains letters
});

test('calculateWithdrawalFee computes 1.2% with ₦50 minimum and ₦500 maximum cap', () => {
  // Small withdrawal: 1.2% of ₦1,000 = ₦12 -> clamped to ₦50 minimum
  assert.equal(calculateWithdrawalFee(1000), 50);

  // Mid withdrawal: 1.2% of ₦20,000 = ₦240 -> between ₦50 and ₦500
  assert.equal(calculateWithdrawalFee(20000), 240);

  // Large withdrawal: 1.2% of ₦100,000 = ₦1,200 -> capped at ₦500
  assert.equal(calculateWithdrawalFee(100000), 500);
});

test('canWithdraw checks balances and returns net payout correctly', () => {
  // Minimum withdrawal check
  const belowMin = canWithdraw(50000, 300);
  assert.equal(belowMin.allowed, false);

  // Insufficient balance
  const insufficient = canWithdraw(2000, 5000);
  assert.equal(insufficient.allowed, false);

  // Valid withdrawal of ₦10,000 (fee is ₦120, net is ₦9,880)
  const valid = canWithdraw(25000, 10000);
  assert.equal(valid.allowed, true);
  assert.equal(valid.fee, 120);
  assert.equal(valid.totalDeduction, 10000);
  assert.equal(valid.netPayout, 9880);
});

test('calculateWatchEarnPayout calculates streaming earnings accurately', () => {
  const payout0 = calculateWatchEarnPayout(0);
  assert.equal(payout0.nairaEarned, 0);

  // 10 seconds of streaming watch time
  const payout10 = calculateWatchEarnPayout(10);
  assert.equal(payout10.nairaEarned, 50); // 10 * 5 = 50
  assert.equal(payout10.coinsEarned, 4); // 10 * 0.4 = 4

  // With 1.25x VIP multiplier
  const payoutVip = calculateWatchEarnPayout(10, 1.25);
  assert.equal(payoutVip.nairaEarned, 62);
  assert.equal(payoutVip.coinsEarned, 5);
});

test('calculateOfflineProgression awards bounded idle rewards', () => {
  const now = 1000000000000;
  // 3 hours offline
  const threeHoursAgo = now - (3 * 60 * 60 * 1000);
  const prog = calculateOfflineProgression(threeHoursAgo, now);

  assert.equal(prog.hoursElapsed, 3);
  assert.equal(prog.nairaEarned, 3600); // 3 * 1200
  assert.equal(prog.lagCoinsEarned, 90); // 3 * 30
});
