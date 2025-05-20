import org.apache.catalina.Context;
import org.apache.catalina.startup.Tomcat;

import Config.DatabaseConfig;
import Servlets.LoginServlet;
import Servlets.RegisterServlet;
import Servlets.ScreenshotAnalysisServlet;
import Servlets.UserProfileServlet;

public class ServerMain {
    public static void main(String[] args) throws Exception {
        // Initialize database first
        DatabaseConfig.initialize();
        DatabaseConfig.testConnection();

        Tomcat tomcat = new Tomcat();
        tomcat.setPort(8080);
        
        // Configure context
        Context context = tomcat.addContext("", null);
        
        // Register servlets
        Tomcat.addServlet(context, "loginServlet", new LoginServlet());
        Tomcat.addServlet(context, "registerServlet", new RegisterServlet());
        Tomcat.addServlet(context, "analyzeServlet", new ScreenshotAnalysisServlet());
        Tomcat.addServlet(context, "profileServlet", new UserProfileServlet());


        // Map servlets to endpoints
        context.addServletMappingDecoded("/login", "loginServlet");
        context.addServletMappingDecoded("/register", "registerServlet");
        context.addServletMappingDecoded("/analyze", "analyzeServlet");
        context.addServletMappingDecoded("/profile", "profileServlet");
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

