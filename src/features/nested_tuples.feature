Feature: Nested Tuples

  Scenario: Nested Tuple 1
    Given that a nested tuple1 is defined as ((1)) using U32 numeric value
    Then the first element of the tuple1 is (1)
    And the tuple1 bytes are "01000000"

  Scenario: Nested Tuple 2
    Given that a nested tuple2 is defined as (1, (2, (3, 4))) using U32 numeric value
    Then the first element of the tuple2 is 1
    And the second element of the tuple2 is (2, (3, 4))
    And the tuple2 bytes are "01000000020000000300000004000000"

  Scenario: Nested Tuple 3
    Given that a nested tuple3 is defined as (1, 2, (3, 4, (5, 6, 7))) using U32 numeric value
    Then the first element of the tuple3 is 1
    Then the second element of the tuple3 is 2
    And the third element of the tuple3 is (3, 4, (5, 6, 7))
    And the tuple2 bytes are "01000000020000000300000004000000"
