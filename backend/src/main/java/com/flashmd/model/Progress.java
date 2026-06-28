package com.flashmd.model;

import java.util.Map;

public record Progress(Map<String, CardState> cards, String lastStudied) {
    public static Progress empty() {
        return new Progress(Map.of(), null);
    }

    public Map<String, CardState> cardsOrEmpty() {
        return cards == null ? Map.of() : cards;
    }
}
