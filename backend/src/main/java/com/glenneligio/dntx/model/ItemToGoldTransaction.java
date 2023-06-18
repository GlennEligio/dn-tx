package com.glenneligio.dntx.model;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.glenneligio.dntx.exception.ApiException;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.http.HttpStatus;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "transactions")
@Slf4j
public class ItemToGoldTransaction extends Transaction{

    @NotBlank(message = "itemName can not be blank")
    private String itemName;
    @Positive(message = "itemQuantity must be positive")
    private Long itemQuantity;
    @Positive(message = "itemPriceInGold must be positive")
    private Double itemPriceInGold;

    public ItemToGoldTransaction(Transaction t)  {
        this.setUsername(t.getUsername());
        this.setCreator(t.getCreator());
        this.setDateFinished(t.getDateFinished());
        this.setFileAttachments(t.getFileAttachments());
        this.setType(t.getType());

        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        try {
            String txString = mapper.writeValueAsString(t);
            JsonNode jsonNode = mapper.readTree(txString);
            log.info(txString);
            this.setItemName(jsonNode.get("itemName").asText());
            this.setItemQuantity(jsonNode.get("itemQuantity").asLong());
            this.setItemPriceInGold(jsonNode.get("itemPriceInGold").asDouble());
        } catch (Exception e) {
            throw new ApiException("Something when wrong went parsing Transaction to ItemToGoldTx", HttpStatus.BAD_REQUEST);
        }
    }

    public void updateItemToGold(ItemToGoldTransaction t) {
        super.update(t);
        this.setItemPriceInGold(t.getItemPriceInGold());
        this.setItemQuantity(t.getItemQuantity());
        this.setItemName(t.getItemName());
    }
}
