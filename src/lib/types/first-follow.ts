/**
 * Represents the set of terminals that can appear first
 * in a derivation from a given symbol
 */
export type FirstSet = Set<string>;
export type FirstSets = Map<string, FirstSet>;

/**
 * Represents the set of terminals that can follow
 * a given non-terminal in any derivation
 */
export type FollowSet = Set<string>;
export type FollowSets = Map<string, FollowSet>;