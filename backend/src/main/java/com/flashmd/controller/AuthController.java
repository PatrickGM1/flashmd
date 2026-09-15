package com.flashmd.controller;

import com.flashmd.auth.CurrentUser;
import com.flashmd.model.User;
import com.flashmd.service.UserStore;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth", description = "Accounts and sessions")
public class AuthController {

    private final UserStore users;
    private final SecurityContextRepository contextRepo;
    private final boolean registrationOpen;

    public AuthController(UserStore users, SecurityContextRepository contextRepo,
                          @Value("${flashmd.registration:true}") boolean registrationOpen) {
        this.users = users;
        this.contextRepo = contextRepo;
        this.registrationOpen = registrationOpen;
    }

    /** remember: keep the session for 30 days instead of 12 hours of inactivity. */
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
        signIn(u, req, res, c.remember());
        return toMe(u);
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in")
    public Me login(@RequestBody Credentials c, HttpServletRequest req, HttpServletResponse res) {
        User u = users.findByUsername(c.username() == null ? "" : c.username().trim())
                .filter(x -> users.matches(x, c.password() == null ? "" : c.password()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Wrong username or password"));
        signIn(u, req, res, c.remember());
        return toMe(u);
    }

    @PostMapping("/logout")
    @Operation(summary = "Sign out")
    public void logout(HttpServletRequest req) {
        var session = req.getSession(false);
        if (session != null) session.invalidate();
        SecurityContextHolder.clearContext();
    }

    @PutMapping("/password")
    @Operation(summary = "Change own password")
    public Me changePassword(@RequestBody PasswordChange p) {
        User u = users.find(CurrentUser.id());
        if (u == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        if (!users.matches(u, p.current() == null ? "" : p.current()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is wrong");
        checkPassword(p.next());
        return toMe(users.save(u.withPassword(users.hash(p.next()), false)));
    }

    private static void checkPassword(String pw) {
        if (pw == null || pw.length() < 8)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password needs at least 8 characters");
    }

    private static final int REMEMBER_SECONDS = 30 * 24 * 3600;

    private void signIn(User u, HttpServletRequest req, HttpServletResponse res, boolean remember) {
        var auth = new UsernamePasswordAuthenticationToken(u.id(), null,
                List.of(new SimpleGrantedAuthority("ROLE_" + u.role().name())));
        SecurityContext ctx = SecurityContextHolder.createEmptyContext();
        ctx.setAuthentication(auth);
        SecurityContextHolder.setContext(ctx);
        var session = req.getSession(true);
        if (remember) session.setMaxInactiveInterval(REMEMBER_SECONDS);
        contextRepo.saveContext(ctx, req, res);
    }

    private Me toMe(User u) {
        return new Me(u.id(), u.username(), u.role().name(), u.mustChangePassword(), registrationOpen);
    }
}
