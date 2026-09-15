package com.flashmd;

import com.flashmd.service.ActivityStore;
import com.flashmd.service.DeckStore;
import com.flashmd.service.UserStore;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.context.annotation.Bean;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
public class FlashmdApplication {
    private static final Logger log = LoggerFactory.getLogger(FlashmdApplication.class);

    public static void main(String[] args) {
        SpringApplication.run(FlashmdApplication.class, args);
    }

    /** Data written before accounts existed belongs to the admin. */
    @Bean
    CommandLineRunner adoptLegacyData(UserStore users, DeckStore decks, ActivityStore activity) {
        return args -> {
            String admin = users.firstAdmin().id();
            var known = users.findAll().stream().map(u -> u.id()).collect(java.util.stream.Collectors.toSet());
            int n = decks.adoptOrphans(admin, known);
            if (n > 0) log.info("Assigned {} pre-existing decks to admin", n);
            activity.adoptLegacy(admin);
        };
    }
}
