package com.flashmd.model;

public record User(
        String id,
        String username,
        String passwordHash,
        Role role,
        String createdAt,
        boolean mustChangePassword
) {
    public enum Role { USER, ADMIN }

    public boolean isAdmin() {
        return role == Role.ADMIN;
    }

    public User withPassword(String hash, boolean mustChange) {
        return new User(id, username, hash, role, createdAt, mustChange);
    }

    public User withRole(Role r) {
        return new User(id, username, passwordHash, r, createdAt, mustChangePassword);
    }
}
