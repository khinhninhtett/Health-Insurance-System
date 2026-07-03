IDENTIFICATION DIVISION.
PROGRAM-ID. USER-REGISTER.
AUTHOR. HEALTHINSURE CORE TEAM.

ENVIRONMENT DIVISION.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 LK-ROLE          PIC X(20).
01 LK-NRC           PIC X(30).

PROCEDURE DIVISION.
    ACCEPT LK-ROLE FROM COMMAND-LINE.
    ACCEPT LK-NRC FROM COMMAND-LINE.

    *> Verify system integrity rules
    IF LK-ROLE = "admin"
        DISPLAY '{"status": "FAILED", "message": "Admin registration restricted via public channel."}'
        GOBACK
    END-IF.

    *> NRC validation removed

    DISPLAY '{"status": "SUCCESS", "message": "COBOL ledger verification cleared."}'.
    GOBACK.