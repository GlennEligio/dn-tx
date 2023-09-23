package com.glenneligio.dntx.model;

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
@Slf4j
public class ItemToGoldTransactionItem extends TransactionItem{

    @NotBlank(message = "itemName can not be blank")
    private String itemName;
    @Positive(message = "itemQuantity must be positive")
    private Long itemQuantity;
    @Positive(message = "itemPriceInGold must be positive")
    private Double itemPriceInGold;

    public ItemToGoldTransactionItem(TransactionItem t)  {
        ObjectMapper mapper = new ObjectMapper();
        mapper.findAndRegisterModules();
        try {
            String txString = mapper.writeValueAsString(t);
            log.info(txString);
            JsonNode jsonNode = mapper.readTree(txString);
            this.setItemName(jsonNode.get("itemName").asText());
            this.setItemQuantity(jsonNode.get("itemQuantity").asLong());
            this.setItemPriceInGold(jsonNode.get("itemPriceInGold").asDouble());
        } catch (Exception e) {
            throw new ApiException("Something when wrong went parsing TransactionItem to ItemToGoldTxItem", HttpStatus.BAD_REQUEST);
        }
    }

    public TransactionItem update(TransactionItem t) {
        log.info("Updating item to gold transaction: {}", t);
        ItemToGoldTransactionItem src = new ItemToGoldTransactionItem(t);
        this.itemPriceInGold = src.getItemPriceInGold();
        this.itemQuantity = src.getItemQuantity();
        this.itemName = src.getItemName();
        return src;
    }
}
