package org.opendaylight.controller.dlux.bootstrapper.implementation.internal;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DluxCoreServlet extends HttpServlet{

    public void doGet(HttpServletRequest request,HttpServletResponse response) throws ServletException, IOException  {
        System.out.println("received a http GET through DluxCoreServlet");
        response.setContentType("");
    }

}