package com.flashmd.controller;

import com.flashmd.auth.CurrentUser;
import com.flashmd.auth.Jwt;
import com.flashmd.auth.JwtFilter;
import com.flashmd.auth.LoginThrottle;
import com.flashmd.model.User;
import com.flashmd.service.UserStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Accounts and sessions")
public class AuthController {

    private static final long SESSION_SECONDS = 12 * 3600;
    private static final long REMEMBER_SECONDS = 30L * 24 * 3600;

    private final UserStore users;
    private final Jwt jwt;
    private final LoginThrottle throttle;
    private final boolean registrationOpen;

    public AuthController(UserStore users, Jwt jwt, LoginThrottle throttle,
                          @Value("${flashmd.registration:true}") boolean registrationOpen) {
        this.users = users;
        this.jwt = jwt;
        this.throttle = throttle;
        this.registrationOpen = registrationOpen;
    }

    /** remember: keep the token for 30 days instead of 12 hours. */
    public record Credentials(String username, String password, boolean remember) {}
    public record PasswordChange(String current, String next) {}
    public record Me(String id, String username, String role, boolean mustChangePassword, boolean registrationOpen) {}

    @GetMapping("/me")
    @Operation(summary = "Current session, or 401")
    public Me me() {
        String id = CurrentUser.id();
        User u = id == null ? null : users.find(id);
        if (u == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return toMe(u);
    }

    @PostMapping("/register")
    @Operation(summary = "Create an account and sign in")
    public Me register(@RequestBody Credentials c, HttpServletRequest req, HttpServletResponse res) {
        if (!registrationOpen) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Registration is closed. Ask your admin for an account.");
        String name = c.username() == null ? "" : c.username().trim();
        if (name.length() < 2 || name.length() > 40 || !name.matches("[\\w.@+-]+"))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Username must be 2-40 characters: letters, digits, . _ @ + - (no spaces)");
        checkPassword(c.password());
        if (users.findByUsername(name).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "That username is taken");
        User u = users.create(name, c.password(), User.Role.USER, false);
        issue(u, c.remember(), req, res);
        return toMe(u);
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in")
    public Me login(@RequestBody Credentials c, HttpServletRequest req, HttpServletResponse res) {
        String name = c.username() == null ? "" : c.username().trim();
        String password = c.password() == null ? "" : c.password();
        String client = clientOf(req);

        long wait = throttle.retryAfter(client, name);
        if (wait > 0) {
            res.setHeader(HttpHeaders.RETRY_AFTER, String.valueOf(wait));
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many attempts. Try again in " + Math.max(1, wait / 60) + " min.");
        }

        var found = users.findByUsername(name);
        boolean ok = found.map(u -> users.matches(u, password)).orElseGet(() -> { users.matchesDecoy(password); return false; });
        if (!ok) {
            throttle.failed(client, name);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong username or password");
        }
        throttle.succeeded(client, name);
        User u = found.get();
        issue(u, c.remember(), req, res);
        return toMe(u);
    }

    @PostMapping("/logout")
    @Operation(summary = "Sign out")
    public void logout(HttpServletRequest req, HttpServletResponse res) {
        res.addHeader(HttpHeaders.SET_COOKIE, cookie("", 0, req.isSecure()).toString());
    }

    @PutMapping("/password")
    @Operation(summary = "Change own password; every other signed-in device is signed out")
    public Me changePassword(@RequestBody PasswordChange p, HttpServletRequest req, HttpServletResponse res) {
        String id = CurrentUser.id();
        User u = id == null ? null : users.find(id);
        if (u == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (!users.matches(u, p.current() == null ? "" : p.current()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is wrong");
        checkPassword(p.next());
        if (users.matches(u, p.next()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "New password must differ from the current one");
        User saved = users.save(u.withPassword(users.hash(p.next()), false));
        issue(saved, false, req, res); // this device keeps working; the old token version is dead everywhere else
        return toMe(saved);
    }

    private static void checkPassword(String pw) {
        if (pw == null || pw.length() < 8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password needs at least 8 characters");
        if (pw.length() > 128)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password is too long (max 128)");
    }

    private void issue(User u, boolean remember, HttpServletRequest req, HttpServletResponse res) {
        long ttl = remember ? REMEMBER_SECONDS : SESSION_SECONDS;
        String token = jwt.sign(u.id(), u.role().name(), u.tokenVersion(), ttl);
        // remember: cookie outlives the browser; otherwise a session cookie (gone on close), token still capped at 12h
        res.addHeader(HttpHeaders.SET_COOKIE, cookie(token, remember ? ttl : -1, req.isSecure()).toString());
    }

    private static ResponseCookie cookie(String value, long maxAge, boolean secure) {
        return ResponseCookie.from(JwtFilter.COOKIE, value)
                .httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(maxAge).build();
    }

    /** The client behind the reverse proxy, if it says so; the socket otherwise. */
    private static String clientOf(HttpServletRequest req) {
        String fwd = req.getHeader("X-Forwarded-For");
        return fwd != null && !fwd.isBlank() ? fwd.split(",")[0].trim() : req.getRemoteAddr();
    }

    private Me toMe(User u) {
        return new Me(u.id(), u.username(), u.role().name(), u.mustChangePassword(), registrationOpen);
    }
}
