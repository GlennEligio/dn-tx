package com.glenneligio.dntx.config;

import com.glenneligio.dntx.converter.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.data.mongodb.core.convert.MongoCustomConversions;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class MongoDbConfiguration {

    @Bean
    public MongoCustomConversions customConversions(){
        List<Converter<?, ?>> converterList = new ArrayList<>();
        converterList.add(new TransactionTypeReadingConverter());
        converterList.add(new TransactionTypeWritingConverter());
        converterList.add(new TransactionReadingConverter());
        converterList.add(new AccountTypeReadingConverter());
        converterList.add(new AccountTypeWritingConverter());
        converterList.add(new ZonedDateTimeWriteConverter());
        converterList.add(new ZonedDateTimeReadConverter());
        return new MongoCustomConversions(converterList);
    }
}