package com.flashmd.auth;

import com.flashmd.model.User;
import com.flashmd.service.UserStore;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Reads the auth cookie, verifies the token, and checks it against the live user:
 * a token whose version no longer matches (password changed or reset) or whose
 * user is gone is simply anonymous.
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    public static final String COOKIE = "flashmd_token";
    private final Jwt jwt;
    private final UserStore users;

    public JwtFilter(Jwt jwt, UserStore users) {
        this.jwt = jwt;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String token = null;
        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) if (COOKIE.equals(c.getName())) token = c.getValue();
        }
        jwt.verify(token).ifPresent(claims -> {
            User u = users.find(claims.userId());
            if (u != null && u.tokenVersion() == claims.version()) {
                var auth = new UsernamePasswordAuthenticationToken(u.id(), null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + u.role().name())));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        });
        chain.doFilter(req, res);
    }
}
