package Servlets;

import java.io.*;
import javax.servlet.*;
import javax.servlet.http.*;
import org.hibernate.Session;
import org.json.JSONException;
import org.json.JSONObject;
import org.mindrot.jbcrypt.BCrypt;
import Config.DatabaseConfig;
import Entity.User;

public class LoginServlet extends HttpServlet {
    
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException {
        
        // Set headers FIRST
        response.setContentType("application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Handle preflight OPTIONS request
            if ("OPTIONS".equals(request.getMethod())) {
                response.setStatus(HttpServletResponse.SC_OK);
                return;
            }
            
            // Read JSON body
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            JSONObject json = new JSONObject(sb.toString());
            String email = json.getString("email"); // Changed from username to email
            String password = json.getString("password");
            
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                User user = session.createQuery(
                    "FROM User WHERE email = :email", User.class) // Query by email
                    .setParameter("email", email)
                    .uniqueResult();
                
                if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    out.print("{\"success\":false,\"message\":\"Invalid email or password\"}"); // Updated message
                    return;
                }
                
                // Successful login
                out.print("{\"success\":true,\"message\":\"Login successful\"}");
            }
        } catch (JSONException e) {
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            out.print("{\"success\":false,\"message\":\"Invalid JSON format\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false,\"message\":\"Server error\"}");
            e.printStackTrace();
        }
    }
}