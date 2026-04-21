package com.hospitalmgmt.ops;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BusinessOpsApplication {

    public static void main(String[] args) {
        SpringApplication.run(BusinessOpsApplication.class, args);
    }
}
