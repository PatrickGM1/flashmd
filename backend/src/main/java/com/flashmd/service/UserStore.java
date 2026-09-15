package com.flashmd.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.flashmd.model.User;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/** Accounts persisted to a JSON file next to the decks. Passwords are bcrypt hashes. */
@Service
public class UserStore {

    private static final Logger log = LoggerFactory.getLogger(UserStore.class);

    private final ObjectMapper mapper = new ObjectMapper()
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    /** Hash of nothing, compared against when the username is unknown so both paths take the same time. */
    private final String decoy = encoder.encode("decoy");
    private final Map<String, User> users = new LinkedHashMap<>();
    private final Path file;
    private final String adminUser;
    private final String adminPassword;

    public UserStore(@Value("${flashmd.users-file:data/users.json}") String dataFile,
                     @Value("${flashmd.admin-user:admin}") String adminUser,
                     @Value("${flashmd.admin-password:admin}") String adminPassword) {
        this.file = Path.of(dataFile);
        this.adminUser = adminUser;
        this.adminPassword = adminPassword;
    }

    @PostConstruct
    synchronized void load() {
        if (Files.exists(file)) {
            try {
                List<User> stored = mapper.readValue(Files.readAllBytes(file), new TypeReference<>() {});
                for (User u : stored) users.put(u.id(), u);
                log.info("Loaded {} users from {}", users.size(), file.toAbsolutePath());
            } catch (IOException e) {
                log.warn("Could not read users file {}: {}", file, e.getMessage());
            }
        }
        if (users.isEmpty()) {
            // first run: bootstrap the admin. Default credentials must be changed on first login.
            boolean defaultPassword = "admin".equals(adminPassword);
            create(adminUser, adminPassword, User.Role.ADMIN, defaultPassword);
            log.warn("Created admin account '{}'{}", adminUser,
                    defaultPassword ? " with the default password 'admin'; change it on first login" : "");
        }
    }

    private synchronized void persist() {
        try {
            if (file.getParent() != null) Files.createDirectories(file.getParent());
            mapper.writerWithDefaultPrettyPrinter().writeValue(file.toFile(), new ArrayList<>(users.values()));
        } catch (IOException e) {
            log.error("Failed to persist users to {}: {}", file, e.getMessage());
        }
    }

    public synchronized List<User> findAll() {
        return new ArrayList<>(users.values());
    }

    public synchronized User find(String id) {
        return users.get(id);
    }

    public synchronized Optional<User> findByUsername(String username) {
        return users.values().stream().filter(u -> u.username().equalsIgnoreCase(username)).findFirst();
    }

    /** The first admin in the file: owner of everything that predates accounts. */
    public synchronized User firstAdmin() {
        return users.values().stream().filter(User::isAdmin).findFirst().orElseThrow();
    }

    public synchronized User create(String username, String password, User.Role role, boolean mustChange) {
        User u = new User(UUID.randomUUID().toString(), username.trim(), encoder.encode(password), role,
                Instant.now().toString(), mustChange, 0);
        users.put(u.id(), u);
        persist();
        return u;
    }

    public synchronized User save(User u) {
        users.put(u.id(), u);
        persist();
        return u;
    }

    public synchronized boolean delete(String id) {
        boolean removed = users.remove(id) != null;
        if (removed) persist();
        return removed;
    }

    public boolean matches(User u, String password) {
        return encoder.matches(password, u.passwordHash());
    }

    /** Burn the same bcrypt time as a real check, so "no such user" is not faster than "wrong password". */
    public void matchesDecoy(String password) {
        encoder.matches(password, decoy);
    }

    public String hash(String password) {
        return encoder.encode(password);
    }
}
