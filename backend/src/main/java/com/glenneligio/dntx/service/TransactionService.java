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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.IntStream;

@Service
@Slf4j
public class TransactionService implements IExcelService<Transaction> {

    private static final String CLASS_NAME = TransactionService.class.getName();
    private static final List<String> baseTxColumnNames = List.of("Transaction id", "Username", "Creator Username", "Date finished", "Type");
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

    public Transaction createTransaction(Transaction transaction) {
        log.info("Creating transaction {}", transaction);
        Account account = accountService.getAccountByUsername(transaction.getCreator().getUsername());
        transaction.setCreator(account);
        transaction.setDateFinished(transaction.getDateFinished() != null ? transaction.getDateFinished() : LocalDateTime.now());

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

    public Transaction updateTransaction(String id, Transaction updatedTx) {
        final String METHOD_NAME = "updateTransaction";
        log.info("Inside {} of {} with inputs {} and {}", METHOD_NAME, CLASS_NAME, id, updatedTx);
        var transactionToBeUpdated = getTransactionById(id);

        // Check specified instance type of transaction, since each have different fields to update
        if (transactionToBeUpdated instanceof GoldToPhpTransaction goldToPhpTransaction) {
            log.info("Transaction is a Gold2Php tx");
            goldToPhpTransaction.updateGold2Php(new GoldToPhpTransaction(updatedTx));
            validateGoldToPhpTransaction(goldToPhpTransaction);
            return transactionRepository.save(goldToPhpTransaction);
        } else if (transactionToBeUpdated instanceof CcToGoldTransaction ccToGoldTransaction) {
            log.info("Transaction is a Cc2Gold tx");
            ccToGoldTransaction.updateCcToGold(new CcToGoldTransaction(updatedTx));
            validateCcToGoldTransaction(ccToGoldTransaction);
            return transactionRepository.save(ccToGoldTransaction);
        } else if (transactionToBeUpdated instanceof ItemToGoldTransaction itemToGoldTransaction) {
            log.info("Transaction is a ITEM2GOLD tx");
            itemToGoldTransaction.updateItemToGold(new ItemToGoldTransaction(updatedTx));
            validateItemToGoldTransaction(itemToGoldTransaction);
            return transactionRepository.save(itemToGoldTransaction);
        } else {
            transactionToBeUpdated.update(updatedTx);
            log.info("Transaction type is not defined");
            return transactionRepository.save(transactionToBeUpdated);
        }
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
        try (Workbook workbook = new XSSFWorkbook()) {
            log.info("Iterating to each TransactionType");
            for (TransactionType t : txTypes) {
                log.info("Creating sheet for transaction type {}", t.name());
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

                            log.info("Transaction to process for type {}: {}", t.name() ,txList.get(idx));

                            log.info("Added basic transaction info into the Row");
                            Row dataRow = sheet.createRow(idx + 1);
                            Transaction baseTx = txList.get(idx);
                            dataRow.createCell(allColumnNames.indexOf("Transaction id")).setCellValue(baseTx.getId());
                            dataRow.createCell(allColumnNames.indexOf("Username")).setCellValue(baseTx.getUsername());
                            dataRow.createCell(allColumnNames.indexOf("Creator Username")).setCellValue(baseTx.getCreator().getUsername());
                            dataRow.createCell(allColumnNames.indexOf("Date finished")).setCellValue(DateTimeFormatter.ISO_LOCAL_DATE_TIME.format(baseTx.getDateFinished()));
                            dataRow.createCell(allColumnNames.indexOf("Type")).setCellValue(baseTx.getType().name());

                            // insert file attachments
                            log.info("Adding file attachment info into the Row");
                            int startColumn = allColumnNames.size();
                            if(baseTx.getFileAttachments() != null && !baseTx.getFileAttachments().isEmpty()) {
                                for(FileAttachment f: baseTx.getFileAttachments()) {
                                    dataRow.createCell(startColumn).setCellValue(f.getFileName());
                                    dataRow.createCell(startColumn + 1).setCellValue(f.getFileUrl());
                                    startColumn = startColumn +2;
                                }
                            }

                            // based on the type, we will add different data
                            log.info("Adding transaction type specific data into the Row");
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

//                 Making size of the column auto resize to fit data
//                 log.info("Auto resizing the columns");
//                 for (int i = 0; i < allColumnNames.size(); i++) {
//                    sheet.autoSizeColumn(i+1);
//                 }

            }

            // Returning the byte array input stream from the Workbook
            log.info("Writing contents of Workbook into OutputStream and passing it in InputStream");
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return new ByteArrayInputStream(outputStream.toByteArray());
        } catch (IOException e) {
            throw new ApiException("Something went wrong when converting transactions to excel file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public List<Transaction> excelToList(MultipartFile file) {
        final String methodName = "excelToList";
        log.info("Entering method {}", methodName);
        List<Transaction> transactions = new ArrayList<>();
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            for(TransactionType t: txTypes) {
                Sheet sheet = workbook.getSheet(t.name());
                List<String> allColumnNames = new ArrayList<>(baseTxColumnNames);

                switch (t) {
                    case GOLD2PHP:
                        allColumnNames.addAll(goldToPhpTxColumnNames);
                        for (int i = 0; i < sheet.getPhysicalNumberOfRows(); i++) {
                            if(i == 0) continue; // HEADER, SKIP THE ROW
                            GoldToPhpTransaction goldToPhpTransaction = new GoldToPhpTransaction();
                            Row row = sheet.getRow(i);
                            String txId = row.getCell(allColumnNames.indexOf("Transaction id")).getStringCellValue();
                            String username = row.getCell(allColumnNames.indexOf("Username")).getStringCellValue();
                            String creatorUsername = row.getCell(allColumnNames.indexOf("Creator Username")).getStringCellValue();
                            LocalDateTime dateFinished = LocalDateTime.parse(row.getCell(allColumnNames.indexOf("Date finished")).getStringCellValue(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            String name = row.getCell(allColumnNames.indexOf("Name")).getStringCellValue();
                            Double phpPaid = row.getCell(allColumnNames.indexOf("Php paid")).getNumericCellValue();
                            Double goldPerPhp = row.getCell(allColumnNames.indexOf("Gold per php")).getNumericCellValue();
                            String methodOfPayment = row.getCell(allColumnNames.indexOf("Method of payment")).getStringCellValue();

                            // Check if there are existing columns with value for file attachments
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

                            goldToPhpTransaction.setId(txId);
                            Account account = new Account();
                            account.setUsername(creatorUsername);
                            goldToPhpTransaction.setCreator(account);
                            goldToPhpTransaction.setType(TransactionType.GOLD2PHP);
                            goldToPhpTransaction.setUsername(username);
                            goldToPhpTransaction.setDateFinished(dateFinished);
                            goldToPhpTransaction.setName(name);
                            goldToPhpTransaction.setPhpPaid(phpPaid);
                            goldToPhpTransaction.setGoldPerPhp(goldPerPhp);
                            goldToPhpTransaction.setMethodOfPayment(methodOfPayment);
                            goldToPhpTransaction.setFileAttachments(fileAttachments);
                            transactions.add(goldToPhpTransaction);
                        }
                        break;
                    case CC2GOLD:
                        allColumnNames.addAll(ccToGoldTxColumnNames);
                        for (int i = 0; i < sheet.getPhysicalNumberOfRows(); i++) {
                            if(i == 0) continue;
                            CcToGoldTransaction ccToGoldTransaction = new CcToGoldTransaction();

                            Row row = sheet.getRow(i);
                            String txId = row.getCell(allColumnNames.indexOf("Transaction id")).getStringCellValue();
                            String username = row.getCell(allColumnNames.indexOf("Username")).getStringCellValue();
                            String creatorUsername = row.getCell(allColumnNames.indexOf("Creator Username")).getStringCellValue();
                            LocalDateTime dateFinished = LocalDateTime.parse(row.getCell(allColumnNames.indexOf("Date finished")).getStringCellValue(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            BigDecimal ccAmount = BigDecimal.valueOf(row.getCell(allColumnNames.indexOf("CC Amount")).getNumericCellValue());
                            Double goldPerCc = row.getCell(allColumnNames.indexOf("Gold per CC")).getNumericCellValue();
                            Double goldPaid = row.getCell(allColumnNames.indexOf("Gold paid")).getNumericCellValue();

                            // Check if there are existing columns with value for file attachments
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

                            ccToGoldTransaction.setId(txId);
                            ccToGoldTransaction.setUsername(username);
                            Account account = new Account();
                            account.setUsername(creatorUsername);
                            ccToGoldTransaction.setCreator(account);
                            ccToGoldTransaction.setDateFinished(dateFinished);
                            ccToGoldTransaction.setType(TransactionType.CC2GOLD);
                            ccToGoldTransaction.setCcAmount(ccAmount);
                            ccToGoldTransaction.setGoldPaid(goldPaid);
                            ccToGoldTransaction.setGoldPerCC(goldPerCc);
                            ccToGoldTransaction.setFileAttachments(fileAttachments);
                            transactions.add(ccToGoldTransaction);
                        }
                        break;
                    case ITEM2GOLD:
                        allColumnNames.addAll(itemToGoldColumnNames);
                        for (int i = 0; i < sheet.getPhysicalNumberOfRows(); i++) {
                            if(i == 0) continue;
                            ItemToGoldTransaction itemToGoldTransaction = new ItemToGoldTransaction();

                            Row row = sheet.getRow(i);
                            String txId = row.getCell(allColumnNames.indexOf("Transaction id")).getStringCellValue();
                            String username = row.getCell(allColumnNames.indexOf("Username")).getStringCellValue();
                            String creatorUsername = row.getCell(allColumnNames.indexOf("Creator Username")).getStringCellValue();
                            LocalDateTime dateFinished = LocalDateTime.parse(row.getCell(allColumnNames.indexOf("Date finished")).getStringCellValue(), DateTimeFormatter.ISO_LOCAL_DATE_TIME);
                            String itemName = row.getCell(allColumnNames.indexOf("Item name")).getStringCellValue();
                            Long itemQuantity = (long) row.getCell(allColumnNames.indexOf("Item quantity")).getNumericCellValue();
                            Double itemPriceInGold = row.getCell(allColumnNames.indexOf("Item price in gold")).getNumericCellValue();

                            // Check if there are existing columns with value for file attachments
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

                            itemToGoldTransaction.setId(txId);
                            itemToGoldTransaction.setUsername(username);
                            Account account = new Account();
                            account.setUsername(creatorUsername);
                            itemToGoldTransaction.setType(TransactionType.ITEM2GOLD);
                            itemToGoldTransaction.setCreator(account);
                            itemToGoldTransaction.setDateFinished(dateFinished);
                            itemToGoldTransaction.setItemName(itemName);
                            itemToGoldTransaction.setItemQuantity(itemQuantity);
                            itemToGoldTransaction.setItemPriceInGold(itemPriceInGold);
                            itemToGoldTransaction.setFileAttachments(fileAttachments);

                            transactions.add(itemToGoldTransaction);
                        }
                        break;
                }
            }
            return transactions;
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new ApiException("Something went wrong when converting Excel file to Transactions", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Transactional
    public int addOrUpdate(List<Transaction> transactions, boolean overwrite) {
        final int[] itemsAffected = {0};
        for(Transaction tx: transactions) {
            log.info("Transaction to add or update: {}", tx);
            log.info("Tx id: {}", tx.getId());
            transactionRepository.findById(tx.getId()).ifPresentOrElse(txDb -> {
                // if present already in db and override is true, update
                log.info("Updating the transaction from database");
                if(overwrite) {
                    if(!txDb.getCreator().getUsername().equals(tx.getCreator().getUsername())) {
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
