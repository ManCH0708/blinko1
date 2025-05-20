package Entity;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true)
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(unique = true)
    private String email;
    
    @Column(name = "google_id", unique = true)
    private String googleId;
    
    @Column(name = "is_verified", nullable = false)
    private boolean isVerified = false;
    
    @Column(name = "auth_method")
    private String authMethod; // "email", "google", etc.
    
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Profile profile;

    // Constructors
    public User() {}
    
    public User(String email, String name, String googleId) {
        this.email = email;
        this.username = name; // Using username field to store name from Google
        this.googleId = googleId;
        this.isVerified = true;
        this.authMethod = "google";
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getGoogleId() { return googleId; }
    public void setGoogleId(String googleId) { this.googleId = googleId; }
    
    public boolean isVerified() { return isVerified; }
    public void setVerified(boolean verified) { isVerified = verified; }
    
    public String getAuthMethod() { return authMethod; }
    public void setAuthMethod(String authMethod) { this.authMethod = authMethod; }
    
    public Profile getProfile() { return profile; }
    public void setProfile(Profile profile) { this.profile = profile; }

    // Helper method for Google Sign-In
    public void linkGoogleAccount(String googleId) {
        this.googleId = googleId;
        this.isVerified = true;
        if (this.authMethod == null || !this.authMethod.equals("google")) {
            this.authMethod = "mixed";
        }
    }
}