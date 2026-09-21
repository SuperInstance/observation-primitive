const { Observation, OPCODES, EVIDENCE, FORGETTING, fnv1a64, int16Dials, FNV_OFFSET } = require('./index.js');

console.log('=== FNV-1a canary ===');
console.log('offset', FNV_OFFSET);
console.log('pn_accent δ japanese =', fnv1a64('café Δ 日本語').toString(16));
console.log('expected = 024a555471370b18d');

console.log('\n=== Dial for canon submission ===');
console.log(int16Dials('the witness as prediction'));

console.log('\n=== Sample observation ===');
const o = new Observation({
  subject: 'substrate',
  predicate: 'has_primitive',
  object: 'observation',
  issuer: 'casey',
  evidence: fnv1a64('witnessed at R10').toString(16),
});
console.log('id:', o.id);
console.log('validate:', o.validate());
console.log('json:', o.toJSON());

console.log('\n=== Opcodes ===');
console.log(OPCODES);
console.log('11 total:', Object.keys(OPCODES).length);

console.log('\n=== Three evidence forms ===');
console.log(EVIDENCE);
console.log('=== Three forgetting forms ===');
console.log(FORGETTING);
