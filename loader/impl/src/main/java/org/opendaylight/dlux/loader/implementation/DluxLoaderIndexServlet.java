package org.opendaylight.dlux.loader.implementation;
/**
 * Copyright (c) 2014 Inocybe Technologies, and others. All rights reserved.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v1.0 which accompanies this distribution,
 * and is available at http://www.eclipse.org/legal/epl-v10.html
 */

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.common.base.Preconditions;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DluxLoaderIndexServlet extends HttpServlet{

    private static final long serialVersionUID = 1L;
    private static Logger logger = LoggerFactory.getLogger(DluxLoaderIndexServlet.class);

    private String defaultRequireJSModules = "var module = [\'angularAMD\', \'ocLazyLoad\', \'angular-ui-router\'," +
        "\'angular-translate\', \'angular-translate-loader-static-files\', \'common/config/env.module\',\'angular-css-injector\'";

    private String defaultAngularJSModules = "var e = [ \'oc.lazyLoad\', \'ui.router\', \'pascalprecht.translate\', \'angular.css.injector\'";

    private String end = "];";

    private String COMMA_QUOTE = ",\'";

    private String QUOTE = "\'";

    private String NEWLINE = "\n";

    private DluxLoader loader;

    private String UTF_CHARSET = "UTF-8";

    private String JAVASCRIPT_REPLACE_STRING = "global variables";

    private String INDEX_HTML_LOC = "/index/index.html";

    private String RESPONSE_CONTENT_TYPE = "text/html";

    public DluxLoaderIndexServlet(DluxLoader loader) {
        this.loader = loader;
    }

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException  {

        response.setContentType(RESPONSE_CONTENT_TYPE);
        InputStream input = DluxLoader.class.getClassLoader().getResourceAsStream(INDEX_HTML_LOC);

        Preconditions.checkNotNull(input, "Error while generating the page. Could not read the index.html file.");

        try(BufferedReader bufferedReader = new BufferedReader(
            new InputStreamReader(input, UTF_CHARSET));) {
            StringBuilder inputStringBuilder = new StringBuilder();

            String line = bufferedReader.readLine();

            while (line != null) {
                inputStringBuilder.append(line);
                inputStringBuilder.append(NEWLINE);

                if(line.contains(JAVASCRIPT_REPLACE_STRING)) {
                // add global variables
                    inputStringBuilder.append(getModulesString());
                    inputStringBuilder.append(NEWLINE);
                }

                line = bufferedReader.readLine();
            }

            PrintWriter out = response.getWriter();
            out.print(inputStringBuilder.toString());

        } catch (IOException e) {
            logger.error("There was an error reading index.html :{}", e);
        }
    }

    private String getModulesString() {

        StringBuilder requireJsBuilder = new StringBuilder();
        StringBuilder angularBuilder = new StringBuilder();
        requireJsBuilder.append(defaultRequireJSModules);
        angularBuilder.append(defaultAngularJSModules);
        for (Module module: loader.getModules().values()){
            requireJsBuilder.append(COMMA_QUOTE).append(module.getRequiredJs()).append(QUOTE);
            angularBuilder.append(COMMA_QUOTE).append(module.getAngularJs()).append(QUOTE);
        }
        requireJsBuilder.append(end).append(NEWLINE);
        angularBuilder.append(end);

        return requireJsBuilder.toString() + angularBuilder.toString();
    }
}
