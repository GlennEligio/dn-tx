package com.glenneligio.dntx.config;

import com.glenneligio.dntx.filters.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.time.Duration;
import java.util.List;


@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final UserDetailsService userDetailsService;
    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfiguration(UserDetailsService userDetailsService, JwtAuthFilter jwtAuthFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(Customizer.withDefaults());
        http.csrf().disable();
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        http.sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS);
        http.authorizeHttpRequests()
                .requestMatchers(HttpMethod.POST,"/api/*/accounts/login", "/api/*/accounts/register").permitAll()
                .requestMatchers(HttpMethod.GET,"/actuator/**").permitAll() // For Spring Actuator
                .requestMatchers(HttpMethod.GET, "/api/*/transactions/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/*/accounts/@self/**").hasAnyAuthority("ADMIN", "USER")
                .requestMatchers(HttpMethod.POST, "/api/*/accounts/@self/transactions").hasAnyAuthority("USER", "ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/*/accounts/@self", "/api/*/accounts/@self/transactions/*").hasAnyAuthority("ADMIN","USER")
                .requestMatchers(HttpMethod.DELETE, "/api/*/accounts/@self/transactions/*").hasAnyAuthority("USER", "ADMIN")
//                .requestMatchers(HttpMethod.POST, "/api/*/transactions").hasAnyAuthority("USER", "ADMIN")
//                .requestMatchers(HttpMethod.PUT, "/api/v1/accounts/**").authenticated()
//                .requestMatchers(HttpMethod.GET, "/**").authenticated()
                .anyRequest().hasAnyAuthority("ADMIN");
//                .anyRequest().permitAll();
        return http.build();
    }

    @Bean
    public AuthenticationManager authManager(HttpSecurity http, BCryptPasswordEncoder bCryptPasswordEncoder, UserDetailsService userDetailService)
            throws Exception {
        return http.getSharedObject(AuthenticationManagerBuilder.class)
                .userDetailsService(userDetailsService)
                .passwordEncoder(bCryptPasswordEncoder)
                .and()
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("*"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("*"));
        configuration.setMaxAge(Duration.ofMinutes(10));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
