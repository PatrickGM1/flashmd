package com.flashmd.controller;

import com.flashmd.controller.dto.CreateDeckRequest;
import com.flashmd.controller.dto.DeckSummary;
import com.flashmd.controller.dto.ProgressRequest;
import com.flashmd.model.Chapter;
import com.flashmd.model.Deck;
import com.flashmd.model.Progress;
import com.flashmd.service.DeckParser;
import com.flashmd.service.DeckStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/decks")
@CrossOrigin(origins = "*")
@Tag(name = "Decks", description = "Parse, store and study markdown flashcard decks")
public class DeckController {

    private final DeckParser parser;
    private final DeckStore store;

    public DeckController(DeckParser parser, DeckStore store) {
        this.parser = parser;
        this.store = store;
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

    @PutMapping("/{id}/progress")
    @Operation(summary = "Save known/missed questions for a deck")
    public Deck saveProgress(@PathVariable String id, @RequestBody ProgressRequest req) {
        Deck deck = require(id);
        Progress progress = new Progress(
                req.known() == null ? List.of() : req.known(),
                req.unknown() == null ? List.of() : req.unknown(),
                LocalDate.now().toString()
        );
        return store.save(deck.withProgress(progress));
    }

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
