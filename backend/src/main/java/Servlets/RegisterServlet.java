package Servlets;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.Session;
import org.json.JSONException;
import org.json.JSONObject;
import org.mindrot.jbcrypt.BCrypt;

import Config.DatabaseConfig;
import Entity.Profile;
import Entity.User;

@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
   protected void doPost(HttpServletRequest request, HttpServletResponse response) 
    throws ServletException, IOException {
    
    response.setContentType("application/json");
    response.setHeader("Access-Control-Allow-Origin", "*");
    PrintWriter out = response.getWriter();
    
    try {
        // Parse JSON input
        StringBuilder sb = new StringBuilder();
        String line;
        while ((line = request.getReader().readLine()) != null) {
            sb.append(line);
        }
        JSONObject json = new JSONObject(sb.toString());

        // Validate input
        if (!json.has("username") || json.getString("username").trim().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\":false,\"message\":\"Username is required\"}");
            return;
        }

        // Database operations
        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            session.beginTransaction();
            
            // Check for existing user
            if (session.createQuery("FROM User WHERE username = :username", User.class)
                      .setParameter("username", json.getString("username"))
                      .uniqueResult() != null) {
                response.setStatus(HttpServletResponse.SC_CONFLICT);
                out.print("{\"success\":false,\"message\":\"Username already exists\"}");
                return;
            }

            // Create new user
            User newUser = new User();
            newUser.setUsername(json.getString("username"));
            newUser.setPassword(BCrypt.hashpw(json.getString("password"), BCrypt.gensalt()));
            newUser.setEmail(json.getString("email"));
            
            session.persist(newUser);

            // Create and persist profile linked to the new user
            Profile profile = new Profile();
            profile.setUser(newUser);
            profile.setPhone("");
            profile.setBirthday(null);
            profile.setAdresse("");
            session.persist(profile);

            session.getTransaction().commit();
            
            out.print("{\"success\":true,\"message\":\"User registered successfully\"}");
        }
    } catch (JSONException e) {
        response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        out.print("{\"success\":false,\"message\":\"Invalid JSON format\"}");
    } catch (Exception e) {
        response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
        out.print("{\"success\":false,\"message\":\"" + e.getMessage() + "\"}");
    }
}
}
