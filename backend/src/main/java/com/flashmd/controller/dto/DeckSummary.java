package com.flashmd.controller.dto;

import com.flashmd.model.Deck;
import com.flashmd.model.Progress;

public record DeckSummary(
        String id,
        String label,
        int totalCards,
        int known,
        int unknown,
        String lastStudied
) {
    public static DeckSummary of(Deck deck) {
        Progress p = deck.progress() == null ? Progress.empty() : deck.progress();
        return new DeckSummary(
                deck.id(),
                deck.label(),
                deck.totalCards(),
                p.known() == null ? 0 : p.known().size(),
                p.unknown() == null ? 0 : p.unknown().size(),
                p.lastStudied()
        );
    }
}
