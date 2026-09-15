package com.flashmd.auth;

import org.springframework.stereotype.Component;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Slows down password guessing: after MAX_FAILS wrong attempts for a (client, username)
 * pair, that pair is locked for LOCK_SECONDS. In memory, per instance; good enough
 * against online guessing, which is the only attack it needs to stop.
 */
@Component
public class LoginThrottle {

    static final int MAX_FAILS = 5;
    static final long LOCK_SECONDS = 15 * 60;

    private record Entry(int fails, long lockedUntil) {}
    private final Map<String, Entry> attempts = new ConcurrentHashMap<>();

    /** Seconds until the pair may try again, or 0 if it may try now. */
    public long retryAfter(String client, String username) {
        Entry e = attempts.get(key(client, username));
        if (e == null) return 0;
        long left = e.lockedUntil() - Instant.now().getEpochSecond();
        return left > 0 ? left : 0;
    }

    public void failed(String client, String username) {
        attempts.compute(key(client, username), (k, e) -> {
            int fails = (e == null ? 0 : e.fails()) + 1;
            long until = fails >= MAX_FAILS ? Instant.now().getEpochSecond() + LOCK_SECONDS : 0;
            return new Entry(fails, until);
        });
        if (attempts.size() > 10_000) attempts.clear(); // ponytail: crude memory cap, fine for a self-hosted app
    }

    public void succeeded(String client, String username) {
        attempts.remove(key(client, username));
    }

    private static String key(String client, String username) {
        return client + "|" + username.toLowerCase();
    }
}
