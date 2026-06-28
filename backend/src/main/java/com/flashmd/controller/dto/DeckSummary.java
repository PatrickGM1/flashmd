package com.flashmd.controller.dto;

import com.flashmd.model.CardState;
import com.flashmd.model.Deck;
import com.flashmd.service.Scheduler;

import java.time.LocalDate;
import java.util.Map;

public record DeckSummary(
        String id,
        String label,
        int totalCards,
        int known,
        int unknown,
        int due,
        String lastStudied
) {
    public static DeckSummary of(Deck deck) {
        Map<String, CardState> cards = deck.progress() == null ? Map.of() : deck.progress().cardsOrEmpty();
        LocalDate today = LocalDate.now();
        int known = 0, unknown = 0, due = 0;
        for (var chapter : deck.chapters()) {
            for (var card : chapter.cards()) {
                CardState s = cards.get(card.question());
                if (s == null) continue;
                if (s.known()) known++; else unknown++;
                if (Scheduler.isDue(s, today)) due++;
            }
        }
        String lastStudied = deck.progress() == null ? null : deck.progress().lastStudied();
        return new DeckSummary(deck.id(), deck.label(), deck.totalCards(), known, unknown, due, lastStudied);
    }
}
