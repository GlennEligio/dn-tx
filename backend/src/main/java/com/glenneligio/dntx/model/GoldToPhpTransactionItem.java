package com.glenneligio.dntx.model;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Slf4j
public class GoldToPhpTransactionItem extends TransactionItem {

    @NotBlank(message = "GoldToPhpTransaction's name must not be blank")
    private String name;

    @Positive(message = "GoldToPhpTransaction's php paid must be positive")
    @NotNull(message = "Php paid must not be null")
    private Double phpPaid;

    @Positive(message = "GoldToPhpTransaction's gold per php ratio must be positive")
    @NotNull(message = "Gold per php ratio must not be null")
    private Double goldPerPhp;

    @NotBlank(message = "GoldToPhpTransaction's method of payment must not be blank")
    private String methodOfPayment;

    public GoldToPhpTransactionItem(TransactionItem t)  {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        try {
            String txString = mapper.writeValueAsString(t);
            JsonNode jsonNode = mapper.readTree(txString);
            this.setName(jsonNode.get("name").asText());
            this.setPhpPaid(jsonNode.get("phpPaid").asDouble());
            this.setGoldPerPhp(jsonNode.get("goldPerPhp").asDouble());
            this.setMethodOfPayment(jsonNode.get("methodOfPayment").asText());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }


    public TransactionItem update(TransactionItem src) {
        log.info("Updating gold to php transaction: {}", src);
        GoldToPhpTransactionItem convertedSrc = new GoldToPhpTransactionItem(src);
        this.name = convertedSrc.getName();
        this.phpPaid = convertedSrc.getPhpPaid();
        this.goldPerPhp = convertedSrc.getGoldPerPhp();
        this.methodOfPayment = convertedSrc.getMethodOfPayment();
        return convertedSrc;
    }

}
