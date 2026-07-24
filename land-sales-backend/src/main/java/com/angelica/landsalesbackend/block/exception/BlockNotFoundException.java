package com.angelica.landsalesbackend.block.exception;

import com.angelica.landsalesbackend.shared.exception.ResourceNotFoundException;

public class BlockNotFoundException extends ResourceNotFoundException {

    public BlockNotFoundException() {
        super("Block not found");
    }
}
