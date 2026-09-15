package com.flashmd.controller;

import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.hasSize;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "flashmd.data-file=target/auth-decks.json",
        "flashmd.activity-file=target/auth-activity.json",
        "flashmd.users-file=target/auth-users.json",
        "flashmd.jwt-secret-file=target/auth-jwt.secret",
        "flashmd.admin-user=root",
        "flashmd.admin-password=rootpassword"
})
class AuthControllerTest {

    @Autowired
    MockMvc mvc;

    /** Users persist to a file across runs, so every test registers fresh names. */
    private static String fresh(String base) {
        return base + System.nanoTime() % 1_000_000;
    }

    private static Cookie tokenOf(MvcResult r) {
        Cookie c = r.getResponse().getCookie("flashmd_token");
        assertNotNull(c, "login should set the auth cookie");
        assertTrue(c.isHttpOnly(), "cookie must be httpOnly");
        return c;
    }

    private Cookie login(String user, String pass) throws Exception {
        return tokenOf(mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"" + user + "\",\"password\":\"" + pass + "\"}"))
                .andExpect(status().isOk()).andReturn());
    }

    private Cookie register(String user) throws Exception {
        return tokenOf(mvc.perform(post("/api/auth/register").contentType("application/json")
                        .content("{\"username\":\"" + user + "\",\"password\":\"password123\"}"))
                .andExpect(status().isOk()).andReturn());
    }

    @Test
    void anonymousIsRejected() throws Exception {
        mvc.perform(get("/api/decks")).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());
    }

    @Test
    void wrongPasswordAndForgedTokenAreRejected() throws Exception {
        mvc.perform(post("/api/auth/login").contentType("application/json")
                        .content("{\"username\":\"root\",\"password\":\"nope\"}"))
                .andExpect(status().isUnauthorized());
        Cookie real = login("root", "rootpassword");
        String[] parts = real.getValue().split("\\.");
        Cookie forged = new Cookie("flashmd_token", parts[0] + "." + parts[1] + ".AAAA");
        mvc.perform(get("/api/auth/me").cookie(forged)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").cookie(real)).andExpect(status().isOk());
    }

    @Test
    void repeatedFailuresLockTheAccountForThatClient() throws Exception {
        String name = fresh("locked");
        register(name);
        for (int i = 0; i < 5; i++) {
            mvc.perform(post("/api/auth/login").header("X-Forwarded-For", "10.9.9.9").contentType("application/json")
                            .content("{\"username\":\"" + name + "\",\"password\":\"wrong\"}"))
                    .andExpect(status().isUnauthorized());
        }
        // right password, still locked for this client
        mvc.perform(post("/api/auth/login").header("X-Forwarded-For", "10.9.9.9").contentType("application/json")
                        .content("{\"username\":\"" + name + "\",\"password\":\"password123\"}"))
                .andExpect(status().isTooManyRequests());
        // a different client is unaffected
        mvc.perform(post("/api/auth/login").header("X-Forwarded-For", "10.1.1.1").contentType("application/json")
                        .content("{\"username\":\"" + name + "\",\"password\":\"password123\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void decksAreScopedToTheirOwner() throws Exception {
        var alice = register(fresh("alice"));
        var bob = register(fresh("bob"));
        String deck = mvc.perform(post("/api/decks").cookie(alice).contentType("application/json")
                        .content("{\"label\":\"A\",\"content\":\"# C\\n## Q?\\nA\\n\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");

        mvc.perform(get("/api/decks").cookie(alice)).andExpect(jsonPath("$", hasSize(1)));
        mvc.perform(get("/api/decks").cookie(bob)).andExpect(jsonPath("$", hasSize(0)));
        mvc.perform(get("/api/decks/" + deck).cookie(bob)).andExpect(status().isNotFound());

        // admin sees everything
        var root = login("root", "rootpassword");
        mvc.perform(get("/api/decks/" + deck).cookie(root)).andExpect(status().isOk());
        mvc.perform(get("/api/decks").cookie(root).param("owner", ownerOf(alice))).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void adminResetsPasswordAndOldTokensDie() throws Exception {
        String carolName = fresh("carol");
        var carol = register(carolName);
        String carolId = ownerOf(carol);
        mvc.perform(get("/api/admin/users").cookie(carol)).andExpect(status().isForbidden());

        var root = login("root", "rootpassword");
        String temp = mvc.perform(post("/api/admin/users/" + carolId + "/reset-password").cookie(root))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString().replaceAll(".*\"password\":\"([^\"]+)\".*", "$1");

        // the token carol had before the reset is now worthless
        mvc.perform(get("/api/auth/me").cookie(carol)).andExpect(status().isUnauthorized());

        var again = login(carolName, temp);
        mvc.perform(get("/api/auth/me").cookie(again)).andExpect(jsonPath("$.mustChangePassword").value(true));
        var changed = tokenOf(mvc.perform(put("/api/auth/password").cookie(again).contentType("application/json")
                        .content("{\"current\":\"" + temp + "\",\"next\":\"newpassword1\"}"))
                .andExpect(jsonPath("$.mustChangePassword").value(false)).andReturn());
        mvc.perform(get("/api/auth/me").cookie(again)).andExpect(status().isUnauthorized());
        mvc.perform(get("/api/auth/me").cookie(changed)).andExpect(status().isOk());
    }

    @Test
    void logoutClearsTheCookie() throws Exception {
        var root = login("root", "rootpassword");
        Cookie cleared = mvc.perform(post("/api/auth/logout").cookie(root)).andExpect(status().isOk())
                .andReturn().getResponse().getCookie("flashmd_token");
        assertNotNull(cleared);
        assertEquals(0, cleared.getMaxAge());
    }

    private String ownerOf(Cookie c) throws Exception {
        return mvc.perform(get("/api/auth/me").cookie(c)).andReturn().getResponse().getContentAsString()
                .replaceAll(".*\"id\":\"([^\"]+)\".*", "$1");
    }
}
