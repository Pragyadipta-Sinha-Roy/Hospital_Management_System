package com.hospitalmgmt.ops.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "app.billing")
public class BillingProperties {

    /**
     * Tax rate as decimal, e.g. 0.10 for 10%.
     */
    private BigDecimal taxRate = new BigDecimal("0.10");

    /**
     * Days until invoice due date from issue time.
     */
    private int invoiceDueDays = 14;
}
