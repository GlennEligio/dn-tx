package com.glenneligio.dntx.converter;

import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.model.*;
import com.mongodb.DBObject;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@ReadingConverter
@Slf4j
public class TransactionReadingConverter implements Converter<DBObject, Transaction> {

    @Override
    public Transaction convert(DBObject source) {
        log.info("Inside TransactionReadingConverter");
        Transaction transaction = null;
        switch((String) source.get("_class")) {
            case "com.glenneligio.dntx.model.CcToGoldTransaction":
                var ccToGoldTx = new CcToGoldTransaction();
                ccToGoldTx.setId((String) source.get("_id"));
                ccToGoldTx.setType(TransactionType.CC2GOLD);
                ccToGoldTx.setCreator((Account) source.get("creator"));
                ccToGoldTx.setGoldPaid((Double) source.get("goldPaid"));
                ccToGoldTx.setGoldPerCC((Double) source.get("goldPerCC"));
                ccToGoldTx.setCcAmount((BigDecimal) source.get("ccAmount"));
                ccToGoldTx.setUsername((String) source.get("username"));
                ccToGoldTx.setDateFinished((LocalDateTime) source.get("dateFinished"));
                ccToGoldTx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                transaction = ccToGoldTx;
                break;
            case "com.glenneligio.dntx.model.GoldToPhpTransaction":
                var goldToPhpTx = new GoldToPhpTransaction();
                goldToPhpTx.setId((String) source.get("_id"));
                goldToPhpTx.setType(TransactionType.CC2GOLD);
                goldToPhpTx.setCreator((Account) source.get("creator"));
                goldToPhpTx.setUsername((String) source.get("username"));
                goldToPhpTx.setDateFinished((LocalDateTime) source.get("dateFinished"));
                goldToPhpTx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                goldToPhpTx.setGoldPerPhp((Double) source.get("goldPerPhp"));
                goldToPhpTx.setMethodOfPayment((String) source.get("methodOfPayment"));
                goldToPhpTx.setPhpPaid((Double) source.get("phpPaid"));
                transaction = goldToPhpTx;
                break;
            case "com.glenneligio.dntx.model.Transaction":
                var tx = new Transaction();
                tx.setId((String) source.get("_id"));
                tx.setType(TransactionType.CC2GOLD);
                tx.setCreator((Account) source.get("creator"));
                tx.setUsername((String) source.get("username"));
                tx.setDateFinished((LocalDateTime) source.get("dateFinished"));
                tx.setFileAttachments((List<FileAttachment>) source.get("fileAttachments"));
                transaction = tx;
                break;
        }
        log.info("Output {}", transaction);
        return transaction;
    }
}
