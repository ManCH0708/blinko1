package Servlets;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.hibernate.Session;
import org.hibernate.Transaction;

import com.fasterxml.jackson.databind.ObjectMapper;

import Config.DatabaseConfig;
import Entity.Profile;
import Entity.User;


@WebServlet("/profile")
public class UserProfileServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*"); // Allow React Native access

        PrintWriter out = response.getWriter();

        // Get user ID from session (if available)
        HttpSession session = request.getSession(false);
        Long userId = (session != null) ? (Long) session.getAttribute("userId") : 1L; // fallback to ID = 1

        try (Session hibernateSession = DatabaseConfig.getSessionFactory().openSession()) {
            User user = hibernateSession.get(User.class, userId);

            if (user != null && user.getProfile() != null) {
                Profile profile = user.getProfile();
                ObjectMapper mapper = new ObjectMapper();
                Map<String, Object> data = new HashMap<>();
                data.put("id", user.getId());
                data.put("username", user.getUsername());
                data.put("email", user.getEmail());
                data.put("phone", profile.getPhone());
                data.put("birthday", profile.getBirthday() != null ? profile.getBirthday().toString() : "");
                data.put("adresse", profile.getAdresse());
                out.write(mapper.writeValueAsString(data));
                out.flush();
            } else {
                response.sendError(HttpServletResponse.SC_NOT_FOUND, "User not found");
            }
        } catch (Exception e) {
            response.sendError(HttpServletResponse.SC_INTERNAL_SERVER_ERROR, "Error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    protected void doPut(HttpServletRequest request, HttpServletResponse response) throws IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setHeader("Access-Control-Allow-Origin", "*"); // Allow React Native access
        response.setHeader("Access-Control-Allow-Methods", "PUT, OPTIONS");
        response.setHeader("Access-Control-Allow-Headers", "Content-Type");

        PrintWriter out = response.getWriter();

        // Get user ID from session
        HttpSession session = request.getSession(false);
        Long userId = (session != null) ? (Long) session.getAttribute("userId") : 1L; // fallback to ID = 1

        // Parse JSON input
        StringBuilder sb = new StringBuilder();
        BufferedReader reader = request.getReader();
        String line;
        while ((line = reader.readLine()) != null) {
            sb.append(line);
        }
        String jsonInput = sb.toString();

        try (Session hibernateSession = DatabaseConfig.getSessionFactory().openSession()) {
            Transaction tx = hibernateSession.beginTransaction();

            // Fetch user and profile
            User user = hibernateSession.get(User.class, userId);
            if (user == null || user.getProfile() == null) {
                response.setStatus(HttpServletResponse.SC_NOT_FOUND);
                out.print("{\"success\":false,\"message\":\"User or profile not found\"}");
                return;
            }

            Profile profile = user.getProfile();

            // Update profile fields
            ObjectMapper mapper = new ObjectMapper();
            Map<String, String> updates = mapper.readValue(jsonInput, Map.class);

            if (updates.containsKey("phone")) {
                profile.setPhone(updates.get("phone"));
            }
            if (updates.containsKey("birthday")) {
                profile.setBirthday(updates.get("birthday") != null ? java.time.LocalDate.parse(updates.get("birthday")) : null);
            }
            if (updates.containsKey("adresse")) {
                profile.setAdresse(updates.get("adresse"));
            }

            // Save changes
            hibernateSession.update(profile);
            tx.commit();

            out.print("{\"success\":true,\"message\":\"Profile updated successfully\"}");
        } catch (Exception e) {
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            out.print("{\"success\":false,\"message\":\"" + e.getMessage() + "\"}");
            e.printStackTrace();
        }
    }
}