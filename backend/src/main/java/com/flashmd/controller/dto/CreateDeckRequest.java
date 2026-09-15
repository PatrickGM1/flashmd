package com.flashmd.controller.dto;

/** owner is honored only for admins; everyone else creates decks for themselves. */
public record CreateDeckRequest(String label, String content, String owner) {}
