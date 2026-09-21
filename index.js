// observation-primitive
// The canonical substrate atom, distilled from R10 reverse-engineering.
// observation = { subject, predicate, object, issuer, time, evidence, signature }
//
// Inspired by evintunador/context-graph's evidence-backed typed graph model:
// every observation carries the evidence that justifies it.

const FNV_OFFSET = 0xcbf29ce484222325n;
const FNV_PRIME = 0x100000001b3n;
const MASK_64 = 0xffffffffffffffffn;

// FNV-1a 64-bit on UTF-8 bytes (matches polyformalism fleet canary 0x024a555471370b18d)
function fnv1a64(str) {
  // Accept Buffer, Uint8Array, or string. For strings, encode as UTF-8 bytes (matches python `bytes(str, 'utf-8')`).
  let bytes;
  if (Buffer.isBuffer(str) || str instanceof Uint8Array) {
    bytes = str;
  } else {
    bytes = Buffer.from(String(str), 'utf-8');
  }
  let hash = FNV_OFFSET;
  for (let i = 0; i < bytes.length; i++) {
    hash = BigInt(hash ^ BigInt(bytes[i]));
    hash = BigInt(hash * FNV_PRIME);
  }
  return BigInt(hash & MASK_64);
}

// Padded hex string (so 0x024a... doesn't drop the leading 0)
function fnv1a64Hex(str) {
  const h = fnv1a64(str);
  return h.toString(16).padStart(16, '0');
}

// Signed int16 dial from observation hash (for live-canon /api/cell submission)
function int16Dials(text, count = 16) {
  const h = fnv1a64(text);
  const dials = new Array(count).fill(0);
  let seed = h;
  let nonzeroCount = 0;
  for (let i = 0; i < count; i++) {
    const v = Number(seed & 0xffffn);
    const dial = v > 32767 ? v - 65536 : v;
    dials[i] = dial;
    if (dial !== 0) {
      nonzeroCount++;
      seed = (seed * FNV_PRIME + BigInt(dial)) & MASK_64;
    }
    if (nonzeroCount >= 7) break;
  }
  return dials;
}

// The observation type
class Observation {
  constructor({ subject, predicate, object, issuer, time, evidence, signature }) {
    if (!subject || !predicate || object === undefined || !issuer) {
      throw new Error('observation requires subject, predicate, object, issuer');
    }
    this.subject = subject;
    this.predicate = predicate;
    this.object = object;
    this.issuer = issuer;
    this.time = time ?? Date.now();
    this.evidence = evidence ?? null;
    this.signature = signature ?? null;
    this.id = this.computeId();
  }

  computeId() {
    const payload = JSON.stringify({
      s: this.subject,
      p: this.predicate,
      o: this.object,
      i: this.issuer,
      t: this.time,
    });
    return fnv1a64Hex(payload);
  }

  validate() {
    return !!this.id && !!this.issuer;
  }

  toJSON() {
    return {
      id: this.id,
      subject: this.subject,
      predicate: this.predicate,
      object: this.object,
      issuer: this.issuer,
      time: this.time,
      evidence: this.evidence,
      signature: this.signature,
    };
  }
}

// The 11 typed opcodes (5 base + 6 missing from R10)
const OPCODES = {
  BIND: 'BIND',         // (obs, obs) -> bundle
  LINK: 'LINK',         // (obs, obs) -> link
  EFFECT: 'EFFECT',     // obs -> world
  VIEW: 'VIEW',         // bundle -> display
  TICK: 'TICK',         // world -> obs

  ATTEST: 'ATTEST',     // obs -> trust_score (proposed R10)
  DELEGATE: 'DELEGATE', // (issuer, issuer) -> authority_transfer (proposed R10)
  CONTEST: 'CONTEST',   // obs -> counter_obs (proposed R10)
  MERGE: 'MERGE',       // (obs, obs) -> composed_obs (proposed R10)
  REVOKE: 'REVOKE',     // obs -> superseded_obs (proposed R10)
  WITHDRAW: 'WITHDRAW', // obs -> retracted_obs (proposed R10)
};

// Three forms of evidence (R10 canonical)
const EVIDENCE = {
  DIRECT: 'direct',     // FNV-1a hash proves this happened
  WITNESS: 'witness',   // other observations corroborate
  PATTERN: 'pattern',   // JEPA detects this fits
};

// Three kinds of forgetting (R10 canonical)
const FORGETTING = {
  BUNDLE: 'bundle',         // archive (bundle unreachable)
  TRAVERSAL: 'traversal',   // scar (path lost, observation preserved)
  EVIDENCE: 'evidence',     // decay (no longer verifiable)
};

module.exports = {
  Observation,
  OPCODES,
  EVIDENCE,
  FORGETTING,
  fnv1a64,
  fnv1a64Hex,
  int16Dials,
  FNV_OFFSET: FNV_OFFSET.toString(16).padStart(16, '0'),
  FNV_PRIME: FNV_PRIME.toString(16),
};
