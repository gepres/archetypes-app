import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ArchetypeIllustratedArtwork } from './ArchetypeIllustratedArtwork';
import { escenaDe } from './escenas';
import { ARCHETYPES } from '../../data/archetypesData';
import { ArchetypeId } from '../../types';

const IDS = Object.keys(ARCHETYPES) as ArchetypeId[];
const pintar = (...ids: ArchetypeId[]) =>
  renderToStaticMarkup(
    React.createElement(React.Fragment, null, ...ids.map((archetypeId, i) =>
      React.createElement(ArchetypeIllustratedArtwork, { key: i, archetypeId }))),
  );
const idsDe = (html: string) => [...html.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
const referencias = (html: string) => [...html.matchAll(/url\(#([^)]+)\)/g)].map(m => m[1]);

describe('escenas simbólicas de los arquetipos', () => {
  it('cada uno de los 18 arquetipos tiene su escena (también `constructor`, que no es la función de JavaScript)', () => {
    assert.equal(IDS.length, 18);
    const faltan = IDS.filter(id => typeof escenaDe(id) !== 'function');
    assert.deepEqual(faltan, []);
    assert.notEqual(escenaDe('constructor'), Object.prototype.constructor);
  });

  it('cada escena es un lienzo de 320×380 y todos sus degradados están definidos', () => {
    for (const id of IDS) {
      const html = pintar(id);
      assert.match(html, /^<svg viewBox="0 0 320 380"/, id);
      const definidos = new Set(idsDe(html));
      const rotas = referencias(html).filter(r => !definidos.has(r));
      assert.deepEqual(rotas, [], `${id}: referencias sin definir`);
    }
  });

  it('los ids no se repiten aunque se pinten todas, y dos copias del mismo dibujo, en una página', () => {
    const html = pintar(...IDS, ...IDS);
    const ids = idsDe(html);
    const repetidos = ids.filter((x, i) => ids.indexOf(x) !== i);
    assert.deepEqual(repetidos, []);
  });
});
