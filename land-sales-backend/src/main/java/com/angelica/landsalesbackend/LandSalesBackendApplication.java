package com.angelica.landsalesbackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class LandSalesBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(LandSalesBackendApplication.class, args);
    }

}
