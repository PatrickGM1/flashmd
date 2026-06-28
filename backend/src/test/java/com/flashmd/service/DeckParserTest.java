package com.flashmd.service;

import com.flashmd.model.Chapter;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class DeckParserTest {

    private final DeckParser parser = new DeckParser();

    @Test
    void parsesChaptersAndCards() {
        String md = """
                # Ch One
                ## Q1
                A1
                ## Q2
                A2 line one
                A2 line two
                # Ch Two
                ## Q3
                A3
                """;
        List<Chapter> chapters = parser.parse(md);

        assertThat(chapters).hasSize(2);
        assertThat(chapters.get(0).title()).isEqualTo("Ch One");
        assertThat(chapters.get(0).cards()).hasSize(2);
        assertThat(chapters.get(0).cards().get(1).answer()).isEqualTo("A2 line one\nA2 line two");
        assertThat(chapters.get(1).cards().get(0).chapterTitle()).isEqualTo("Ch Two");
    }

    @Test
    void cardsBeforeAnyChapterGoToUncategorized() {
        List<Chapter> chapters = parser.parse("## Lonely\nanswer\n");
        assertThat(chapters).hasSize(1);
        assertThat(chapters.get(0).title()).isEqualTo("Uncategorized");
    }

    @Test
    void skipsCardsWithEmptyAnswer() {
        List<Chapter> chapters = parser.parse("# C\n## NoAnswer\n## HasAnswer\nyes\n");
        assertThat(chapters).hasSize(1);
        assertThat(chapters.get(0).cards()).extracting("question").containsExactly("HasAnswer");
    }

    @Test
    void dropsEmptyChapters() {
        List<Chapter> chapters = parser.parse("# Empty\n# Real\n## Q\nA\n");
        assertThat(chapters).extracting("title").containsExactly("Real");
    }

    @Test
    void handlesCarriageReturns() {
        List<Chapter> chapters = parser.parse("# C\r\n## Q\r\nA\r\n");
        assertThat(chapters.get(0).cards().get(0).answer()).isEqualTo("A");
    }

    @Test
    void emptyInputYieldsNoChapters() {
        assertThat(parser.parse("")).isEmpty();
        assertThat(parser.parse("just some prose, no headings")).isEmpty();
    }
}
