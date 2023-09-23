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
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.IntStream;

@Service
@Slf4j
public class TransactionService implements IExcelService<Transaction> {

    private static final String CLASS_NAME = TransactionService.class.getName();
    private static final List<String> baseTxColumnNames = List.of("Transaction id", "Username", "Creator Username", "Date finished", "Is Reversed", "Type");
    private static final List<String> ccToGoldTxColumnNames = List.of("CC Amount", "Gold per CC", "Gold paid");
    private static final List<String> goldToPhpTxColumnNames = List.of("Name", "Php paid", "Gold per php", "Method of payment");
    private static final List<String> itemToGoldColumnNames = List.of("Item name", "Item quantity", "Item price in gold");
    private static final List<TransactionType> txTypes = List.of(TransactionType.CC2GOLD, TransactionType.GOLD2PHP, TransactionType.ITEM2GOLD);

    @Autowired
    private TransactionRepository transactionRepository;
    @Autowired
    private Validator validator;
    @Autowired
    private AccountService accountService;

    @Transactional
    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating transaction {}", transaction);
        Account account = accountService.getAccountByUsername(transaction.getCreator().getUsername());
        transaction.setCreator(account);
        transaction.setDateFinished(transaction.getDateFinished() != null ? transaction.getDateFinished() : ZonedDateTime.now());

        transaction.setTransactionItems(Transaction.convertTransactionItems(transaction));
        validateTransaction(transaction);
        return transactionRepository.save(transaction);
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

    public Transaction updateTransaction(String id, Transaction updatedTx) {
        final String METHOD_NAME = "updateTransaction";
        log.info("Inside {} of {} with inputs {} and {}", METHOD_NAME, CLASS_NAME, id, updatedTx);
        var transactionToBeUpdated = getTransactionById(id);

        transactionToBeUpdated.update(updatedTx);
        validateTransaction(transactionToBeUpdated);
        return transactionRepository.save(transactionToBeUpdated);
    }

    public Transaction deleteTransaction(String id) {
        var transactionToBeDeleted = getTransactionById(id);
        transactionRepository.deleteById(transactionToBeDeleted.getId());
        return transactionToBeDeleted;
    }

