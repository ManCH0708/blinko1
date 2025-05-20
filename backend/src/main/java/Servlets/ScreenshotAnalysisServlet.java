package Servlets;

import Config.DatabaseConfig;
import Entity.ScreenshotAnalysis;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.hibernate.Session;
import org.hibernate.Transaction;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class ScreenshotAnalysisServlet extends HttpServlet {

    // POST: Save new analysis if it doesn't exist
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        ObjectMapper mapper = new ObjectMapper();
        ScreenshotAnalysis newAnalysis = mapper.readValue(req.getReader(), ScreenshotAnalysis.class);

        Session session = DatabaseConfig.getSessionFactory().openSession();
        Transaction tx = null;
        ScreenshotAnalysis existing;

        try {
            tx = session.beginTransaction();
            existing = session.createQuery("FROM ScreenshotAnalysis WHERE imageUri = :uri", ScreenshotAnalysis.class)
                    .setParameter("uri", newAnalysis.getImageUri())
                    .uniqueResult();

            if (existing == null) {
                session.save(newAnalysis);
                tx.commit();
            } else {
                newAnalysis = existing; // already exists, don't save
            }

        } catch (Exception e) {
            if (tx != null) tx.rollback();
            throw new ServletException(e);
        } finally {
            session.close();
        }

        resp.setContentType("application/json");
        mapper.writeValue(resp.getWriter(), newAnalysis);
    }

    // GET: Check if image URI has already been analyzed
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String imageUri = req.getParameter("imageUri");
        String tag = req.getParameter("tag");

        Session session = DatabaseConfig.getSessionFactory().openSession();
        ObjectMapper mapper = new ObjectMapper();

        try {
            resp.setContentType("application/json");
            if (imageUri != null) {
                // Existing logic: fetch by imageUri
                ScreenshotAnalysis analysis = session.createQuery(
                    "FROM ScreenshotAnalysis WHERE imageUri = :uri", ScreenshotAnalysis.class)
                    .setParameter("uri", imageUri)
                    .uniqueResult();
                if (analysis == null) {
                    mapper.writeValue(resp.getWriter(), java.util.Collections.singletonMap("alreadyAnalyzed", false));
                } else {
                    mapper.writeValue(resp.getWriter(), analysis);
                }
            } else if (tag != null) {
                // New logic: fetch all analyses where tags LIKE %tag%
                String likePattern = "%" + tag.toLowerCase() + "%";
                // Assuming tags are stored as comma-separated string
                java.util.List<ScreenshotAnalysis> results = session.createQuery(
                    "FROM ScreenshotAnalysis WHERE LOWER(tags) LIKE :tag", ScreenshotAnalysis.class)
                    .setParameter("tag", likePattern)
                    .getResultList();
                mapper.writeValue(resp.getWriter(), results);
            } else {
                // Optionally, return all analyses or an error
                resp.setStatus(400);
                mapper.writeValue(resp.getWriter(), java.util.Collections.singletonMap("error", "No search parameter provided"));
            }
        } finally {
            session.close();
        }
    }
}
