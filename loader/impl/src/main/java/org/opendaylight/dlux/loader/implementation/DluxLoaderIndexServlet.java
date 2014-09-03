package org.opendaylight.dlux.loader.implementation;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class DluxLoaderIndexServlet extends HttpServlet{

    private static final long serialVersionUID = 1L;
    private static Logger logger = LoggerFactory.getLogger(DluxLoaderIndexServlet.class);

    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException  {
        response.setContentType("text/html");
        InputStream input = null;

        try {
            input = DluxLoader.class.getClassLoader().getResourceAsStream("/index/index.html");
            StringBuilder inputStringBuilder = new StringBuilder();
            if (input == null){
                PrintWriter out = response.getWriter();
                out.println("There was an error generating the page.");
            }
            else {
                BufferedReader bufferedReader = new BufferedReader(
                        new InputStreamReader(input, "UTF-8"));

                String line = bufferedReader.readLine();
                while (line != null) {
                    inputStringBuilder.append(line);
                    inputStringBuilder.append('\n');
                    line = bufferedReader.readLine();
                }

                String t1 = inputStringBuilder.toString();

                String t2 = t1.replace("!--$", "");
                String index = t2.replace("$--", "");
                PrintWriter out = response.getWriter();
                out.print(index);
            }
        } catch (IOException e) {
            PrintWriter out = response.getWriter();
            out.println("There was an error generating the page.");
            logger.error("There was an error reading index.html :",e);
        }
    }
}
