package Servlets;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.hibernate.Session;
import org.json.JSONException;
import org.json.JSONObject;
import org.mindrot.jbcrypt.BCrypt;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

import Config.DatabaseConfig;
import Entity.User;

@WebServlet(urlPatterns = {"/login", "/google-login"})
public class LoginServlet extends HttpServlet {
    
    private static final String GOOGLE_CLIENT_ID = "561824674275-7j20qr69tlbaj51j2im43b6g99tq10a3.apps.googleusercontent.com";
    
    // Create verifier with proper configuration
    private final GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
        new NetHttpTransport(), new GsonFactory())
        .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
        .build();

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException {
        
        // Set CORS headers
        response.setContentType("application/json");
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        
        PrintWriter out = response.getWriter();
        
        try {
            String path = request.getServletPath();
            
            // Read JSON body
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = request.getReader().readLine()) != null) {
                sb.append(line);
            }
            
            if (sb.length() == 0) {
                sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Empty request body");
                return;
            }
            
            JSONObject json = new JSONObject(sb.toString());
            System.out.println("Received JSON: " + json.toString());
            
            if ("/google-login".equals(path)) {
                handleGoogleLogin(json, response, out);
            } else if ("/login".equals(path)) {
                handleStandardLogin(json, response, out);
            } else {
                sendError(response, out, HttpServletResponse.SC_NOT_FOUND, "Endpoint not found");
            }
        } catch (JSONException e) {
            System.err.println("JSON parsing error: " + e.getMessage());
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Invalid JSON format");
        } catch (Exception e) {
            System.err.println("Server error: " + e.getMessage());
            e.printStackTrace();
            sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Server error: " + e.getMessage());
        }
    }

    @Override
    protected void doOptions(HttpServletRequest request, HttpServletResponse response) 
        throws ServletException, IOException {
        response.setHeader("Access-Control-Allow-Origin", "*");
        response.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");
        response.setStatus(HttpServletResponse.SC_OK);
    }

    private void handleStandardLogin(JSONObject json, HttpServletResponse response, PrintWriter out) throws Exception {
        String email = json.getString("email");
        String password = json.getString("password");

        try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
            User user = session.createQuery(
                "FROM User WHERE email = :email", User.class)
                .setParameter("email", email)
                .uniqueResult();

            if (user == null || !BCrypt.checkpw(password, user.getPassword())) {
                sendError(response, out, HttpServletResponse.SC_UNAUTHORIZED, "Invalid email or password");
                return;
            }

            // Successful login
            out.print("{\"success\":true,\"message\":\"Login successful\"}");
        }
    }

    private void handleGoogleLogin(JSONObject json, HttpServletResponse response, PrintWriter out) throws Exception {
        // Extract the ID token from the request
        String googleToken = json.optString("googleToken");
        if (googleToken.isEmpty()) {
            sendError(response, out, HttpServletResponse.SC_BAD_REQUEST, "Missing Google token");
            return;
        }
        
        System.out.println("Attempting to verify Google ID token...");
        System.out.println("Received Google Token: " + googleToken);
        
        try {
            // Verify the ID token
            GoogleIdToken idToken = verifier.verify(googleToken);
            if (idToken == null) {
                sendError(response, out, HttpServletResponse.SC_UNAUTHORIZED, "Invalid Google token");
                return;
            }
            
            // Extract payload information
            GoogleIdToken.Payload payload = idToken.getPayload();
            String googleId = payload.getSubject();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            Boolean emailVerified = (Boolean) payload.get("email_verified");
            
            System.out.println("Google token verified successfully for: " + email);
            
            // Ensure email is verified
            if (emailVerified == null || !emailVerified) {
                sendError(response, out, HttpServletResponse.SC_UNAUTHORIZED, "Email not verified by Google");
                return;
            }
            
            // Database operation
            try (Session session = DatabaseConfig.getSessionFactory().openSession()) {
                session.beginTransaction();
                
                // Check for existing user by Google ID or email
                User user = session.createQuery(
                    "FROM User WHERE googleId = :googleId OR email = :email", User.class)
                    .setParameter("googleId", googleId)
                    .setParameter("email", email)
                    .uniqueResult();
                    
                if (user == null) {
                    // Create new user
                    user = new User();
                    user.setEmail(email);
                    user.setUsername(name != null ? name : email.split("@")[0]);
                    user.setGoogleId(googleId);
                    user.setVerified(true);
                    session.persist(user);
                    System.out.println("Created new user with Google login: " + email);
                } else {
                    // Update existing user if needed
                    if (user.getGoogleId() == null) {
                        user.setGoogleId(googleId);
                        user.setVerified(true);
                        session.merge(user);
                        System.out.println("Linked existing account with Google: " + email);
                    }
                }
                
                session.getTransaction().commit();
                
                // Return success response
                JSONObject successResponse = new JSONObject();
                successResponse.put("success", true);
                successResponse.put("message", "Google login successful");
                
                JSONObject userInfo = new JSONObject();
                userInfo.put("email", email);
                userInfo.put("name", name);
                successResponse.put("user", userInfo);
                
                    out.print(successResponse.toString());
                }
                
            } catch (Exception e) {
                System.err.println("Error during Google login: " + e.getMessage());
                e.printStackTrace();
                sendError(response, out, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, 
                        "Error processing Google login: " + e.getMessage());
            }
        }
        
        // Ensure proper closing of the class and methods
    
        
    private void sendError(HttpServletResponse response, PrintWriter out, int statusCode, String message) {
        response.setStatus(statusCode);
        JSONObject errorResponse = new JSONObject();
        errorResponse.put("success", false);
        errorResponse.put("message", message);
        out.print(errorResponse.toString());
    }
}
