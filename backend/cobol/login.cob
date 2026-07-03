IDENTIFICATION DIVISION.
PROGRAM-ID. LOGIN-CLEARANCE.

ENVIRONMENT DIVISION.
DATA DIVISION.
WORKING-STORAGE SECTION.
01 LK-ROLE          PIC X(20).

PROCEDURE DIVISION.
    ACCEPT LK-ROLE FROM COMMAND-LINE.

    *> Confirm systemic operational matching bounds
    IF LK-ROLE = "customer" OR LK-ROLE = "hospital" OR LK-ROLE = "admin"
        DISPLAY '{"status": "ALLOWED", "message": "Role verification checks complete."}'
    ELSE
        DISPLAY '{"status": "DENIED", "message": "Unrecognized systemic membership classification."}'
    END-IF.
    
    GOBACK.