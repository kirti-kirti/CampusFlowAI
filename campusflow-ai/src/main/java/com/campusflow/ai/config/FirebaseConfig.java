package com.campusflow.ai.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.io.InputStream;

/**
 * Initializes the Firebase Admin SDK on application startup.
 *
 * Setup steps:
 *  1. Go to Firebase Console → Project Settings → Service Accounts
 *  2. Click "Generate new private key" → download the JSON file
 *  3. Place it at: src/main/resources/firebase-service-account.json
 *  4. The app will auto-initialize on startup
 *
 * If the service account file is missing or contains placeholder values,
 * Firebase is skipped and notifications are saved to DB only (no push).
 */
@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${firebase.config.path}")
    private Resource firebaseConfigResource;

    @Value("${firebase.config.json:}")
    private String firebaseConfigJson;

    @PostConstruct
    public void initializeFirebase() {
        // Skip if Firebase is already initialized (e.g. on hot-reload)
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase already initialized — skipping");
            return;
        }

        try {
            byte[] jsonBytes = null;

            // Priority 1: Check if JSON string is provided via environment variable
            if (firebaseConfigJson != null && !firebaseConfigJson.trim().isEmpty()) {
                log.info("Initializing Firebase using JSON string from environment variable");
                jsonBytes = firebaseConfigJson.getBytes();
            } 
            // Priority 2: Check if physical file exists and is not a placeholder
            else if (firebaseConfigResource != null && firebaseConfigResource.exists()) {
                try (InputStream is = firebaseConfigResource.getInputStream()) {
                    jsonBytes = is.readAllBytes();
                    String content = new String(jsonBytes);
                    if (content.contains("YOUR_PROJECT_ID")) {
                        log.warn("Firebase service account file contains placeholder values. Skipping.");
                        jsonBytes = null;
                    } else {
                        log.info("Initializing Firebase using file: {}", firebaseConfigResource.getFilename());
                    }
                }
            }

            if (jsonBytes == null) {
                log.warn("No valid Firebase credentials found (checked environment variable and file). " +
                         "Push notifications disabled.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(new java.io.ByteArrayInputStream(jsonBytes)))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");

        } catch (IOException e) {
            log.error("Failed to initialize Firebase: {}", e.getMessage());
        }
    }
}
