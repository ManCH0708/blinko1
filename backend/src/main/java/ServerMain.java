import org.apache.catalina.startup.Tomcat;
import org.apache.catalina.Context;
import Servlets.LoginServlet;
import Servlets.RegisterServlet;
import Config.DatabaseConfig;
import java.io.File;

public class ServerMain {
    public static void main(String[] args) throws Exception {
        // Initialize database first
        DatabaseConfig.initialize();
        DatabaseConfig.testConnection();

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);
        
        // Configure context
        File webappDir = new File("backend/web");
        Context context = tomcat.addWebapp("", webappDir.getAbsolutePath());
        
        // Register servlets
        Tomcat.addServlet(context, "loginServlet", new LoginServlet());
        Tomcat.addServlet(context, "registerServlet", new RegisterServlet());
        
        // Map servlets to endpoints
        context.addServletMappingDecoded("/login", "loginServlet");
        context.addServletMappingDecoded("/register", "registerServlet");
        
        // Start server
        tomcat.getConnector();
        tomcat.start();
        
        System.out.println("\n==========================================");
        System.out.println("Server running on http://localhost:" + tomcat.getConnector().getPort());
        System.out.println("Available endpoints:");
        System.out.println("- POST /login");
        System.out.println("- POST /register");
        System.out.println("==========================================\n");
        
        tomcat.getServer().await();
    }
}