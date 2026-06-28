package com.flashmd.model;

import java.util.List;

public record Deck(
        String id,
        String label,
        List<Chapter> chapters,
        Progress progress
) {
    public int totalCards() {
        return chapters.stream().mapToInt(c -> c.cards().size()).sum();
    }

    public Deck withProgress(Progress p) {
        return new Deck(id, label, chapters, p);
    }
}
