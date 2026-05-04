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

    @PostConstruct
    public void initializeFirebase() {
        // Skip if Firebase is already initialized (e.g. on hot-reload)
        if (!FirebaseApp.getApps().isEmpty()) {
            log.info("Firebase already initialized — skipping");
            return;
        }

        try (InputStream serviceAccount = firebaseConfigResource.getInputStream()) {
            // Read the JSON and check it's not the placeholder
            byte[] bytes = serviceAccount.readAllBytes();
            String content = new String(bytes);

            if (content.contains("YOUR_PROJECT_ID")) {
                log.warn("Firebase service account contains placeholder values. " +
                         "Push notifications disabled. " +
                         "Replace src/main/resources/firebase-service-account.json " +
                         "with your real Firebase credentials.");
                return;
            }

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(
                            new java.io.ByteArrayInputStream(bytes)))
                    .build();

            FirebaseApp.initializeApp(options);
            log.info("Firebase Admin SDK initialized successfully");

        } catch (IOException e) {
            log.warn("Firebase service account file not found or unreadable. " +
                     "Push notifications disabled. Error: {}", e.getMessage());
        }
    }
}
