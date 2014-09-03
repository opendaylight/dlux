package org.opendaylight.dlux.loader.implementation;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DluxLoaderServlet extends HttpServlet{
    private static final long serialVersionUID = 6095022610364619812L;
    private ArrayList<Module> modules = new ArrayList<Module>();
    private static Logger logger = LoggerFactory.getLogger(DluxLoaderServlet.class);

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException  {
        String module = "var module = ["+
                         "\'angularAMD\',"+
                         "\'ocLazyLoad\',"+
                         "\'angular-ui-router\',"+
                         "\'angular-translate\',"+
                         "\'angular-translate-loader-static-files\',"+
                         "\'angular-css-injector\',"; // requiredJs
        String e = "var e = ["+
                   "\'oc.lazyLoad\',"+
                   "\'ui.router\',"+
                   "\'pascalprecht.translate\',"+
                   "\'angular.css.injector\',"; // angularJs
        String end = "];";
        StringBuilder sbm = new StringBuilder();
        StringBuilder sbe = new StringBuilder();
        sbm.append(module);
        sbe.append(e);
        for (Module m: modules){
            sbm.append("\n\'");
            sbe.append("\n\'");
            sbm.append(m.getRequiredJs());
            sbe.append(m.getAngularJs());
            sbm.append("\',");
            sbe.append("\',");
        }
        sbm.append(end);
        sbe.append(end);
        response.setContentType("text/javascript");

        PrintWriter out = response.getWriter();
        out.println(sbm.toString() + sbe.toString());
    }
    public void addModule(String bundleName, String url, String requiredJs, String angularJs){
        modules.add(new Module(bundleName, url, requiredJs, angularJs));
    }
}