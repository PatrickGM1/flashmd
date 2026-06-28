package com.flashmd.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
@Tag(name = "Deck", description = "Fetch .md deck files from external URLs")
public class DeckController {

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/fetch-deck")
    @Operation(summary = "Fetch a .md deck from a URL", description = "Proxies the request to bypass CORS and returns the raw .md content")
    public ResponseEntity<String> fetchDeck(
            @Parameter(description = "Raw URL of the .md file", required = true)
            @RequestParam String url) {
        try {
            String content = restTemplate.getForObject(url, String.class);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body("Failed to fetch URL: " + e.getMessage());
        }
    }
}
