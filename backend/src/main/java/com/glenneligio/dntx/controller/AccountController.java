package com.glenneligio.dntx.controller;

import com.glenneligio.dntx.dtos.*;
import com.glenneligio.dntx.enums.AccountType;
import com.glenneligio.dntx.exception.ApiException;
import com.glenneligio.dntx.model.Account;
import com.glenneligio.dntx.model.Transaction;
import com.glenneligio.dntx.service.AccountService;
import com.glenneligio.dntx.service.TransactionService;
import com.glenneligio.dntx.util.JwtUtil;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/v1/accounts")
@Slf4j
public class AccountController {

    @Autowired
    private AccountService accountService;
    @Autowired
    private TransactionService transactionService;
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{username}")
    public ResponseEntity<Account> getAccountByUsername(@PathVariable String username) {
        final String METHOD_NAME = "getAccountByUsername";
        log.info("Calling {} with username {}", METHOD_NAME, username);
        return ResponseEntity.ok(accountService.getAccountByUsername(username));
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody @Valid CreateAccountDto dto) {
        Account accountCreated = accountService.createAccount(dto.toAccount());
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                        .path("/{username}")
                        .buildAndExpand(accountCreated.getUsername())
                        .toUri())
                .body(accountCreated);
    }

    @PutMapping("/{username}")
    public ResponseEntity<Account> updateAccount(@PathVariable String username,
                                                 @RequestBody @Valid UpdateAccountDto dto) {
        return ResponseEntity.ok(accountService.updateAccount(username, dto.toAccount()));
    }

    @DeleteMapping("/{username}")
    public ResponseEntity<?> deleteAccount(@PathVariable String username) {
        accountService.deleteAccount(username);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto dto) {
        var account = accountService.login(dto.getUsername(), dto.getPassword());
        LoginResponseDto loginResponseDto = getLoginResponseDto(account);
        return ResponseEntity.ok(loginResponseDto);
    }

    @PostMapping("/register")
    public ResponseEntity<LoginResponseDto> register(@RequestBody @Valid RegisterRequestDto dto) {
        Account account = new Account();
        account.setFullName(dto.getFullName());
        account.setUsername(dto.getUsername());
        account.setEmail(dto.getEmail());
        account.setPassword(dto.getPassword());
        Account registeredAccount = accountService.register(account);
        LoginResponseDto loginResponseDto = getLoginResponseDto(registeredAccount);
        return ResponseEntity.ok(loginResponseDto);
    }

    @GetMapping("/@self")
    public ResponseEntity<Account> getOwnAccount(Authentication authentication) {
        log.info("Fetching own account details with principal {}", authentication.getPrincipal());
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        return ResponseEntity.ok(accountService.getAccountByUsername(username));
    }

    @PutMapping("/@self")
    public ResponseEntity<Account> updateOwnAccount(Authentication authentication,
                                                    @RequestBody @Valid UpdateAccountDto dto) {
        log.info("Updating own account using principal {}", authentication.getPrincipal());
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        Account account = dto.toAccount();
        account.setUsername(username);
        Account updatedAccount = accountService.updateAccount(username, account);
        return ResponseEntity.ok(updatedAccount);
    }

    @GetMapping("/@self/transactions")
    public ResponseEntity<TransactionPageDto> getAccountTransactions(@RequestParam(defaultValue = "1") int pageNumber,
                                                                    @RequestParam(defaultValue = "1") int pageSize,
                                                                    Authentication authentication) {
        log.info("Fetching own transactions with principal {}", authentication);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        Page<Transaction> transactionPage = transactionService.getTransactionPageByCreatorUsername(username, pageNumber, pageSize);
        TransactionPageDto transactionPageDto = new TransactionPageDto(transactionPage.getContent(),
                transactionPage.getTotalPages(),
                transactionPage.getTotalElements(),
                transactionPage.getNumber(),
                transactionPage.getSize());
        return ResponseEntity.ok(transactionPageDto);
    }

    @PostMapping("/@self/transactions")
    public ResponseEntity<Transaction> createAccountTransaction(@RequestBody @Valid CreateUpdateTransactionDto dto,
                                                                Authentication authentication) {
        log.info("Creating own transaction with principal {}, and transaction {}", authentication.getPrincipal(), dto);
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        Transaction transaction = dto.toTransaction();
        transaction.setCreator(new Account());
        transaction.getCreator().setUsername(username);
        Transaction transactionCreated = transactionService.createTransaction(transaction);
        return ResponseEntity.created(ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(transactionCreated.getId())
                .toUri())
                .body(transactionCreated);
    }

    @PutMapping("/@self/transactions/{id}")
    public ResponseEntity<Transaction> updateOwnTransaction(@PathVariable String id,
                                                            @RequestBody @Valid CreateUpdateTransactionDto dto,
                                                            Authentication authentication) {
        log.info("Updating own transaction with id {}, and transaction info {}", id, dto);
        checkIfOwnTransaction(authentication, id, "You can only update your own transactions");
        Transaction transactionUpdated = transactionService.updateTransaction(id, dto.toTransaction());
        return ResponseEntity.ok(transactionUpdated);
    }

    @DeleteMapping("/@self/transactions/{id}")
    public ResponseEntity<Transaction> deleteOwnTransaction(@PathVariable String id,
                                                            Authentication authentication) {
        log.info("Delete own transaction with id {}", id);
        checkIfOwnTransaction(authentication, id, "You can only delete your own transactions");
        transactionService.deleteTransaction(id);
        return ResponseEntity.ok().build();
    }

    private void checkIfOwnTransaction(Authentication authentication, String id, String message) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Transaction transactionToBeUpdated = transactionService.getTransactionById(id);
        if (!transactionToBeUpdated.getCreator().getUsername().equals(userDetails.getUsername())) {
            throw new ApiException(message, HttpStatus.UNAUTHORIZED);
        }
    }


    private LoginResponseDto getLoginResponseDto(Account account) {
        var dnTxUserDetails = new DnTxUserDetails(account);
        var accessToken = jwtUtil.generateToken(dnTxUserDetails);
        var refreshToken = jwtUtil.generateRefreshToken(dnTxUserDetails);
        return LoginResponseDto.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accountType(account.getAccountType().getType())
                .fullName(account.getFullName())
                .username(account.getUsername())
                .build();
    }

}
