IDENTIFICATION DIVISION.
PROGRAM-ID. VERIFY-PROFILE.
AUTHOR. HEALTHINSURE CORE TEAM.

ENVIRONMENT DIVISION.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 LK-NRC               PIC X(30).
01 LK-NRC-FRONT-PHOTO    PIC X(1).
01 LK-NRC-BACK-PHOTO     PIC X(1).
01 LK-PROFILE-PHOTO      PIC X(1).
01 LK-ADDRESS-PRESENT    PIC X(1).
01 LK-AGE                PIC 9(3).
01 WS-NRC-TRIMMED       PIC X(30).
01 WS-NRC-LENGTH        PIC 9(3).

PROCEDURE DIVISION.
    DISPLAY 1 UPON ARGUMENT-NUMBER.
    ACCEPT LK-NRC FROM ARGUMENT-VALUE.

    DISPLAY 2 UPON ARGUMENT-NUMBER.
    ACCEPT LK-NRC-FRONT-PHOTO FROM ARGUMENT-VALUE.

    DISPLAY 3 UPON ARGUMENT-NUMBER.
    ACCEPT LK-NRC-BACK-PHOTO FROM ARGUMENT-VALUE.

    DISPLAY 4 UPON ARGUMENT-NUMBER.
    ACCEPT LK-PROFILE-PHOTO FROM ARGUMENT-VALUE.

    DISPLAY 5 UPON ARGUMENT-NUMBER.
    ACCEPT LK-ADDRESS-PRESENT FROM ARGUMENT-VALUE.

    DISPLAY 6 UPON ARGUMENT-NUMBER.
    ACCEPT LK-AGE FROM ARGUMENT-VALUE.

    MOVE FUNCTION TRIM(LK-NRC) TO WS-NRC-TRIMMED.
    MOVE FUNCTION LENGTH(FUNCTION TRIM(LK-NRC)) TO WS-NRC-LENGTH.

    *> Require a real-looking NRC value (closes the previously
    *> skipped NRC-validation gap from user registration).
    IF WS-NRC-TRIMMED = SPACES OR WS-NRC-LENGTH < 5
        DISPLAY '{"status": "REJECTED", "message": "NRC number is missing or too short."}'
        GOBACK
    END-IF.

    IF LK-NRC-FRONT-PHOTO NOT = "Y"
        DISPLAY '{"status": "REJECTED", "message": "NRC front photo was not uploaded."}'
        GOBACK
    END-IF.

    IF LK-NRC-BACK-PHOTO NOT = "Y"
        DISPLAY '{"status": "REJECTED", "message": "NRC back photo was not uploaded."}'
        GOBACK
    END-IF.

    IF LK-PROFILE-PHOTO NOT = "Y"
        DISPLAY '{"status": "REJECTED", "message": "Personal photo was not uploaded."}'
        GOBACK
    END-IF.

    IF LK-ADDRESS-PRESENT NOT = "Y"
        DISPLAY '{"status": "REJECTED", "message": "Address is required."}'
        GOBACK
    END-IF.

    IF LK-AGE < 18 OR LK-AGE > 120
        DISPLAY '{"status": "REJECTED", "message": "You must provide a valid date of birth and be at least 18 years old."}'
        GOBACK
    END-IF.

    DISPLAY '{"status": "VERIFIED", "message": "Identity verification checks complete."}'.
    GOBACK.
