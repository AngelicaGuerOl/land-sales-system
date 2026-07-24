package com.angelica.landsalesbackend.block.exception;

import java.util.List;

public class BulkLotConflictException extends RuntimeException {

    private final List<String> conflicts;

    public BulkLotConflictException(String message, List<String> conflicts) {
        super(message);
        this.conflicts = List.copyOf(conflicts);
    }

    public List<String> getConflicts() {
        return conflicts;
    }
}
