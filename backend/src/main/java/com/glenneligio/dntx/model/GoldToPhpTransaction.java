package com.glenneligio.dntx.model;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
@Slf4j
public class GoldToPhpTransaction extends Transaction {

    private String name;
    private Double phpPaid;
    private Double goldPerPhp;
    private String methodOfPayment;

    public GoldToPhpTransaction(Transaction t)  {
        this.setUsername(t.getUsername());
        this.setCreator(t.getCreator());
        this.setDateFinished(t.getDateFinished());
        this.setFileAttachments(t.getFileAttachments());
        this.setType(t.getType());

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        try {
            String txString = mapper.writeValueAsString(t);
            log.info(txString);
            JsonNode jsonNode = mapper.readTree(txString);
            this.setName(jsonNode.get("name").asText());
            this.setPhpPaid(jsonNode.get("phpPaid").asDouble());
            this.setGoldPerPhp(jsonNode.get("goldPerPhp").asDouble());
            this.setMethodOfPayment(jsonNode.get("methodOfPayment").asText());
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }


    public void updateGold2Php(GoldToPhpTransaction t) {
        super.update(t);
        this.name = t.getName();
        this.phpPaid = t.getPhpPaid();
        this.goldPerPhp = t.getGoldPerPhp();
        this.methodOfPayment = t.getMethodOfPayment();
    }

}