    public List<Transaction> getTransactionsByCreatorUsername(String username) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorId(account.getId());
    }

    public Page<Transaction> getTransactionPageByCreatorUsernameTypeAndDateFinished(String username,
                                                                                    List<TransactionType> txTypes,
                                                                                    ZonedDateTime afterDate,
                                                                                    ZonedDateTime beforeDate,
                                                                                    int pageNumber,
                                                                                    int pageSize) {
        Account account = accountService.getAccountByUsername(username);
        log.info("Username: {}, txTypes: {}, afterDate: {}, beforeDate: {}. pageNumber: {}, pageSize: {}", username, txTypes, afterDate, beforeDate, pageNumber, pageSize);
        Page<Transaction> transaction = transactionRepository.findOwnTransactionsUsingDateFinishedAndTxType(account.getId(), txTypes, afterDate, beforeDate, PageRequest.of(pageNumber - 1, pageSize).withSort(Sort.by("dateFinished").descending()));
        log.info("Transactions: {}", transaction.getContent());
        return transaction;
    }

    public List<Transaction> getTransactionByCreatorUsernameAndDateBetween(String username, ZonedDateTime afterDate, ZonedDateTime beforeDate) {
        Account account = accountService.getAccountByUsername(username);
        return transactionRepository.findByCreatorIdAndDateFinishedBetween(account.getId(), afterDate, beforeDate);
    }

    public void validateTransaction(Transaction transaction) {
        Set<ConstraintViolation<Transaction>> violations = validator.validate(transaction);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException("Invalid CcToGoldTransaction", violations);
        }

        switch (transaction.getType()) {
            case GOLD2PHP -> {
                for (TransactionItem t : transaction.getTransactionItems()) {
                    Set<ConstraintViolation<GoldToPhpTransactionItem>> constraintViolations1 = validator.validate((GoldToPhpTransactionItem) t);
                    if (!constraintViolations1.isEmpty()) {
                        throw new ConstraintViolationException("Invalid GoldToPhpTransaction item", violations);
                    }
                }
            }
            case CC2GOLD -> {
                for (TransactionItem t : transaction.getTransactionItems()) {
                    Set<ConstraintViolation<CcToGoldTransactionItem>> constraintViolations2 = validator.validate((CcToGoldTransactionItem) t);
                    if (!constraintViolations2.isEmpty()) {
                        throw new ConstraintViolationException("Invalid CcToGoldTransaction item", violations);
                    }
                }
            }
            case ITEM2GOLD -> {
                for (TransactionItem t : transaction.getTransactionItems()) {
                    Set<ConstraintViolation<ItemToGoldTransactionItem>> constraintViolations3 = validator.validate((ItemToGoldTransactionItem) t);
                    if (!constraintViolations3.isEmpty()) {
                        throw new ConstraintViolationException("Invalid ItemToGoldTransaction item", violations);
                    }
                }
            }
            default -> throw new ApiException("No transaction type specified", HttpStatus.BAD_REQUEST);
        }
    }

    @Override
    public ByteArrayInputStream listToExcel(List<Transaction> transactions) {
        try (Workbook workbook = new XSSFWorkbook()) {
            log.info("Iterating to each TransactionType");
            for (TransactionType t : txTypes) {
                log.info("Creating sheet for transaction type {}", t.name());
                Sheet sheet = workbook.createSheet(t.name());
                // Filter based on transaction type
                List<Transaction> txList = transactions.stream().filter(tx -> tx.getType().name().equals(t.name())).toList();
                List<String> allColumnNames = new ArrayList<>(baseTxColumnNames);
                // Populating the column names based on transaction type
                switch (t) {
                    case CC2GOLD -> allColumnNames.addAll(ccToGoldTxColumnNames);
                    case GOLD2PHP -> allColumnNames.addAll(goldToPhpTxColumnNames);
                    case ITEM2GOLD -> allColumnNames.addAll(itemToGoldColumnNames);
                }

                log.info("Transaction count to process: {}", txList.size());

                int currRow = 0;

                // create header row
                Row row = sheet.createRow(0);
                for (int i = 0; i < allColumnNames.size(); i++) {
                    row.createCell(i).setCellValue(allColumnNames.get(i));
                }
                currRow++;

                for (Transaction transaction : txList) {
                    if (transaction.getTransactionItems() == null || transaction.getTransactionItems().isEmpty())
                        continue;
                    for (TransactionItem item : transaction.getTransactionItems()) {
                        log.info("Transaction to process for type {}: {}", t.name(), transaction);

                        log.info("Added basic transaction info into the Row");
                        Row dataRow = sheet.createRow(currRow);

                        dataRow.createCell(allColumnNames.indexOf("Transaction id")).setCellValue(transaction.getId());
                        dataRow.createCell(allColumnNames.indexOf("Username")).setCellValue(transaction.getUsername());
                        dataRow.createCell(allColumnNames.indexOf("Creator Username")).setCellValue(transaction.getCreator().getUsername());
                        dataRow.createCell(allColumnNames.indexOf("Date finished")).setCellValue(DateTimeFormatter.ISO_ZONED_DATE_TIME.format(transaction.getDateFinished()));
                        dataRow.createCell(allColumnNames.indexOf("Is Reversed")).setCellValue(transaction.isReversed());
                        dataRow.createCell(allColumnNames.indexOf("Type")).setCellValue(transaction.getType().name());

                        // insert file attachments
                        log.info("Adding file attachment info into the Row");
                        int startColumn = allColumnNames.size();
                        if (transaction.getFileAttachments() != null && !transaction.getFileAttachments().isEmpty()) {
                            for (FileAttachment f : transaction.getFileAttachments()) {
                                dataRow.createCell(startColumn).setCellValue(f.getFileName());
                                dataRow.createCell(startColumn + 1).setCellValue(f.getFileUrl());
                                startColumn = startColumn + 2;
                            }
                        }

                        // based on the type, we will add different data
                        log.info("Adding transaction type specific data into the Row");
                        switch (t) {
                            case CC2GOLD:
                                CcToGoldTransactionItem ccToGoldTxItem = new CcToGoldTransactionItem(item);
                                dataRow.createCell(allColumnNames.indexOf("CC Amount")).setCellValue(ccToGoldTxItem.getCcAmount().doubleValue());
                                dataRow.createCell(allColumnNames.indexOf("Gold per CC")).setCellValue(ccToGoldTxItem.getGoldPerCC());
                                dataRow.createCell(allColumnNames.indexOf("Gold paid")).setCellValue(ccToGoldTxItem.getGoldPaid());
                                break;
                            case GOLD2PHP:
                                GoldToPhpTransactionItem goldToPhpTxItem = new GoldToPhpTransactionItem(item);
                                dataRow.createCell(allColumnNames.indexOf("Name")).setCellValue(goldToPhpTxItem.getName());
                                dataRow.createCell(allColumnNames.indexOf("Php paid")).setCellValue(goldToPhpTxItem.getPhpPaid());
                                dataRow.createCell(allColumnNames.indexOf("Gold per php")).setCellValue(goldToPhpTxItem.getGoldPerPhp());
                                dataRow.createCell(allColumnNames.indexOf("Method of payment")).setCellValue(goldToPhpTxItem.getMethodOfPayment());
                                break;
                            case ITEM2GOLD:
                                ItemToGoldTransactionItem itemToGoldTxItem = new ItemToGoldTransactionItem(item);
                                log.info("ItemToGoldTxItem: {}", itemToGoldTxItem);
                                dataRow.createCell(allColumnNames.indexOf("Item name")).setCellValue(itemToGoldTxItem.getItemName());
                                dataRow.createCell(allColumnNames.indexOf("Item quantity")).setCellValue(itemToGoldTxItem.getItemQuantity());
                                dataRow.createCell(allColumnNames.indexOf("Item price in gold")).setCellValue(itemToGoldTxItem.getItemPriceInGold());
                                break;
                        }

                        currRow++;
                    }
//                 Making size of the column auto resize to fit data
//                 log.info("Auto resizing the columns");
//                 for (int i = 0; i < allColumnNames.size(); i++) {
//                    sheet.autoSizeColumn(i+1);
//                 }

                }
            }

            // Returning the byte array input stream from the Workbook
            log.info("Writing contents of Workbook into OutputStream and passing it in InputStream");
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        } catch (IOException ex) {
            throw new ApiException("Something went wrong when converting transactions to excel file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public List<Transaction> excelToList(MultipartFile file) {
        final String methodName = "excelToList";
        log.info("Entering method {}", methodName);

        // placeholder for transactions
        Map<String, Transaction> transactionMap = new HashMap<>();

        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            for (TransactionType t : txTypes) {
                Sheet sheet = workbook.getSheet(t.name());
                List<String> allColumnNames = new ArrayList<>(baseTxColumnNames);

                for (int i = 0; i < sheet.getPhysicalNumberOfRows(); i++) {
                    if(i == 0) continue; // HEADER, SKIP ROW
                    Row row = sheet.getRow(i);

                    // get id
                    String txId = row.getCell(allColumnNames.indexOf("Transaction id")).getStringCellValue();

                    // check if transaction already exist
                    Transaction transaction = null;
                    Transaction txInMap = transactionMap.getOrDefault(txId, null);
                    if(txInMap == null) {
                        // get common transaction info
                        String username = row.getCell(allColumnNames.indexOf("Username")).getStringCellValue();
                        String creatorUsername = row.getCell(allColumnNames.indexOf("Creator Username")).getStringCellValue();
                        ZonedDateTime dateFinished = ZonedDateTime.ofInstant(Instant.parse(row.getCell(allColumnNames.indexOf("Date finished")).getStringCellValue()), ZoneOffset.UTC);
                        String type = row.getCell(allColumnNames.indexOf("Type")).getStringCellValue();
                        boolean isReversed = row.getCell(allColumnNames.indexOf("Is Reversed")).getBooleanCellValue();

                        Transaction newTx = new Transaction();
                        Account account = new Account();
                        account.setUsername(creatorUsername);
                        newTx.setCreator(account);
                        newTx.setUsername(username);
                        newTx.setDateFinished(dateFinished);
                        newTx.setReversed(isReversed);
                        newTx.setType(TransactionType.getTransactionType(type));
                        newTx.setId(txId);
                        transactionMap.put(txId, newTx);
                    }
                    transaction = transactionMap.get(txId);

                    // initialize Transaction's items
                    if(transaction.getTransactionItems() == null) transaction.setTransactionItems(new ArrayList<>());

                    // initialize Transaction's file attachhments
                    if(transaction.getFileAttachments() == null) transaction.setFileAttachments(new ArrayList<>());

                    // get transaction type specific information
                    switch (t) {
                        case GOLD2PHP:
                            allColumnNames.addAll(goldToPhpTxColumnNames);

                            String name = row.getCell(allColumnNames.indexOf("Name")).getStringCellValue();
                            Double phpPaid = row.getCell(allColumnNames.indexOf("Php paid")).getNumericCellValue();
                            Double goldPerPhp = row.getCell(allColumnNames.indexOf("Gold per php")).getNumericCellValue();
                            String methodOfPayment = row.getCell(allColumnNames.indexOf("Method of payment")).getStringCellValue();

                            GoldToPhpTransactionItem goldToPhpTransactionItem = new GoldToPhpTransactionItem();
                            goldToPhpTransactionItem.setName(name);
                            goldToPhpTransactionItem.setPhpPaid(phpPaid);
                            goldToPhpTransactionItem.setGoldPerPhp(goldPerPhp);
                            goldToPhpTransactionItem.setMethodOfPayment(methodOfPayment);

                            transaction.getTransactionItems().add(goldToPhpTransactionItem);
                            break;
                        case ITEM2GOLD:
                            allColumnNames.addAll(itemToGoldColumnNames);

                            String itemName = row.getCell(allColumnNames.indexOf("Item name")).getStringCellValue();
                            Long itemQuantity = (long) row.getCell(allColumnNames.indexOf("Item quantity")).getNumericCellValue();
                            Double itemPriceInGold = row.getCell(allColumnNames.indexOf("Item price in gold")).getNumericCellValue();

                            ItemToGoldTransactionItem itemToGoldTransactionItem = new ItemToGoldTransactionItem();
                            itemToGoldTransactionItem.setItemName(itemName);
                            itemToGoldTransactionItem.setItemQuantity(itemQuantity);
                            itemToGoldTransactionItem.setItemPriceInGold(itemPriceInGold);

                            transaction.getTransactionItems().add(itemToGoldTransactionItem);
                            break;
                        case CC2GOLD:
                            allColumnNames.addAll(ccToGoldTxColumnNames);

                            BigDecimal ccAmount = BigDecimal.valueOf(row.getCell(allColumnNames.indexOf("CC Amount")).getNumericCellValue());
                            Double goldPerCc = row.getCell(allColumnNames.indexOf("Gold per CC")).getNumericCellValue();
                            Double goldPaid = row.getCell(allColumnNames.indexOf("Gold paid")).getNumericCellValue();

                            CcToGoldTransactionItem ccToGoldTransactionItem = new CcToGoldTransactionItem();
                            ccToGoldTransactionItem.setCcAmount(ccAmount);
                            ccToGoldTransactionItem.setGoldPaid(goldPaid);
                            ccToGoldTransactionItem.setGoldPerCC(goldPerCc);

                            transaction.getTransactionItems().add(ccToGoldTransactionItem);
                            break;
                    }

                    // check file attachment info if it exists
                    if (!transaction.getFileAttachments().isEmpty()) continue;

                    // Add fileAttachment information in the Transaction object
                    int fileAttColCellStart = allColumnNames.size(); // 0th indexed
                    int lastAttColCellEnd = row.getLastCellNum() -1; // 1st indexed
                    List<FileAttachment> fileAttachments = new ArrayList<>();
                    for(int j = fileAttColCellStart; j < lastAttColCellEnd; j = j+2) {
                        // row.getCell(0) is the first column
                        String fileName = row.getCell(j).getStringCellValue();
                        String fileUrl = row.getCell(j+1).getStringCellValue();
                        FileAttachment fileAttachment = new FileAttachment();
                        fileAttachment.setFileName(fileName);
                        fileAttachment.setFileUrl(fileUrl);
                        fileAttachments.add(fileAttachment);
                    }
                    transaction.setFileAttachments(fileAttachments);
                }
            }
            return transactionMap.values().stream().toList();
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new ApiException("Something went wrong when converting Excel file to Transactions", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public int addOrUpdate(List<Transaction> transactions, boolean overwrite) {
        final int[] itemsAffected = {0};
        for (Transaction tx : transactions) {
            log.info("Transaction to add or update: {}", tx);
            log.info("Tx id: {}", tx.getId());
            transactionRepository.findById(tx.getId()).ifPresentOrElse(txDb -> {
                // if present already in db and override is true, update
                log.info("Updating the transaction from database");
                if (overwrite) {
                    if (!txDb.getCreator().getUsername().equals(tx.getCreator().getUsername())) {
                        throw new ApiException("You can't update transactions from other users", HttpStatus.FORBIDDEN);
                    }
                    updateTransaction(txDb.getId(), tx);
                    itemsAffected[0]++;
                }
            }, () -> {
                log.info("Adding the transaction to the database");
                createTransaction(tx);
                itemsAffected[0]++;
            });
        }
        return itemsAffected[0];
    }
}
