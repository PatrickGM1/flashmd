package com.flashmd.model;

import com.fasterxml.jackson.annotation.JsonIgnore;

public record User(
        String id,
        String username,
        String passwordHash,
        Role role,
        String createdAt,
        boolean mustChangePassword,
        /** bumped on every password change or reset: older tokens stop working */
        int tokenVersion
) {
    public enum Role { USER, ADMIN }

    @JsonIgnore
    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public User withPassword(String hash, boolean mustChange) {
        return new User(id, username, hash, role, createdAt, mustChange, tokenVersion + 1);
    }

    public User withRole(Role r) {
        return new User(id, username, passwordHash, r, createdAt, mustChangePassword, tokenVersion + 1);
    }
}
