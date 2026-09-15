package com.flashmd.controller;

import com.flashmd.auth.CurrentUser;
import com.flashmd.model.User;
import com.flashmd.service.ActivityStore;
import com.flashmd.service.DeckStore;
import com.flashmd.service.UserStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin", description = "Account management (admin only)")
public class AdminController {

    private static final String ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom random = new SecureRandom();
    private final UserStore users;
    private final DeckStore decks;
    private final ActivityStore activity;

    public AdminController(UserStore users, DeckStore decks, ActivityStore activity) {
        this.users = users;
        this.decks = decks;
        this.activity = activity;
    }

    public record Account(String id, String username, String role, String createdAt, boolean mustChangePassword,
                          int decks, int cards, int streak, String lastActive) {}
    public record TempPassword(String password) {}
    public record RoleChange(String role) {}

    @GetMapping("/users")
    @Operation(summary = "All accounts with deck counts and activity")
    public List<Account> list() {
        return users.findAll().stream().map(this::toAccount).toList();
    }

    @PostMapping("/users/{id}/reset-password")
    @Operation(summary = "Set a temporary password the user must change on next login; returned once")
    public TempPassword resetPassword(@PathVariable String id) {
        User u = require(id);
        StringBuilder sb = new StringBuilder(12);
        for (int i = 0; i < 12; i++) sb.append(ALPHABET.charAt(random.nextInt(ALPHABET.length())));
        String temp = sb.toString();
        users.save(u.withPassword(users.hash(temp), true));
        return new TempPassword(temp);
    }

    @PutMapping("/users/{id}/role")
    @Operation(summary = "Promote or demote an account")
    public Account setRole(@PathVariable String id, @RequestBody RoleChange r) {
        User u = require(id);
        User.Role role;
        try { role = User.Role.valueOf(r.role()); }
        catch (Exception e) { throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role must be USER or ADMIN"); }
        if (u.id().equals(CurrentUser.id()) && role != User.Role.ADMIN)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot demote yourself");
        return toAccount(users.save(u.withRole(role)));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Delete an account and all its decks")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        User u = require(id);
        if (u.id().equals(CurrentUser.id()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete yourself");
        decks.findByOwner(id).forEach(d -> decks.delete(d.id()));
        activity.forget(id);
        users.delete(id);
        return ResponseEntity.noContent().build();
    }

    private User require(String id) {
        User u = users.find(id);
        if (u == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
        return u;
    }

    private Account toAccount(User u) {
        var owned = decks.findByOwner(u.id());
        int cards = owned.stream().mapToInt(d -> d.totalCards()).sum();
        return new Account(u.id(), u.username(), u.role().name(), u.createdAt(), u.mustChangePassword(),
                owned.size(), cards, activity.streak(u.id()), activity.lastActive(u.id()));
    }
}
