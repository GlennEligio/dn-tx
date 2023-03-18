package com.glenneligio.dntx.converter;

import com.glenneligio.dntx.enums.TransactionType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.ReadingConverter;
import org.springframework.data.convert.WritingConverter;

@ReadingConverter
@Slf4j
public class TransactionTypeReadingConverter implements Converter<String, TransactionType> {

    @Override
    public TransactionType convert(String code) {
        log.info("Inside TransactionTypeReadingConverter");
        return TransactionType.getTransactionType(code);
    }
}
