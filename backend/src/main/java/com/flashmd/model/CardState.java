package com.flashmd.model;

/**
 * Per-card study state for spaced repetition (Leitner).
 * box: 0 = just missed / new-wrong, higher = more confident.
 * known: result of the last review. lastSeen: ISO date of last review.
 */
public record CardState(int box, boolean known, String lastSeen) {}
