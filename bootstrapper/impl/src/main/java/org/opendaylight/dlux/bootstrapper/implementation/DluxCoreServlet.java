package org.opendaylight.dlux.bootstrapper.implementation;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DluxCoreServlet extends HttpServlet{
    private static final long serialVersionUID = 6095022610364619812L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException  {
        // module.js
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("Insert modules list here as javascript file.");
    }
}