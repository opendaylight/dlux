package org.opendaylight.dlux.bootstrapper.implementation;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

public class DluxCoreServlet extends HttpServlet{
    private static final long serialVersionUID = 6095022610364619812L;
    private ArrayList<Module> modules = new ArrayList<Module>();

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException  {
        // module.js
        String module = "var module = ["+
                         "\'angularAMD\',"+
                         "\'ocLazyLoad\',"+
                         "\'angular-ui-router\',"; // requiredJs
        String e = "var e = ["; // angularJs
        String end = "];";
        StringBuilder sb = new StringBuilder();
        for (Module m: modules){
            //
        }

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("Insert modules list here as javascript file.");
    }
    public void addModule(String bundleName, String url, String requiredJs, String angularJs){
        modules.add(new Module(bundleName, url, requiredJs, angularJs));
    }
    private String buildRequiredJSArray(){
        return null;
    }
    private String buildAngularJSArray(){
        return null;
    }
}