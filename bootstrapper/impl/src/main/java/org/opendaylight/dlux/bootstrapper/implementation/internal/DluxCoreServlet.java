package org.opendaylight.dlux.bootstrapper.implementation.internal;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DluxCoreServlet extends HttpServlet{

    public void doGet(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException  {
        // module.js
        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("Insert modules list here as javascript file.");
    }

}