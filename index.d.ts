export type Issuer = string | { id: string; sig?: string };

export interface ObservationInit {
  subject: string;
  predicate: string;
  object: any;
  issuer: Issuer;
  time?: number;
  evidence?: string | null;
  signature?: string | null;
}

export class Observation {
  readonly id: string;
  readonly subject: string;
  readonly predicate: string;
  readonly object: any;
  readonly issuer: Issuer;
  readonly time: number;
  readonly evidence: string | null;
  readonly signature: string | null;
  constructor(init: ObservationInit);
  validate(): boolean;
  toJSON(): object;
}

export declare const FNV_OFFSET: string;
export declare const FNV_PRIME: string;

export declare const OPCODES: {
  BIND: 'BIND';
  LINK: 'LINK';
  EFFECT: 'EFFECT';
  VIEW: 'VIEW';
  TICK: 'TICK';
  ATTEST: 'ATTEST';
  DELEGATE: 'DELEGATE';
  CONTEST: 'CONTEST';
  MERGE: 'MERGE';
  REVOKE: 'REVOKE';
  WITHDRAW: 'WITHDRAW';
};

export declare const EVIDENCE: {
  DIRECT: 'direct';
  WITNESS: 'witness';
  PATTERN: 'pattern';
};

export declare const FORGETTING: {
  BUNDLE: 'bundle';
  TRAVERSAL: 'traversal';
  EVIDENCE: 'evidence';
};

export declare function fnv1a64(str: string): bigint;
export declare function int16Dials(text: string, count?: number): number[];
