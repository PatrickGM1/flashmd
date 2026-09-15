package com.flashmd.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "flashmd.data-file=target/auth-decks.json",
        "flashmd.activity-file=target/auth-activity.json",
        "flashmd.users-file=target/auth-users.json",
        "flashmd.admin-user=root",
        "flashmd.admin-password=rootpassword"
})
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    private MockHttpSession login(String user, String pass) throws Exception {
        var res = mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"" + user + "\",\"password\":\"" + pass + "\"}"))
                .andExpect(status().isOk()).andReturn();
        return (MockHttpSession) res.getRequest().getSession(false);
    }

    /** Users persist to a file across runs, so every test registers fresh names. */
    private static String fresh(String base) {
        return base + System.nanoTime() % 1_000_000;
    }

    private MockHttpSession register(String user) throws Exception {
        var res = mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content("{\"username\":\"" + user + "\",\"password\":\"password123\"}"))
                .andExpect(status().isOk()).andReturn();
        return (MockHttpSession) res.getRequest().getSession(false);
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mvc.perform(get("/api/decks")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordIsRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"root\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void decksAreScopedToTheirOwner() throws Exception {
        var alice = register(fresh("alice"));
        var bob = register(fresh("bob"));
        String deck = mvc.perform(post("/api/decks").session(alice).contentType("application/json")
                        .content("{\"label\":\"A\",\"content\":\"# C\\n## Q?\\nA\\n\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

        mvc.perform(get("/api/decks").session(alice)).andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/decks").session(bob)).andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/decks/" + deck).session(bob)).andExpect(status().isNotFound());

        // admin sees everything
        var root = login("root", "rootpassword");
        mvc.perform(get("/api/decks/" + deck).session(root)).andExpect(status().isOk());
        mvc.perform(get("/api/decks").session(root).param("owner", ownerOf(alice))).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void adminResetsPasswordAndUserMustChangeIt() throws Exception {
        String carolName = fresh("carol");
        var carol = register(carolName);
        String carolId = ownerOf(carol);
        mvc.perform(get("/api/admin/users").session(carol)).andExpect(status().isForbidden());

        var root = login("root", "rootpassword");
        String temp = mvc.perform(post("/api/admin/users/" + carolId + "/reset-password").session(root))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"password\":\"([^\"]+)\".*", "$1");

        var again = login(carolName, temp);
        mvc.perform(get("/api/auth/me").session(again)).andExpect(jsonPath("$.mustChangePassword").value(true));
        mvc.perform(put("/api/auth/password").session(again).contentType("application/json")
                        .content("{\"current\":\"" + temp + "\",\"next\":\"newpassword1\"}"))
                .andExpect(jsonPath("$.mustChangePassword").value(false));
    }

    private String ownerOf(MockHttpSession s) throws Exception {
        return mvc.perform(get("/api/auth/me").session(s)).andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
    }
}
