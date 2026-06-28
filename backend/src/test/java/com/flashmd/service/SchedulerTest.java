package com.flashmd.service;

import com.flashmd.model.CardState;
import com.flashmd.model.Grade;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class SchedulerTest {

    @Test
    void promoteCapsAtMaxBox() {
        assertThat(Scheduler.promote(0)).isEqualTo(1);
        assertThat(Scheduler.promote(Scheduler.MAX_BOX)).isEqualTo(Scheduler.MAX_BOX);
    }

    @Test
    void nextBoxFollowsGrade() {
        assertThat(Scheduler.nextBox(3, Grade.AGAIN)).isZero();
        assertThat(Scheduler.nextBox(3, Grade.HARD)).isEqualTo(3);
        assertThat(Scheduler.nextBox(3, Grade.GOOD)).isEqualTo(4);
        assertThat(Scheduler.nextBox(3, Grade.EASY)).isEqualTo(5);
        assertThat(Scheduler.nextBox(Scheduler.MAX_BOX, Grade.EASY)).isEqualTo(Scheduler.MAX_BOX);
    }

    @Test
    void box0IsAlwaysDue() {
        CardState s = new CardState(0, false, LocalDate.now().toString());
        assertThat(Scheduler.isDue(s, LocalDate.now())).isTrue();
    }

    @Test
    void higherBoxNotDueUntilIntervalElapses() {
        LocalDate seen = LocalDate.of(2025, 1, 1);
        CardState s = new CardState(2, true, seen.toString()); // interval 3 days
        assertThat(Scheduler.isDue(s, seen.plusDays(2))).isFalse();
        assertThat(Scheduler.isDue(s, seen.plusDays(3))).isTrue();
    }

    @Test
    void nullStateIsDue() {
        assertThat(Scheduler.isDue(null, LocalDate.now())).isTrue();
    }
}
