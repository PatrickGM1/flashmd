package com.flashmd.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;

/**
 * Minimal HS256 JWT: header.payload.signature, base64url, no library.
 * Claims: sub (user id), role, v (token version), iat, exp.
 * The secret comes from FLASHMD_JWT_SECRET or is generated once and kept next to the data.
 */
@Component
public class Jwt {

    private static final Logger log = LoggerFactory.getLogger(Jwt.class);
    private static final String HEADER = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}".getBytes(StandardCharsets.UTF_8));
    private final byte[] secret;

    public record Claims(String userId, String role, int version, long exp) {}

    public Jwt(@Value("${flashmd.jwt-secret:}") String configured,
               @Value("${flashmd.jwt-secret-file:data/jwt.secret}") String secretFile) {
        this.secret = configured.isBlank() ? loadOrCreate(Path.of(secretFile)) : configured.getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) log.warn("JWT secret is shorter than 32 bytes; use a longer FLASHMD_JWT_SECRET");
    }

    private static byte[] loadOrCreate(Path file) {
        try {
            if (Files.exists(file)) return Files.readAllBytes(file);
            byte[] s = new byte[48];
            new SecureRandom().nextBytes(s);
            if (file.getParent() != null) Files.createDirectories(file.getParent());
            Files.write(file, s);
            try { Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rw-------")); } catch (Exception ignored) { /* non-posix fs */ }
            log.info("Generated JWT secret at {}", file.toAbsolutePath());
            return s;
        } catch (IOException e) {
            throw new IllegalStateException("Cannot read or create JWT secret at " + file, e);
        }
    }

    public String sign(String userId, String role, int version, long ttlSeconds) {
        long now = Instant.now().getEpochSecond();
        String payload = "{\"sub\":\"" + userId + "\",\"role\":\"" + role + "\",\"v\":" + version
                + ",\"iat\":" + now + ",\"exp\":" + (now + ttlSeconds) + "}";
        String body = HEADER + "." + b64(payload.getBytes(StandardCharsets.UTF_8));
        return body + "." + b64(hmac(body));
    }

    public Optional<Claims> verify(String token) {
        if (token == null) return Optional.empty();
        String[] parts = token.split("\\.");
        if (parts.length != 3 || !parts[0].equals(HEADER)) return Optional.empty();
        byte[] expected = hmac(parts[0] + "." + parts[1]);
        byte[] given;
        try { given = Base64.getUrlDecoder().decode(parts[2]); } catch (IllegalArgumentException e) { return Optional.empty(); }
        if (!MessageDigest.isEqual(expected, given)) return Optional.empty();
        try {
            String json = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            String sub = str(json, "sub"), role = str(json, "role");
            long exp = num(json, "exp");
            int v = (int) num(json, "v");
            if (sub == null || role == null || exp < Instant.now().getEpochSecond()) return Optional.empty();
            return Optional.of(new Claims(sub, role, v, exp));
        } catch (RuntimeException e) {
            return Optional.empty();
        }
    }

    // payload is produced by sign() above, so a couple of targeted regexes are enough
    private static String str(String json, String key) {
        var m = java.util.regex.Pattern.compile("\"" + key + "\":\"([^\"]*)\"").matcher(json);
        return m.find() ? m.group(1) : null;
    }

    private static long num(String json, String key) {
        var m = java.util.regex.Pattern.compile("\"" + key + "\":(\\d+)").matcher(json);
        if (!m.find()) throw new IllegalArgumentException(key);
        return Long.parseLong(m.group(1));
    }

    private byte[] hmac(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret, "HmacSHA256"));
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }

    private static String b64(byte[] b) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(b);
    }
}
