package com.flashmd.model;

import java.util.List;

public record Deck(
        String id,
        String label,
        List<Chapter> chapters,
        Progress progress,
        String ownerId
) {
    public int totalCards() {
        return chapters.stream().mapToInt(c -> c.cards().size()).sum();
    }

    public Deck withProgress(Progress p) {
        return new Deck(id, label, chapters, p, ownerId);
    }

    public Deck withOwner(String owner) {
        return new Deck(id, label, chapters, progress, owner);
    }
}
