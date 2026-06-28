package com.flashmd.model;

/** How well the user recalled a card, Anki-style. */
public enum Grade {
    AGAIN,  // forgot -> reset to box 0
    HARD,   // recalled with effort -> stay
    GOOD,   // recalled -> promote one box
    EASY    // trivial -> promote two boxes
}
