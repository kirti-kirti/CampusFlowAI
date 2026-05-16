package com.campusflow.ai.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Loads variables from the .env file into the Spring environment.
 * This allows using ${VAR_NAME} in application.properties.
 */
@Configuration
public class DotenvConfig {

    private final ConfigurableEnvironment environment;

    public DotenvConfig(ConfigurableEnvironment environment) {
        this.environment = environment;
    }

    @PostConstruct
    public void loadDotenv() {
        try {
            Dotenv dotenv = Dotenv.configure()
                    .directory("../")
                    .ignoreIfMissing()
                    .load();

            Map<String, Object> dotenvMap = new HashMap<>();
            for (DotenvEntry entry : dotenv.entries()) {
                dotenvMap.put(entry.getKey(), entry.getValue());
            }

            if (!dotenvMap.isEmpty()) {
                environment.getPropertySources().addFirst(
                        new MapPropertySource("dotenvProperties", dotenvMap)
                );
            }
        } catch (Exception e) {
            // Ignore if .env is missing or unreadable
        }
    }
}
