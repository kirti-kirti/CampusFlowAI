package com.campusflow.ai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Runs once per request.
 * Reads the "Authorization: Bearer <token>" header,
 * validates the JWT, and populates the SecurityContext
 * so Spring Security knows who is making the request.
 */
@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        try {
            // Only process requests that carry a Bearer token
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);

                if (jwtUtil.isValid(token)) {
                    String email = jwtUtil.extractEmail(token);
                    String tenantId = jwtUtil.extractTenantId(token);

                    // Set multi-tenancy context
                    TenantContext.setCurrentTenant(tenantId);

                    // Load full UserDetails (with authorities) from DB
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // Build authentication object and attach request details
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(
                            new WebAuthenticationDetailsSource().buildDetails(request));

                    // Register authentication in the current request's security context
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }

            chain.doFilter(request, response);
        } catch (Exception e) {
            logger.error("Security Filter Error: " + e.getMessage());
            response.setStatus(403);
            response.getWriter().write("Security failure: " + e.getMessage());
        } finally {
            // CRITICAL: Clear thread-local to prevent tenant leakage between requests
            TenantContext.clear();
        }
    }
}
