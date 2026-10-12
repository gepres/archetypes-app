import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { AVATAR_POR_DEFECTO, arquetipoDelAvatar, avatarDe } from './avatar';
import { ARCHETYPES } from './archetypesData';
import { ArchetypeId } from '../types';

const IDS = Object.keys(ARCHETYPES) as ArchetypeId[];

describe('avatar de la cuenta', () => {
  it('cada arquetipo tiene un emoji propio, así que guardarlo y leerlo da el mismo arquetipo', () => {
    assert.equal(new Set(IDS.map(id => ARCHETYPES[id].emoji)).size, 18);
    for (const id of IDS) assert.equal(arquetipoDelAvatar(avatarDe(id)), id);
  });

  it('los emojis de la lista anterior pasan al arquetipo más cercano', () => {
    assert.equal(arquetipoDelAvatar('👑'), 'rey');
    assert.equal(arquetipoDelAvatar('⚔️'), 'guerrero');
    assert.equal(arquetipoDelAvatar('⚔'), 'guerrero');
    assert.equal(arquetipoDelAvatar('🃏'), 'bufon');
    assert.equal(arquetipoDelAvatar('📜'), 'sabio');
    assert.equal(arquetipoDelAvatar('🦅'), 'soberano');
    assert.equal(arquetipoDelAvatar('🦁'), 'heroe');
    assert.equal(arquetipoDelAvatar('🐺'), 'explorador');
  });

  it('sin avatar, o con uno que no se reconoce, queda el de por defecto', () => {
    assert.equal(arquetipoDelAvatar(undefined), AVATAR_POR_DEFECTO);
    assert.equal(arquetipoDelAvatar(''), AVATAR_POR_DEFECTO);
    assert.equal(arquetipoDelAvatar('🍕'), AVATAR_POR_DEFECTO);
    assert.equal(arquetipoDelAvatar('constructor'), AVATAR_POR_DEFECTO);
  });
});
