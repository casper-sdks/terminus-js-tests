# features/bank-account.feature
Feature: Bank Account

  Scenario: Stores money
    Given A bank account with starting balance of $100
    When $100 is deposited
    Then The bank account balance should be $200