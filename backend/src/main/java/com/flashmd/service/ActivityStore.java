package com.flashmd.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
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

/** Cards reviewed per day, per user, for streaks. Persisted as JSON: { userId: { day: count } }. */
@Service
public class ActivityStore {

    private static final Logger log = LoggerFactory.getLogger(ActivityStore.class);

    private final ObjectMapper mapper = new ObjectMapper();
    private final Map<String, TreeMap<String, Integer>> byUser = new TreeMap<>();
    private final Path file;
    /** A pre-accounts flat { day: count } file, held until an owner is assigned. */
    private TreeMap<String, Integer> legacy;

    public ActivityStore(@Value("${flashmd.activity-file:data/activity.json}") String dataFile) {
        this.file = Path.of(dataFile);
    }

    @PostConstruct
    synchronized void load() {
        if (!Files.exists(file)) return;
        try {
            JsonNode root = mapper.readTree(Files.readAllBytes(file));
            boolean flat = root.isObject() && root.elements().hasNext() && root.elements().next().isNumber();
            if (flat) {
                legacy = mapper.convertValue(root, new TypeReference<TreeMap<String, Integer>>() {});
            } else {
                byUser.putAll(mapper.convertValue(root, new TypeReference<Map<String, TreeMap<String, Integer>>>() {}));
            }
        } catch (IOException e) {
            log.warn("Could not read activity file {}: {}", file, e.getMessage());
        }
    }

    /** Give pre-accounts activity to the user who inherits the old decks. */
    public synchronized void adoptLegacy(String userId) {
        if (legacy == null) return;
        byUser.computeIfAbsent(userId, k -> new TreeMap<>()).putAll(legacy);
        legacy = null;
        persist();
    }

    private synchronized void persist() {
        try {
            if (file.getParent() != null) Files.createDirectories(file.getParent());
            mapper.writeValue(file.toFile(), byUser);
        } catch (IOException e) {
            log.error("Failed to persist activity to {}: {}", file, e.getMessage());
        }
    }

    private TreeMap<String, Integer> days(String userId) {
        return byUser.computeIfAbsent(userId, k -> new TreeMap<>());
    }

    public synchronized void record(String userId, int cards) {
        if (cards <= 0 || userId == null) return;
        days(userId).merge(LocalDate.now().toString(), cards, Integer::sum);
        persist();
    }

    public synchronized void forget(String userId) {
        if (byUser.remove(userId) != null) persist();
    }

    public synchronized int todayCount(String userId) {
        return days(userId).getOrDefault(LocalDate.now().toString(), 0);
    }

    public synchronized String lastActive(String userId) {
        var d = days(userId);
        return d.isEmpty() ? null : d.lastKey();
    }

    /** Consecutive days with activity, counting back from today (or yesterday). */
    public synchronized int streak(String userId) {
        var byDay = days(userId);
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
