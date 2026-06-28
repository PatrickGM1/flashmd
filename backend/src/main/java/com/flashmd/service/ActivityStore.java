package com.flashmd.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.Map;
import java.util.TreeMap;

/** Tracks how many cards were reviewed each day, for streaks. Persisted as JSON. */
@Service
public class ActivityStore {

    private static final Logger log = LoggerFactory.getLogger(ActivityStore.class);

    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, Integer> byDay = new TreeMap<>();
    private final Path file;

    public ActivityStore(@Value("${flashmd.activity-file:data/activity.json}") String dataFile) {
        this.file = Path.of(dataFile);
    }

    @PostConstruct
    synchronized void load() {
        if (!Files.exists(file)) return;
        try {
            byDay.putAll(mapper.readValue(Files.readAllBytes(file), new TypeReference<Map<String, Integer>>() {}));
        } catch (IOException e) {
            log.warn("Could not read activity file {}: {}", file, e.getMessage());
        }
    }

    private synchronized void persist() {
        try {
            if (file.getParent() != null) Files.createDirectories(file.getParent());
            mapper.writeValue(file.toFile(), byDay);
        } catch (IOException e) {
            log.error("Failed to persist activity to {}: {}", file, e.getMessage());
        }
    }

    public synchronized void record(int cards) {
        if (cards <= 0) return;
        String today = LocalDate.now().toString();
        byDay.merge(today, cards, Integer::sum);
        persist();
    }

    public synchronized int todayCount() {
        return byDay.getOrDefault(LocalDate.now().toString(), 0);
    }

    /** Consecutive days with activity, counting back from today (or yesterday). */
    public synchronized int streak() {
        LocalDate day = LocalDate.now();
        if (!byDay.containsKey(day.toString())) {
            day = day.minusDays(1);
            if (!byDay.containsKey(day.toString())) return 0;
        }
        int streak = 0;
        while (byDay.getOrDefault(day.toString(), 0) > 0) {
            streak++;
            day = day.minusDays(1);
        }
        return streak;
    }
}
