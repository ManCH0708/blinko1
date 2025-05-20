package Entity;


import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "profiles")
public class Profile {

    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String phone;
    private LocalDate birthday;
    private String adresse;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Getters & Setters
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getPhone() { return phone; }

    public void setPhone(String phone) { this.phone = phone; }

    public LocalDate getBirthday() { return birthday; }

    public void setBirthday(LocalDate birthday) { this.birthday = birthday; }

    public String getAdresse() { return adresse; }

    public void setAdresse(String adresse) { this.adresse = adresse; }

    public User getUser() { return user; }

    public void setUser(User user) { this.user = user; }
}
