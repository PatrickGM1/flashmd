package com.flashmd.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashmd.model.Deck;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * In-memory deck registry persisted to a JSON file. No database, no JPA.
 */
@Service
public class DeckStore {

    private static final Logger log = LoggerFactory.getLogger(DeckStore.class);

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final Map<String, Deck> decks = new LinkedHashMap<>();
    private final Path file;

    public DeckStore(@Value("${flashmd.data-file:data/decks.json}") String dataFile) {
        this.file = Path.of(dataFile);
    }

    @PostConstruct
    synchronized void load() {
        if (!Files.exists(file)) {
            return;
        }
        try {
            List<Deck> stored = mapper.readValue(Files.readAllBytes(file), new TypeReference<>() {});
            for (Deck d : stored) {
                decks.put(d.id(), d);
            }
            log.info("Loaded {} decks from {}", decks.size(), file.toAbsolutePath());
        } catch (IOException e) {
            log.warn("Could not read deck file {}: {}", file, e.getMessage());
        }
    }

    private synchronized void persist() {
        try {
            if (file.getParent() != null) {
                Files.createDirectories(file.getParent());
            }
            mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), new ArrayList<>(decks.values()));
        } catch (IOException e) {
            log.error("Failed to persist decks to {}: {}", file, e.getMessage());
        }
    }

    public synchronized List<Deck> findAll() {
        return new ArrayList<>(decks.values());
    }

    public synchronized Deck find(String id) {
        return decks.get(id);
    }

    public synchronized Deck save(Deck deck) {
        decks.put(deck.id(), deck);
        persist();
        return deck;
    }

    public synchronized boolean delete(String id) {
        boolean removed = decks.remove(id) != null;
        if (removed) {
            persist();
        }
        return removed;
    }
}
