package com.glenneligio.dntx.converter;

import com.glenneligio.dntx.enums.TransactionType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.convert.WritingConverter;

@WritingConverter
@Slf4j
public class TransactionTypeWritingConverter implements Converter<TransactionType, String> {
    @Override
    public String convert(TransactionType type) {
        log.info("Inside TransactionTypeWritingConverter");
        return type.getCode();
    }
}
