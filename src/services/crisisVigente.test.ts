import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { crisisMarcada, marcarCrisis } from './crisisVigente';

describe('crisis vigente', () => {
  it('se marca y se desmarca por cuenta, sin mezclar cuentas', () => {
    assert.equal(crisisMarcada('cuenta-a'), false);
    marcarCrisis('cuenta-a', true);
    assert.equal(crisisMarcada('cuenta-a'), true);
    assert.equal(crisisMarcada('cuenta-b'), false);
    marcarCrisis('cuenta-a', false);
    assert.equal(crisisMarcada('cuenta-a'), false);
  });
});
