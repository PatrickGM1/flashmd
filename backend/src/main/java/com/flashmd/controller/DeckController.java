package com.flashmd.controller;

import com.flashmd.controller.dto.CreateDeckRequest;
import com.flashmd.controller.dto.DeckSummary;
import com.flashmd.controller.dto.ProgressRequest;
import com.flashmd.model.CardState;
import com.flashmd.model.Chapter;
import com.flashmd.model.Deck;
import com.flashmd.model.Progress;
import com.flashmd.service.ActivityStore;
import com.flashmd.service.DeckParser;
import com.flashmd.service.DeckStore;
import com.flashmd.service.Scheduler;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "*")
@Tag(name = "Decks", description = "Parse, store and study markdown flashcard decks")
public class DeckController {

    private final DeckParser parser;
    private final DeckStore store;
    private final ActivityStore activity;

    public DeckController(DeckParser parser, DeckStore store, ActivityStore activity) {
        this.parser = parser;
        this.store = store;
        this.activity = activity;
    }

    @GetMapping
    @Operation(summary = "List saved decks with progress summary")
    public List<DeckSummary> list() {
        return store.findAll().stream().map(DeckSummary::of).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a full deck with all cards and progress")
    public Deck get(@PathVariable String id) {
        return require(id);
    }

    @PostMapping
    @Operation(summary = "Create a deck from raw markdown")
    public ResponseEntity<Deck> create(@RequestBody CreateDeckRequest req) {
        List<Chapter> chapters = parser.parse(req.content() == null ? "" : req.content());
        if (chapters.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No flashcards found in deck");
        }
        String label = (req.label() == null || req.label().isBlank()) ? "Untitled deck" : req.label().trim();
        Deck deck = new Deck(UUID.randomUUID().toString(), label, chapters, Progress.empty());
        return ResponseEntity.status(HttpStatus.CREATED).body(store.save(deck));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Replace a deck's content from edited markdown, keeping progress for surviving cards")
    public Deck update(@PathVariable String id, @RequestBody CreateDeckRequest req) {
        Deck deck = require(id);
        List<Chapter> chapters = parser.parse(req.content() == null ? "" : req.content());
        if (chapters.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No flashcards found in deck");
        }
        String label = (req.label() == null || req.label().isBlank()) ? deck.label() : req.label().trim();
        // keep progress only for questions that still exist
        Map<String, CardState> kept = new HashMap<>();
        var existing = deck.progress() == null ? Map.<String, CardState>of() : deck.progress().cardsOrEmpty();
        for (var ch : chapters) {
            for (var card : ch.cards()) {
                if (existing.containsKey(card.question())) {
                    kept.put(card.question(), existing.get(card.question()));
                }
            }
        }
        String lastStudied = deck.progress() == null ? null : deck.progress().lastStudied();
        return store.save(new Deck(deck.id(), label, chapters, new Progress(kept, lastStudied)));
    }

    @PutMapping("/{id}/progress")
    @Operation(summary = "Record a study session's grades and reschedule cards")
    public Deck saveProgress(@PathVariable String id, @RequestBody ProgressRequest req) {
        Deck deck = require(id);
        String today = LocalDate.now().toString();
        Map<String, CardState> cards = new HashMap<>(
                deck.progress() == null ? Map.of() : deck.progress().cardsOrEmpty());

        int graded = 0;
        if (req.grades() != null) {
            for (var entry : req.grades()) {
                if (entry == null || entry.question() == null || entry.grade() == null) continue;
                int prevBox = cards.containsKey(entry.question()) ? cards.get(entry.question()).box() : 0;
                boolean known = entry.grade() != com.flashmd.model.Grade.AGAIN;
                cards.put(entry.question(),
                        new CardState(Scheduler.nextBox(prevBox, entry.grade()), known, today));
                graded++;
            }
        }
        activity.record(graded);
        return store.save(deck.withProgress(new Progress(cards, today)));
    }

    @DeleteMapping("/{id}/progress")
    @Operation(summary = "Reset all study progress for a deck")
    public Deck resetProgress(@PathVariable String id) {
        Deck deck = require(id);
        return store.save(deck.withProgress(Progress.empty()));
    }

    @PutMapping("/{id}/label")
    @Operation(summary = "Rename a deck")
    public Deck rename(@PathVariable String id, @RequestBody RenameRequest req) {
        Deck deck = require(id);
        String label = (req.label() == null || req.label().isBlank()) ? deck.label() : req.label().trim();
        return store.save(new Deck(deck.id(), label, deck.chapters(), deck.progress()));
    }

    public record RenameRequest(String label) {}

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a deck")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!store.delete(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found");
        }
        return ResponseEntity.noContent().build();
    }

    private Deck require(String id) {
        Deck deck = store.find(id);
        if (deck == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Deck not found");
        }
        return deck;
    }
}
