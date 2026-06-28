package com.flashmd.service;

import com.flashmd.model.CardState;
import com.flashmd.model.Grade;

import java.time.LocalDate;

/** Leitner spaced-repetition scheduling. */
public final class Scheduler {

    /** Days a card waits in each box before it is due again. */
    static final int[] INTERVAL_DAYS = {0, 1, 3, 7, 16, 30};
    public static final int MAX_BOX = INTERVAL_DAYS.length - 1;

    private Scheduler() {}

    public static int clampBox(int box) {
        return Math.max(0, Math.min(box, MAX_BOX));
    }

    /** Box after a correct answer: promote one level. */
    public static int promote(int box) {
        return clampBox(box) >= MAX_BOX ? MAX_BOX : clampBox(box) + 1;
    }

    /** New box after grading a card. */
    public static int nextBox(int box, Grade grade) {
        int b = clampBox(box);
        return switch (grade) {
            case AGAIN -> 0;
            case HARD -> b;
            case GOOD -> clampBox(b + 1);
            case EASY -> clampBox(b + 2);
        };
    }

    /** A studied card is due once its interval has elapsed since lastSeen. */
    public static boolean isDue(CardState state, LocalDate today) {
        if (state == null || state.lastSeen() == null) return true;
        LocalDate due = LocalDate.parse(state.lastSeen()).plusDays(INTERVAL_DAYS[clampBox(state.box())]);
        return !today.isBefore(due);
    }
}
