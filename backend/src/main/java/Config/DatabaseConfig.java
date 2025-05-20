package Config;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

import org.hibernate.SessionFactory;
import org.hibernate.cfg.Configuration;

public class DatabaseConfig {
    private static SessionFactory sessionFactory;
    
    public static void initialize() {
        Configuration config = new Configuration();
        config.setProperty("hibernate.connection.driver_class", "org.postgresql.Driver");
        config.setProperty("hibernate.connection.url", "jdbc:postgresql://localhost:5432/blinkodb");
        config.setProperty("hibernate.connection.username", "blinkouser");
        config.setProperty("hibernate.connection.password", "yourpassword");
        config.setProperty("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        config.setProperty("hibernate.hbm2ddl.auto", "update"); 
        
        // Add all entity classes
        config.addAnnotatedClass(Entity.User.class);
        config.addAnnotatedClass(Entity.ScreenshotAnalysis.class);
        config.addAnnotatedClass(Entity.Profile.class);


        
        sessionFactory = config.buildSessionFactory();
    }
    
    public static SessionFactory getSessionFactory() {
        return sessionFactory;
    }
    public static void testConnection() {
    try (Connection conn = DriverManager.getConnection(
        "jdbc:postgresql://localhost:5432/blinkodb", 
        "blinkouser", 
        "yourpassword")) {
        System.out.println("✅ Database connection successful!");
    } catch (SQLException e) {
        System.err.println("❌ Database connection failed:");
        e.printStackTrace();
    }
}
    
}