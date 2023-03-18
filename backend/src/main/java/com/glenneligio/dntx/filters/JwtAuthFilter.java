package com.glenneligio.dntx.filters;

import com.glenneligio.dntx.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
@Slf4j
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService service;

    public JwtAuthFilter(JwtUtil jwtUtil, UserDetailsService service) {
        this.jwtUtil = jwtUtil;
        this.service = service;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        final String requestUri = request.getRequestURI();
        final String requestMethod = request.getMethod();
        log.info("{} {}", requestMethod, requestUri);
        Pattern patPackageDescription = Pattern.compile("/api/v.*/accounts/(login|register)");
        Matcher matPackageDescription = patPackageDescription.matcher(requestUri);
        if(matPackageDescription.find()) {
            log.info("Login and register request, will not be processed");
            filterChain.doFilter(request, response);
            return;
        }

        final String authorization = request.getHeader("Authorization");

        String jwt = null;
        String username = null;

        if(authorization != null && authorization.startsWith("Bearer ")) {
            jwt = authorization.substring(7);
            username = jwtUtil.extractUsername(jwt);
        }
        log.info("Jwt {} with username {} is read", jwt, username);

        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            log.info("Looks for the account based on username found in jwt");
            UserDetails userDetails = service.loadUserByUsername(username);
            log.info("UserDetails created: {}", userDetails.toString());
            if(jwtUtil.validateToken(jwt, userDetails)) {
                log.info("Valid jwt {}, adding userDetails created in the Security Context", jwt);
                UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(userDetails, userDetails.getPassword(), userDetails.getAuthorities());
                usernamePasswordAuthenticationToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
            }
        }

        filterChain.doFilter(request, response);
    }
}