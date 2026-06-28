package com.flashmd.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "flashmd.data-file=target/test-decks.json",
        "flashmd.activity-file=target/test-activity.json"
})
class DeckControllerTest {

    @Autowired
    MockMvc mvc;

    private String createSampleDeck() throws Exception {
        String body = """
                {"label":"T","content":"# C\\n## What is 2+2?\\n4\\n## Capital of France?\\nParis\\n"}""";
        String json = mvc.perform(post("/api/decks").contentType("application/json").content(body))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.chapters[0].cards", hasSize(2)))
                .andReturn().getResponse().getContentAsString();
        return json.replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
    }

    @Test
    void createRejectsDeckWithNoCards() throws Exception {
        mvc.perform(post("/api/decks").contentType("application/json").content("{\"label\":\"x\",\"content\":\"no headings\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void gradingReschedulesCards() throws Exception {
        String id = createSampleDeck();

        mvc.perform(put("/api/decks/" + id + "/progress")
                        .contentType("application/json")
                        .content("{\"grades\":[{\"question\":\"What is 2+2?\",\"grade\":\"GOOD\"},{\"question\":\"Capital of France?\",\"grade\":\"AGAIN\"}]}"))
                .andExpect(status().isOk());

        mvc.perform(get("/api/decks/" + id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.progress.cards['What is 2+2?'].known").value(true))
                .andExpect(jsonPath("$.progress.cards['What is 2+2?'].box").value(1))
                .andExpect(jsonPath("$.progress.cards['Capital of France?'].known").value(false))
                .andExpect(jsonPath("$.progress.cards['Capital of France?'].box").value(0));
    }

    @Test
    void resetProgressClearsCards() throws Exception {
        String id = createSampleDeck();
        mvc.perform(put("/api/decks/" + id + "/progress")
                        .contentType("application/json")
                        .content("{\"grades\":[{\"question\":\"What is 2+2?\",\"grade\":\"EASY\"}]}"))
                .andExpect(status().isOk());

        mvc.perform(delete("/api/decks/" + id + "/progress")).andExpect(status().isOk());

        mvc.perform(get("/api/decks/" + id))
                .andExpect(jsonPath("$.progress.cards").isEmpty());
    }

    @Test
    void renameChangesLabel() throws Exception {
        String id = createSampleDeck();
        mvc.perform(put("/api/decks/" + id + "/label")
                        .contentType("application/json").content("{\"label\":\"Renamed\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.label").value("Renamed"));
    }

    @Test
    void missingDeckReturns404() throws Exception {
        mvc.perform(get("/api/decks/does-not-exist")).andExpect(status().isNotFound());
    }
}
