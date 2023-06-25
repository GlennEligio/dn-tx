package com.glenneligio.dntx.service;


import com.glenneligio.dntx.enums.TransactionType;
import com.glenneligio.dntx.exception.ApiException;
import com.glenneligio.dntx.model.*;
import com.glenneligio.dntx.repository.TransactionRepository;
import jakarta.validation.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.IntStream;

@Service
@Slf4j
public class TransactionService implements IExcelService<Transaction> {

    private static final String CLASS_NAME = TransactionService.class.getName();

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private Validator validator;
    @Autowired
    private AccountService accountService;

    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating transaction {}", transaction);
        Account account = accountService.getAccountByUsername(transaction.getCreator().getUsername());
        transaction.setCreator(account);
        transaction.setDateFinished(LocalDateTime.now());

        switch (transaction.getType()) {
            case GOLD2PHP:
                GoldToPhpTransaction goldToPhpTransaction = new GoldToPhpTransaction(transaction);
                validateGoldToPhpTransaction(goldToPhpTransaction);
                return transactionRepository.save(goldToPhpTransaction);
            case CC2GOLD:
                CcToGoldTransaction ccToGoldTransaction = new CcToGoldTransaction(transaction);
                validateCcToGoldTransaction(ccToGoldTransaction);
                return transactionRepository.save(ccToGoldTransaction);
            case ITEM2GOLD:
                ItemToGoldTransaction itemToGoldTransaction = new ItemToGoldTransaction(transaction);
                validateItemToGoldTransaction(itemToGoldTransaction);
                return transactionRepository.save(itemToGoldTransaction);
            default:
                throw new ApiException("No transaction type specified", HttpStatus.BAD_REQUEST);
        }
    }

    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }

    public Transaction getTransactionById(String id) {
        return transactionRepository.findById(id)
                .orElseThrow(() -> new ApiException("No transaction exist with specified id", HttpStatus.NOT_FOUND));
    }

    public Transaction getTransactionByUsernameAndId(String username, String id) {
        return transactionRepository.findByUsernameAndId(username, id)
                .orElseThrow(() -> new ApiException("Not transaction exist with specified username and id", HttpStatus.NOT_FOUND));
    }

    public Transaction updateTransaction(String id, Transaction transaction) {
        final String METHOD_NAME = "updateTransaction";
        log.info("Inside {} of {} with inputs {} and {}", METHOD_NAME, CLASS_NAME, id, transaction);
        var transactionToBeUpdated = getTransactionById(id);

        // Check specified instance type of transaction, since each have different fields to update
        if (transactionToBeUpdated instanceof GoldToPhpTransaction goldToPhpTransaction) {
            log.info("Transaction is a Gold2Php tx");
            goldToPhpTransaction.updateGold2Php(new GoldToPhpTransaction(transaction));
            validateGoldToPhpTransaction(goldToPhpTransaction);
            return transactionRepository.save(goldToPhpTransaction);
        } else if (transactionToBeUpdated instanceof CcToGoldTransaction ccToGoldTransaction) {
            log.info("Transaction is a Cc2Gold tx");
            ccToGoldTransaction.updateCcToGold(new CcToGoldTransaction(transaction));
            validateCcToGoldTransaction(ccToGoldTransaction);
            return transactionRepository.save(ccToGoldTransaction);
        } else if (transactionToBeUpdated instanceof ItemToGoldTransaction itemToGoldTransaction) {
            log.info("Transaction is a ITEM2GOLD tx");
            itemToGoldTransaction.updateItemToGold(new ItemToGoldTransaction(transaction));
            validateItemToGoldTransaction(itemToGoldTransaction);
            return itemToGoldTransaction;
        } else {
            transactionToBeUpdated.update(transaction);
            log.info("Transaction type is not defined");
            return transactionRepository.save(transactionToBeUpdated);
        }
    }

    public void deleteTransaction(String id) {
        var transactionToBeDeleted = getTransactionById(id);
        transactionRepository.deleteById(transactionToBeDeleted.getId());
    }

    public List<Transaction> getTransactionsByCreatorUsername(String username) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorId(account.getId());
    }

    public Page<Transaction> getTransactionPageByCreatorUsername(String username, int pageNumber, int pageSize) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorId(account.getId(), PageRequest.of(pageNumber - 1, pageSize).withSort(Sort.by("dateFinished").descending()));
    }

    public List<Transaction> getTransactionByCreatorUsernameAndDateBetween(String username, LocalDateTime afterDate, LocalDateTime beforeDate) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorIdAndDateFinishedBetween(account.getId(), afterDate, beforeDate);
    }

    private void validateCcToGoldTransaction(CcToGoldTransaction ccToGoldTransaction) {
        Set<ConstraintViolation<CcToGoldTransaction>> violations = validator.validate(ccToGoldTransaction);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Invalid CcToGoldTransaction", violations);
        }
    }

    private void validateGoldToPhpTransaction(GoldToPhpTransaction goldToPhpTransaction) {
        Set<ConstraintViolation<GoldToPhpTransaction>> violations = validator.validate(goldToPhpTransaction);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Invalid GoldToPhpTransaction", violations);
        }
    }

    private void validateItemToGoldTransaction(ItemToGoldTransaction itemToGoldTransaction) {
        Set<ConstraintViolation<ItemToGoldTransaction>> violations = validator.validate(itemToGoldTransaction);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Invalid ItemToGoldTransaction", violations);
        }
    }

    @Override
    public ByteArrayInputStream listToExcel(List<Transaction> transactions) {
        List<String> baseTxColumnNames = List.of("Transaction id", "Username", "Creator Username", "Date finished", "Type");
        List<String> ccToGoldTxColumnNames = List.of("CC Amount", "Gold per CC", "Gold paid");
        List<String> goldToPhpTxColumnNames = List.of("Name", "Php paid", "Gold per php", "Method of payment");
        List<String> itemToGoldColumnNames = List.of("Item name", "Item quantity", "Item price in gold");
        List<TransactionType> txTypes = List.of(TransactionType.CC2GOLD, TransactionType.GOLD2PHP, TransactionType.ITEM2GOLD);

        try (Workbook workbook = new XSSFWorkbook()) {

            for (TransactionType t : txTypes) {
                Sheet sheet = workbook.createSheet(t.name());
                List<Transaction> txList = transactions.stream().filter(tx -> tx.getType().name().equals(t.name())).toList();
                List<String> allColumnNames = new ArrayList<>(baseTxColumnNames);
                // Populating the column names based on transaction type
                switch (t) {
                    case CC2GOLD -> allColumnNames.addAll(ccToGoldTxColumnNames);
                    case GOLD2PHP -> allColumnNames.addAll(goldToPhpTxColumnNames);
                    case ITEM2GOLD -> allColumnNames.addAll(itemToGoldColumnNames);
                }

                log.info("Transaction count to process: {}", txList.size());

                IntStream.range(0, txList.size())
                        .forEach(idx -> {
                            if (idx == 0) {
                                // Creating header row
                                Row row = sheet.createRow(0);
                                for (int i = 0; i < allColumnNames.size(); i++) {
                                    row.createCell(i).setCellValue(allColumnNames.get(i));
                                }
                            }

                            log.info("Transaction to process: {}", txList.get(idx));

                            Row dataRow = sheet.createRow(idx + 1);
                            Transaction baseTx = txList.get(idx);
                            dataRow.createCell(allColumnNames.indexOf("Transaction id")).setCellValue(baseTx.getId());
                            dataRow.createCell(allColumnNames.indexOf("Username")).setCellValue(baseTx.getUsername());
                            dataRow.createCell(allColumnNames.indexOf("Creator Username")).setCellValue(baseTx.getCreator().getUsername());
                            dataRow.createCell(allColumnNames.indexOf("Date finished")).setCellValue(baseTx.getDateFinished());
                            dataRow.createCell(allColumnNames.indexOf("Type")).setCellValue(baseTx.getType().name());

                            switch (t) {
                                case CC2GOLD:
                                    CcToGoldTransaction ccToGoldTxPlaceHolder = (CcToGoldTransaction) (txList.get(idx));
                                    dataRow.createCell(allColumnNames.indexOf("CC Amount")).setCellValue(ccToGoldTxPlaceHolder.getCcAmount().doubleValue());
                                    dataRow.createCell(allColumnNames.indexOf("Gold per CC")).setCellValue(ccToGoldTxPlaceHolder.getGoldPerCC());
                                    dataRow.createCell(allColumnNames.indexOf("Gold paid")).setCellValue(ccToGoldTxPlaceHolder.getGoldPaid());
                                    break;
                                case GOLD2PHP:
                                    GoldToPhpTransaction goldToPhpTransaction = (GoldToPhpTransaction) (txList.get(idx));
                                    dataRow.createCell(allColumnNames.indexOf("Name")).setCellValue(goldToPhpTransaction.getName());
                                    dataRow.createCell(allColumnNames.indexOf("Php paid")).setCellValue(goldToPhpTransaction.getPhpPaid());
                                    dataRow.createCell(allColumnNames.indexOf("Gold per php")).setCellValue(goldToPhpTransaction.getGoldPerPhp());
                                    dataRow.createCell(allColumnNames.indexOf("Method of payment")).setCellValue(goldToPhpTransaction.getMethodOfPayment());
                                    break;
                                case ITEM2GOLD:
                                    ItemToGoldTransaction itemToGoldTransaction = (ItemToGoldTransaction) (txList.get(idx));
                                    dataRow.createCell(allColumnNames.indexOf("Item name")).setCellValue(itemToGoldTransaction.getItemName());
                                    dataRow.createCell(allColumnNames.indexOf("Item quantity")).setCellValue(itemToGoldTransaction.getItemQuantity());
                                    dataRow.createCell(allColumnNames.indexOf("Item price in gold")).setCellValue(itemToGoldTransaction.getItemPriceInGold());
                                    break;
                            }
                        });

                // Making size of the column auto resize to fit data
                for (int i = 0; i < allColumnNames.size(); i++) {
                    sheet.autoSizeColumn(i);
                }
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        } catch (IOException e) {
            throw new ApiException("Something went wrong when converting transactions to excel file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public Set<Transaction> excelToList(MultipartFile file) {
        return null;
    }

}
