package Entity;

import jakarta.persistence.*;

@Entity
@Table(name = "screenshot_analysis")
public class ScreenshotAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "image_uri", nullable = false, unique = true)
    private String imageUri;
    @Column(name = "description" , columnDefinition = "TEXT")
    private String description;
     @Column(name = "description_en" , columnDefinition = "TEXT")
    private String description_en;
    @Column(name = "tags" , columnDefinition = "TEXT")
    private String tags;      // tags en français (par défaut)
    @Column(name = "tags_en" , columnDefinition = "TEXT")
    private String tags_en;   // tags en anglais

    @Column(name = "creation_time")
    private Long creationTime;

    // Constructors
    public ScreenshotAnalysis() {}

    public ScreenshotAnalysis(String imageUri, String description, String description_en, String tags, String tags_en, Long creationTime) {
        this.imageUri = imageUri;
        this.description = description;
        this.description_en = description_en;
        this.tags = tags;
        this.tags_en = tags_en;
        this.creationTime = creationTime;
    }

    // Getters and Setters
    public Long getId() { return id; }

    public String getImageUri() { return imageUri; }
    public void setImageUri(String imageUri) { this.imageUri = imageUri; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getDescription_en() { return description_en; }
    public void setDescription_en(String description_en) { this.description_en = description_en; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public String getTags_en() { return tags_en; }
    public void setTags_en(String tags_en) { this.tags_en = tags_en; }

    public Long getCreationTime() { return creationTime; }
    public void setCreationTime(Long creationTime) { this.creationTime = creationTime; }
}
