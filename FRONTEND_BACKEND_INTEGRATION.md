# Frontend-Backend Integration Guide

## Current Status

✅ **Frontend Authentication System Completed**
- Role-based authentication with Admin and Maintainer roles
- JWT token management
- Protected routes and guards
- UI components for login/logout
- Role-based navigation and permissions
- Custom directive for role-based element visibility

✅ **Backend Running** 
- Spring Boot application on port 8000
- Security and JWT dependencies configured
- H2 database ready

## Required Backend Integration Steps

### 1. CORS Configuration Fix

Based on your backend logs, there's a CORS issue that needs to be resolved. Update your `CorsConfig.java`:

```java
@Configuration
@EnableWebMvc
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("http://localhost:5000", "http://localhost:4200") // Explicit origins
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}
```

**Important**: When `allowCredentials(true)` is set, you cannot use `allowedOrigins("*")`. Use `allowedOriginPatterns` with specific URLs.

### 2. Authentication Controller

Create `/api/auth/login` endpoint in your Spring Boot backend:

```java
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5000", "http://localhost:4200"}, allowCredentials = "true")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        try {
            LoginResponse response = authService.authenticate(request.getUsername(), request.getPassword());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponse(null, null, "Invalid credentials"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        // Optional: Implement server-side logout logic
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
```

### 3. Data Transfer Objects (DTOs)

Create the required DTOs for authentication:

```java
// LoginRequest.java
public class LoginRequest {
    private String username;
    private String password;
    
    // getters and setters
}

// LoginResponse.java
public class LoginResponse {
    private User user;
    private String token;
    private String message;
    
    // constructors, getters and setters
}

// User.java (or update existing)
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String username;
    
    private String email;
    private String firstName;
    private String lastName;
    private String password; // hashed
    
    @Enumerated(EnumType.STRING)
    private UserRole role;
    
    @CreationTimestamp
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // getters and setters
}

// UserRole.java
public enum UserRole {
    ADMIN("admin"),
    MAINTAINER("maintainer");
    
    private final String value;
    
    UserRole(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
}
```

### 4. Authentication Service

```java
@Service
public class AuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtTokenProvider jwtTokenProvider;
    
    public LoginResponse authenticate(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        
        String token = jwtTokenProvider.generateToken(user);
        
        return new LoginResponse(user, token, "Login successful");
    }
}
```

### 5. Security Configuration

Update your `SecurityConfig.java`:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;

    @Autowired
    private JwtRequestFilter jwtRequestFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/h2-console/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/**").hasAnyRole("ADMIN", "MAINTAINER")
                .requestMatchers(HttpMethod.POST, "/api/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
            .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class);

        http.headers(headers -> headers.frameOptions().disable()); // For H2 console

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:5000", "http://localhost:4200"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 6. Test Users Setup

Add test users to your database initialization:

```java
@Component
public class DataInitializer implements CommandLineRunner {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            // Create admin user
            User admin = new User();
            admin.setUsername("admin");
            admin.setEmail("admin@example.com");
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(UserRole.ADMIN);
            userRepository.save(admin);
            
            // Create maintainer user
            User maintainer = new User();
            maintainer.setUsername("maintainer");
            maintainer.setEmail("maintainer@example.com");
            maintainer.setFirstName("Maintainer");
            maintainer.setLastName("User");
            maintainer.setPassword(passwordEncoder.encode("maintainer123"));
            maintainer.setRole(UserRole.MAINTAINER);
            userRepository.save(maintainer);
        }
    }
}
```

## Frontend Configuration

The frontend is already configured to work with your backend:

- **API URL**: `http://localhost:8000/api` (configured in `environment.ts`)
- **Login Endpoint**: `POST /api/auth/login`
- **Token Storage**: localStorage with automatic header injection
- **CORS Ready**: Expects credentials and proper headers

## Testing Steps

1. **Start Backend**: Ensure your Spring Boot app is running on port 8000
2. **Start Frontend**: `ng serve --port 5000`
3. **Test Login**:
   - Navigate to `http://localhost:5000`
   - Should redirect to login page
   - Use credentials:
     - Admin: username=`admin`, password=`admin123`
     - Maintainer: username=`maintainer`, password=`maintainer123`

## Expected API Responses

### Successful Login Response:
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "firstName": "Admin",
    "lastName": "User",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Login successful"
}
```

### Error Response:
```json
{
  "user": null,
  "token": null,
  "message": "Invalid credentials"
}
```

## Role Permissions in Frontend

- **Admin**: Full access to all routes and features
- **Maintainer**: Read-only access, limited to Dashboard and Jenkins Results

## Next Steps

1. Implement the backend authentication endpoints as outlined above
2. Fix the CORS configuration issue
3. Test the integration between frontend and backend
4. Verify role-based access control works correctly

The frontend is fully ready and will automatically integrate once the backend endpoints are properly configured.