package com.flashmd.service;

import com.flashmd.model.Card;
import com.flashmd.model.Chapter;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Parses a flashmd markdown deck:
 *   # Chapter   -> chapter heading
 *   ## Question -> card question
 *   body lines  -> answer (until next ## or #)
 */
@Component
public class DeckParser {

    public List<Chapter> parse(String content) {
        List<MutableChapter> chapters = new ArrayList<>();
        MutableChapter current = null;
        String question = null;
        List<String> answer = new ArrayList<>();

        String[] lines = content.split("\n", -1);
        for (String raw : lines) {
            String line = stripTrailing(raw);

            if (line.startsWith("# ")) {
                current = flushCard(current, question, answer);
                question = null;
                answer = new ArrayList<>();
                current = new MutableChapter(line.substring(2).trim());
                chapters.add(current);
            } else if (line.startsWith("## ")) {
                current = flushCard(current, question, answer);
                answer = new ArrayList<>();
                if (current == null) {
                    current = new MutableChapter("Uncategorized");
                    chapters.add(current);
                }
                question = line.substring(3).trim();
            } else if (question != null) {
                answer.add(line);
            }
        }
        flushCard(current, question, answer);

        List<Chapter> result = new ArrayList<>();
        for (MutableChapter ch : chapters) {
            if (!ch.cards.isEmpty()) {
                result.add(new Chapter(ch.title, ch.cards));
            }
        }
        return result;
    }

    private MutableChapter flushCard(MutableChapter chapter, String question, List<String> answerLines) {
        if (question != null && chapter != null) {
            String answer = String.join("\n", answerLines).trim();
            if (!answer.isEmpty()) {
                chapter.cards.add(new Card(question, answer, chapter.title));
            }
        }
        return chapter;
    }

    private String stripTrailing(String s) {
        int end = s.length();
        while (end > 0 && (s.charAt(end - 1) == ' ' || s.charAt(end - 1) == '\r' || s.charAt(end - 1) == '\t')) {
            end--;
        }
        return s.substring(0, end);
    }

    private static final class MutableChapter {
        final String title;
        final List<Card> cards = new ArrayList<>();
        MutableChapter(String title) { this.title = title; }
    }
}
