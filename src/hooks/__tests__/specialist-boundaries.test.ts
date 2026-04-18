import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadSurface } from './prompt-guidance-test-helpers.js';

describe('specialist boundary contracts', () => {
  it('documents the researcher/dependency-expert/explore boundary matrix at the top level', () => {
    for (const surface of ['AGENTS.md', 'templates/AGENTS.md']) {
      const content = loadSurface(surface);
      assert.match(content, /Specialist boundary matrix for nearby investigation roles/i);
      assert.match(content, /Local code first, then external docs: `explore` → `researcher`/i);
      assert.match(content, /Local code first, then dependency choice\/upgrade evaluation: `explore` → `dependency-expert`/i);
      assert.match(content, /External docs first, then local usage confirmation: `researcher` → `explore`/i);
      assert.match(content, /choose one primary owner, then route adjacent work via explicit upward handoff/i);
    }
  });

  it('keeps researcher focused on external docs and upward handoff boundaries', () => {
    const content = loadSurface('prompts/researcher.md');
    assert.match(content, /You own external technical understanding/i);
    assert.match(content, /You do not own package\/SDK bake-offs, adoption recommendations, or internal repo discovery/i);
    assert.match(content, /report that upward for `dependency-expert`/i);
    assert.match(content, /report that upward for `explore`/i);
  });

  it('keeps dependency-expert focused on dependency choice rather than generic docs or repo search', () => {
    const content = loadSurface('prompts/dependency-expert.md');
    assert.match(content, /not responsible for generic external how-to research, internal codebase search/i);
    assert.match(content, /report those upward for `researcher`/i);
    assert.match(content, /report that upward for `explore`/i);
  });

  it('keeps explore focused on local repo evidence with explicit upward handoffs', () => {
    const content = loadSurface('prompts/explore.md');
    assert.match(content, /not responsible for .*external docs research, or dependency\/package evaluation/i);
    assert.match(content, /report that upward for `researcher`/i);
    assert.match(content, /report that upward for `dependency-expert`/i);
    assert.match(content, /Stay the primary owner only while the question is answerable from local repo evidence/i);
  });
});
