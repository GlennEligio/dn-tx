package com.glenneligio.dntx.enums;

import com.glenneligio.dntx.model.CcToGoldTransaction;
import com.glenneligio.dntx.model.GoldToPhpTransaction;
import com.glenneligio.dntx.model.ItemToGoldTransaction;
import lombok.extern.slf4j.Slf4j;

import java.util.stream.Stream;

@Slf4j
public enum TransactionFQN {
    CC2GOLD(CcToGoldTransaction.class.getName()),
    GOLD2PHP(GoldToPhpTransaction.class.getName()),
    ITEM2GOLD(ItemToGoldTransaction.class.getName());

    private final String fqn;

    TransactionFQN(String fqn) {
        this.fqn = fqn;
    }

    public String getCode() {
        return fqn;
    }

    public static TransactionType getTransactionType(String fqnString) {
        log.info("Converting {} into Transaction FQN", fqnString);
        return Stream.of(TransactionType.values())
                .filter(fqn -> fqnString.equals(fqn.getCode()))
                .findFirst()
                .orElse(null);
    }
}
