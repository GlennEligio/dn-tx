package com.glenneligio.dntx.converter;

import com.glenneligio.dntx.enums.TransactionFQN;
import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
import com.mongodb.DBObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;

@ReadingConverter
@Slf4j
public class TransactionReadingConverter implements Converter<DBObject, Transaction> {

    private static final String CLASS_FIELD = "_class";

    @Override
    public Transaction convert(DBObject source) {
        log.info("Inside TransactionReadingConverter");
        Transaction transaction = null;
        switch((TransactionFQN) source.get(CLASS_FIELD)) {
            case CC2GOLD:
                var ccToGoldTx = new CcToGoldTransaction();
                ccToGoldTx.setId((String) source.get("_id"));
                ccToGoldTx.setType(TransactionType.CC2GOLD);
                ccToGoldTx.setCreator((Account) source.get("creator"));
                ccToGoldTx.setGoldPaid((Double) source.get("goldPaid"));
                ccToGoldTx.setGoldPerCC((Double) source.get("goldPerCC"));
                ccToGoldTx.setCcAmount((BigDecimal) source.get("ccAmount"));
                ccToGoldTx.setUsername((String) source.get("username"));
                ccToGoldTx.setDateFinished((ZonedDateTime) source.get("dateFinished"));
                ccToGoldTx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                transaction = ccToGoldTx;
                break;
            case GOLD2PHP:
                var goldToPhpTx = new GoldToPhpTransaction();
                goldToPhpTx.setId((String) source.get("_id"));
                goldToPhpTx.setType(TransactionType.CC2GOLD);
                goldToPhpTx.setCreator((Account) source.get("creator"));
                goldToPhpTx.setUsername((String) source.get("username"));
                goldToPhpTx.setDateFinished((ZonedDateTime) source.get("dateFinished"));
                goldToPhpTx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                goldToPhpTx.setGoldPerPhp((Double) source.get("goldPerPhp"));
                goldToPhpTx.setMethodOfPayment((String) source.get("methodOfPayment"));
                goldToPhpTx.setPhpPaid((Double) source.get("phpPaid"));
                transaction = goldToPhpTx;
                break;
            case ITEM2GOLD:
                var itemToGoldTx = new ItemToGoldTransaction();
                itemToGoldTx.setId((String) source.get("_id"));
                itemToGoldTx.setType(TransactionType.CC2GOLD);
                itemToGoldTx.setCreator((Account) source.get("creator"));
                itemToGoldTx.setUsername((String) source.get("username"));
                itemToGoldTx.setDateFinished((ZonedDateTime) source.get("dateFinished"));
                itemToGoldTx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                itemToGoldTx.setItemQuantity((Long) source.get("itemQuantity"));
                itemToGoldTx.setItemName((String) source.get("itemName"));
                itemToGoldTx.setItemPriceInGold((Double) source.get("itemPriceInGold"));
                transaction = itemToGoldTx;
                break;
            default:
                var tx = new Transaction();
                tx.setId((String) source.get("_id"));
                tx.setType(TransactionType.CC2GOLD);
                tx.setCreator((Account) source.get("creator"));
                tx.setUsername((String) source.get("username"));
                tx.setDateFinished((ZonedDateTime) source.get("dateFinished"));
                tx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                transaction = tx;
                break;
        }
        log.info("Output {}", transaction);
        return transaction;
    }
}
